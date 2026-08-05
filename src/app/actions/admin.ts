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
    available: true,
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

export async function uploadProductImage(
  formData: FormData
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  await requireAdmin();

  const file = formData.get('file') as File | null;
  if (!file) return { success: false, error: 'No se recibió ningún archivo' };

  const supabase = createServiceClient();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${file.name}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, file);

  if (error) return { success: false, error: error.message };

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
  return { success: true, url: data.publicUrl };
}
