'use client';

import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from './CartProvider';
import ProductImage from '@/components/ProductImage';
import { useState } from 'react';
import { checkout } from '@/app/actions/checkout';
import styles from './CartSidebar.module.css';

export default function CartSidebar() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    discount,
    total,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const [checkoutData, setCheckoutData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [emailWarning, setEmailWarning] = useState<string | undefined>(undefined);

  const handleCheckout = async () => {
    if (!checkoutData.name || !checkoutData.email) return;

    setIsSubmitting(true);
    setCheckoutError('');

    const result = await checkout(
      checkoutData.name,
      checkoutData.email,
      checkoutData.phone,
      items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }))
    );

    setIsSubmitting(false);

    if (result.success) {
      setOrderSuccess(true);
      setEmailWarning(result.emailError);
      clearCart();
    } else {
      setCheckoutError(result.error);
    }
  };

  const closeSidebar = () => {
    setIsCartOpen(false);
    if (orderSuccess) {
      setOrderSuccess(false);
      setCheckoutData({ name: '', email: '', phone: '' });
      setCheckoutError('');
      setEmailWarning(undefined);
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={closeSidebar} />
      <aside className={styles.sidebar}>
        <div className={styles.header}>
          <h2>Tu Carrito</h2>
          <button onClick={closeSidebar} className={styles.closeBtn} aria-label="Cerrar carrito">
            <X size={24} />
          </button>
        </div>

        {orderSuccess ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <ShoppingBag size={48} />
            </div>
            <h3>¡Pedido realizado!</h3>
            {emailWarning ? (
              <p>
                Gracias por tu compra. El pedido se ha creado, pero no se pudo enviar el email de confirmación.
              </p>
            ) : (
              <p>Gracias por tu compra. Te hemos enviado un email de confirmación.</p>
            )}
            <button className="btn btn-primary" onClick={closeSidebar}>
              Seguir comprando
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>
            <ShoppingBag size={48} />
            <p>Tu carrito está vacío</p>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {items.map(({ product, quantity }) => {
                const maxStock = product.stock ?? 999;
                return (
                  <div key={product.id} className={styles.item}>
                    <div className={styles.itemImage}>
                      <ProductImage
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="64px"
                      />
                    </div>
                    <div className={styles.itemInfo}>
                      <h4>{product.name}</h4>
                      <p className={styles.price}>
                        {(product.price * quantity).toFixed(2)} €
                      </p>
                      <div className={styles.quantity}>
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className={styles.qtyBtn}
                          aria-label="Reducir cantidad"
                        >
                          <Minus size={16} />
                        </button>
                        <span>{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className={styles.qtyBtn}
                          disabled={quantity >= maxStock}
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(product.id)}
                      className={styles.removeBtn}
                      aria-label="Eliminar producto"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className={styles.summary}>
              <div className={styles.row}>
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>
              {discount > 0 && (
                <div className={`${styles.row} ${styles.discount}`}>
                  <span>Descuento 10%</span>
                  <span>-{discount.toFixed(2)} €</span>
                </div>
              )}
              <div className={`${styles.row} ${styles.total}`}>
                <span>Total</span>
                <span>{total.toFixed(2)} €</span>
              </div>
              {discount > 0 && (
                <p className={styles.discountNote}>
                  ¡Felicidades! Has alcanzado el descuento del 10%
                </p>
              )}
            </div>

            <div className={styles.checkout}>
              <h3>Finalizar pedido</h3>
              {checkoutError && (
                <p className={styles.checkoutError} role="alert">
                  {checkoutError}
                </p>
              )}
              <div className={styles.formGroup}>
                <input
                  type="text"
                  placeholder="Nombre completo *"
                  value={checkoutData.name}
                  onChange={(e) =>
                    setCheckoutData({ ...checkoutData, name: e.target.value })
                  }
                  required
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={checkoutData.email}
                  onChange={(e) =>
                    setCheckoutData({ ...checkoutData, email: e.target.value })
                  }
                  required
                />
                <input
                  type="tel"
                  placeholder="Teléfono (opcional)"
                  value={checkoutData.phone}
                  onChange={(e) =>
                    setCheckoutData({ ...checkoutData, phone: e.target.value })
                  }
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={handleCheckout}
                disabled={isSubmitting || !checkoutData.name || !checkoutData.email}
              >
                {isSubmitting ? 'Enviando...' : `Pedir ${total.toFixed(2)} €`}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
