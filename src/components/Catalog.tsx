'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CATEGORIES } from '@/lib/categories';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import styles from '@/app/page.module.css';

type CatalogProps = {
  initialProducts: Product[];
};

export default function Catalog({ initialProducts }: CatalogProps) {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [remoteProducts, setRemoteProducts] = useState<Product[]>(initialProducts);
  const isDefaultView = category === 'all' && !debouncedSearch;
  const products = isDefaultView ? initialProducts : remoteProducts;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (isDefaultView) return;

    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);
      try {
        let query = supabase
          .from('products')
          .select('*')
          .eq('available', true)
          .gt('stock', 0)
          .order('created_at', { ascending: false });

        if (category !== 'all') {
          query = query.eq('category', category);
        }

        if (debouncedSearch) {
          query = query.ilike('name', `%${debouncedSearch}%`);
        }

        const { data, error } = await query;
        if (!cancelled && !error) {
          setRemoteProducts(data || []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [category, debouncedSearch, isDefaultView]);

  return (
    <section className={styles.catalog} id="categories">
      <div className={styles.filters}>
        <div className={styles.categories}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.catBtn} ${category === cat.id ? styles.active : ''}`}
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className={styles.search}>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Cargando productos...</p>
        </div>
      ) : products.length === 0 ? (
        <div className={styles.empty}>
          <p>No se encontraron productos</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
