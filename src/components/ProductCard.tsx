'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Product } from '@/lib/types';
import ProductImage from '@/components/ProductImage';
import { useCart } from './CartProvider';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const images = product.image_urls || [product.image_url];
  const [currentImage, setCurrentImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const openLightbox = () => {
    setLightboxIndex(currentImage);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const lightboxNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const lightboxPrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') lightboxNext();
      if (e.key === 'ArrowLeft') lightboxPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, lightboxNext, lightboxPrev]);

  return (
    <>
      <div className={styles.card}>
        <div className={styles.image}>
          <ProductImage
            src={images[currentImage]}
            alt={product.name}
            onClick={openLightbox}
            className={styles.mainImg}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

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
            disabled={(product.stock ?? 1) <= 0}
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
            {product.stock !== undefined && product.stock > 0 && (
              <span className={styles.stock}>Stock: {product.stock}</span>
            )}
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <div className={styles.lightboxOverlay} onClick={closeLightbox}>
          <button className={styles.lightboxClose} onClick={closeLightbox} aria-label="Cerrar">
            <X size={24} />
          </button>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[lightboxIndex]}
              alt={product.name}
              width={1200}
              height={800}
              className={styles.lightboxImg}
              style={{ objectFit: 'contain' }}
            />
          </div>
          {images.length > 1 && (
            <>
              <button
                className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
                onClick={lightboxPrev}
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                onClick={lightboxNext}
                aria-label="Imagen siguiente"
              >
                <ChevronRight size={28} />
              </button>
              <div className={styles.lightboxDots}>
                {images.map((_, idx) => (
                  <span
                    key={idx}
                    className={`${styles.dot} ${idx === lightboxIndex ? styles.dotActive : ''}`}
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}