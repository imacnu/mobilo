'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product, CartItem } from '@/lib/types';

type CartContextType = {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

const DISCOUNT_THRESHOLD = 10;
const DISCOUNT_RATE = 0.10;
const CART_KEY = 'mobilo-cart';

function loadCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(CART_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

function getMaxStock(product: Product) {
  return product.stock ?? 999;
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Hydrate cart from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional hydration from localStorage
    setItems(loadCartFromStorage());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    }
  }, [items, ready]);

  const addItem = (product: Product) => {
    const maxStock = getMaxStock(product);
    if (maxStock <= 0) return;

    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= maxStock) return prev;
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item;
        const maxStock = getMaxStock(item.product);
        return { ...item, quantity: Math.min(quantity, maxStock) };
      })
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const discount = totalItems >= DISCOUNT_THRESHOLD ? subtotal * DISCOUNT_RATE : 0;
  const total = subtotal - discount;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discount,
        total,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
