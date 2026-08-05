import { createAnonServerClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types';

export async function getProducts(
  category?: string,
  search?: string
): Promise<Product[]> {
  const supabase = createAnonServerClient();

  let query = supabase
    .from('products')
    .select('*')
    .eq('available', true)
    .gt('stock', 0)
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching products:', error.message);
    return [];
  }
  return data || [];
}

export async function getInitialProducts(): Promise<Product[]> {
  return getProducts();
}
