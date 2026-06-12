'use client';

import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/lib/supabase';
import { useCart } from './CartProvider';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const images = product.image_urls || [product.image_url];
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={styles.card}>
      <div className={styles.image}>
        <img src={images[currentImage]} alt={product.name} />
        
        {images.length > 1 && (
          <>
            <button 
              className={`${styles.navBtn} ${styles.prevBtn}`}
              onClick={prevImage}
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              className={`${styles.navBtn} ${styles.nextBtn}`}
              onClick={nextImage}
              aria-label="Imagen siguiente"
            >
              <ChevronRight size={18} />
            </button>
            <div className={styles.dots}>
              {images.map((_, idx) => (
                <span 
                  key={idx} 
                  className={`${styles.dot} ${idx === currentImage ? styles.dotActive : ''}`}
                />
              ))}
            </div>
          </>
        )}
        
        <button 
          className={styles.addBtn}
          onClick={() => addItem(product)}
          aria-label="Añadir al carrito"
        >
          <Plus size={20} />
        </button>
      </div>
      <div className={styles.content}>
        <span className={styles.category}>{product.category}</span>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.description}>{product.description}</p>
        <div className={styles.footer}>
          <span className={styles.price}>{product.price.toFixed(2)} €</span>
        </div>
      </div>
    </div>
  );
}