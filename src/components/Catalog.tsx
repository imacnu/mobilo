'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CATEGORIES } from '@/lib/categories';
import { CATALOG_REFRESH_EVENT } from '@/lib/catalog-events';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import styles from '@/app/page.module.css';

type CatalogProps = {
  initialProducts: Product[];
};

async function fetchCatalogProducts(
  category: string,
  search: string
): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*')
    .eq('available', true)
    .gt('stock', 0)
    .order('created_at', { ascending: false });

  if (category !== 'all') {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data || [];
}

export default function Catalog({ initialProducts }: CatalogProps) {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      try {
        const data = await fetchCatalogProducts(category, debouncedSearch);
        if (!cancelled) setProducts(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

  run();
    return () => {
      cancelled = true;
    };
  }, [category, debouncedSearch]);

  useEffect(() => {
    const handleRefresh = async () => {
      const data = await fetchCatalogProducts(category, debouncedSearch);
      setProducts(data);
    };
    window.addEventListener(CATALOG_REFRESH_EVENT, handleRefresh);
    return () => window.removeEventListener(CATALOG_REFRESH_EVENT, handleRefresh);
  }, [category, debouncedSearch]);

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
