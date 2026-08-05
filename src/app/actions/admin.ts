'use server';

import { isAdminAuthenticated } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { STORAGE_BUCKET } from '@/lib/supabase/client';
import type { Order, Product } from '@/lib/types';

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error('No autorizado');
  }
}

export async function getAdminProducts(): Promise<Product[]> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getAdminOrders(): Promise<Order[]> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export type ProductInput = {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image_url: string;
  image_urls: string[];
  characteristics: Record<string, string>;
};

export async function saveProduct(
  product: ProductInput,
  editingId?: string
): Promise<{ success: true } | { success: false; error: string }> {
  await requireAdmin();

  const supabase = createServiceClient();
  const productData = {
    ...product,
    available: product.stock > 0,
  };

  const { error } = editingId
    ? await supabase.from('products').update(productData).eq('id', editingId)
    : await supabase.from('products').insert(productData);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteProduct(
  productId: string
): Promise<{ success: true } | { success: false; error: string }> {
  await requireAdmin();

  const supabase = createServiceClient();
  const { error } = await supabase.from('products').delete().eq('id', productId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<{ success: true } | { success: false; error: string }> {
  await requireAdmin();

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteOrder(
  orderId: string
): Promise<{ success: true } | { success: false; error: string }> {
  await requireAdmin();

  const supabase = createServiceClient();
  const { error } = await supabase.from('orders').delete().eq('id', orderId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateProductStock(
  productId: string,
  stock: number
): Promise<{ success: true } | { success: false; error: string }> {
  await requireAdmin();

  if (stock < 0) {
    return { success: false, error: 'El stock no puede ser negativo' };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('products')
    .update({ stock, available: stock > 0 })
    .eq('id', productId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB (under the 10MB Server Action limit)
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export async function uploadProductImage(
  formData: FormData
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    await requireAdmin();

    const file = formData.get('file') as File | null;
    if (!file) return { success: false, error: 'No se recibió ningún archivo' };

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return {
        success: false,
        error: 'Formato no válido. Usa JPG, PNG, WEBP o GIF.',
      };
    }

    if (file.size > MAX_IMAGE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return {
        success: false,
        error: `La imagen pesa ${sizeMb} MB. El máximo permitido es 8 MB.`,
      };
    }

    const supabase = createServiceClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${safeName}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) return { success: false, error: error.message };

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
    return { success: true, url: data.publicUrl };
  } catch (err) {
    console.error('uploadProductImage error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error al subir la imagen',
    };
  }
}
