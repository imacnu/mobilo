'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from './CartProvider';
import CartSidebar from './CartSidebar';
import styles from './Header.module.css';

export default function Header() {
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ''}`}>
            <Link href="/" className={styles.navLink}>Catálogo</Link>
            <Link href="/#categories" className={styles.navLink}>Categorías</Link>
            <button 
              className={styles.navClose}
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={24} />
            </button>
          </nav>

          <div className={styles.actions}>
            <button 
              className={styles.cartBtn}
              onClick={() => setIsCartOpen(true)}
              aria-label="Abrir carrito"
            >
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className={styles.badge}>{totalItems}</span>
              )}
            </button>
            <button 
              className={styles.menuBtn}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>
      <CartSidebar />
    </>
  );
}