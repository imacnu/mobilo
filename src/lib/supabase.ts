import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'images';

export async function uploadImage(file: File): Promise<string | null> {
  try {
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name}`;
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  image_urls?: string[];
  characteristics: Record<string, string>;
  created_at: string;
  available: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type OrderItem = {
  product_id: string;
  quantity: number;
  price: number;
  name: string;
};

export type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  created_at: string;
};