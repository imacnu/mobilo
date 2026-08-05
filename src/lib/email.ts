import { Resend } from 'resend';
import type { Order } from '@/lib/types';

const SHOP_NAME = 'Maria Amor 11B';

function formatPrice(amount: unknown) {
  const n = Number(amount);
  if (Number.isNaN(n)) return `0.00 €`;
  return `${n.toFixed(2)} €`;
}

function buildItemsHtml(order: Order) {
  return order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.name}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${formatPrice(Number(item.price) * item.quantity)}</td>
      </tr>`
    )
    .join('');
}

function buildOrderHtml(order: Order, title: string, intro: string) {
  const discountRow =
    order.discount > 0
      ? `<tr>
          <td colspan="2" style="padding:8px 0;color:#00B894;">Descuento (10%)</td>
          <td style="padding:8px 0;text-align:right;color:#00B894;">-${formatPrice(order.discount)}</td>
        </tr>`
      : '';

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#2D3436;">
      <h1 style="font-size:24px;margin-bottom:8px;">${title}</h1>
      <p style="color:#636E72;margin-bottom:24px;">${intro}</p>
      <p style="margin-bottom:16px;"><strong>Pedido:</strong> #${order.id.slice(0, 8)}</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="border-bottom:2px solid #DFE6E9;">
            <th style="text-align:left;padding:8px 0;">Producto</th>
            <th style="text-align:center;padding:8px 0;">Cant.</th>
            <th style="text-align:right;padding:8px 0;">Precio</th>
          </tr>
        </thead>
        <tbody>
          ${buildItemsHtml(order)}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px 0 4px;">Subtotal</td>
            <td style="padding:12px 0 4px;text-align:right;">${formatPrice(order.subtotal)}</td>
          </tr>
          ${discountRow}
          <tr>
            <td colspan="2" style="padding:8px 0;font-size:18px;"><strong>Total</strong></td>
            <td style="padding:8px 0;text-align:right;font-size:18px;"><strong>${formatPrice(order.total)}</strong></td>
          </tr>
        </tfoot>
      </table>
      <p style="color:#636E72;font-size:14px;">${SHOP_NAME} · Muebles, electrónica y decoración</p>
    </div>
  `;
}

type ResendError = { message: string; name?: string };

async function sendOne(
  resend: Resend,
  payload: { from: string; to: string; subject: string; html: string }
) {
  const { data, error } = await resend.emails.send(payload);
  if (error) {
    const err = error as ResendError;
    throw new Error(err.message || 'Resend send failed');
  }
  if (!data?.id) {
    throw new Error('Resend no devolvió id de email');
  }
  return data;
}

export async function sendOrderEmails(order: Order): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('RESEND_API_KEY no está configurada en el servidor');
  }

  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM?.trim() || 'Maria Amor 11B <onboarding@resend.dev>';
  const shopEmail = process.env.SHOP_EMAIL?.trim() || 'contacto@malco.es';

  const customerEmail = order.customer_email?.trim();
  if (!customerEmail) {
    throw new Error('El pedido no tiene email de cliente');
  }

  const customerHtml = buildOrderHtml(
    order,
    '¡Gracias por tu pedido!',
    `Hola ${order.customer_name}, hemos recibido tu pedido correctamente. Nos pondremos en contacto contigo pronto.`
  );

  const shopHtml = buildOrderHtml(
    order,
    'Nuevo pedido recibido',
    `Pedido de ${order.customer_name} (${order.customer_email})${order.customer_phone ? ` · Tel: ${order.customer_phone}` : ''}.`
  );

  const errors: string[] = [];

  try {
    await sendOne(resend, {
      from,
      to: customerEmail,
      subject: `Confirmación de pedido #${order.id.slice(0, 8)} — ${SHOP_NAME}`,
      html: customerHtml,
    });
  } catch (err) {
    errors.push(
      `cliente: ${err instanceof Error ? err.message : 'error desconocido'}`
    );
  }

  try {
    await sendOne(resend, {
      from,
      to: shopEmail,
      subject: `Nuevo pedido #${order.id.slice(0, 8)} — ${order.customer_name}`,
      html: shopHtml,
    });
  } catch (err) {
    errors.push(`tienda: ${err instanceof Error ? err.message : 'error desconocido'}`);
  }

  if (errors.length > 0) {
    throw new Error(errors.join(' | '));
  }
}
