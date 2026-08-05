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
  stock?: number;
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

export type CheckoutItem = {
  product_id: string;
  quantity: number;
};
