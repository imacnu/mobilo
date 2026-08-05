'use server';

import { createServiceClient } from '@/lib/supabase/server';
import { sendOrderEmails } from '@/lib/email';
import type { CheckoutItem, Order } from '@/lib/types';

export type CheckoutResult =
  | {
      success: true;
      orderId: string;
      subtotal: number;
      discount: number;
      total: number;
      emailError?: string;
    }
  | { success: false; error: string };

export async function checkout(
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  items: CheckoutItem[]
): Promise<CheckoutResult> {
  if (!customerName.trim() || !customerEmail.trim()) {
    return { success: false, error: 'Nombre y email son obligatorios' };
  }

  if (!items.length) {
    return { success: false, error: 'El carrito está vacío' };
  }

  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase.rpc('create_order_with_stock', {
      p_customer_name: customerName.trim(),
      p_customer_email: customerEmail.trim(),
      p_customer_phone: customerPhone.trim() || null,
      p_items: items,
    });

    if (error) {
      const message = error.message.includes('Stock insuficiente')
        ? error.message
        : 'Error al procesar el pedido. Inténtalo de nuevo.';
      return { success: false, error: message };
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', data.order_id)
      .single();

    let emailError: string | undefined;
    if (orderError) {
      console.error('Error fetching order for emails:', orderError);
      emailError = orderError.message || 'No se pudo recuperar el pedido para el email';
    } else if (order) {
      try {
        await sendOrderEmails(order as Order);
      } catch (err) {
        console.error('Error sending order emails:', err);
        const message =
          err instanceof Error ? err.message : 'No se pudo enviar el email de confirmación';
        emailError = message;
      }
    } else {
      emailError = 'Pedido no encontrado después de crear la orden';
    }

    return {
      success: true,
      orderId: data.order_id,
      subtotal: Number(data.subtotal),
      discount: Number(data.discount),
      total: Number(data.total),
      emailError,
    };
  } catch {
    return { success: false, error: 'Error de conexión. Inténtalo más tarde.' };
  }
}

