'use client';

import { useState, useEffect } from 'react';
import { supabase, Product } from '@/lib/supabase';
import { demoProducts } from '@/lib/demoData';
import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';

const CATEGORIES = [
  { id: 'all', label: 'Todo' },
  { id: 'muebles', label: 'Muebles' },
  { id: 'decoracion', label: 'Decoración' },
  { id: 'iluminacion', label: 'Iluminación' },
  { id: 'textil', label: 'Textil' },
  { id: 'cocina', label: 'Cocina' },
  { id: 'electronica', label: 'Electrónica' },
];

const USE_DEMO_DATA = false;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [category, search]);

  const fetchProducts = async () => {
    setLoading(true);
    
    if (USE_DEMO_DATA) {
      let filtered = [...demoProducts];
      
      if (category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
      }
      
      if (search) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      setProducts(filtered);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('available', true)
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
        setProducts(demoProducts);
      } else {
        setProducts(data || demoProducts);
      }
    } catch (error) {
      console.error('Error:', error);
      setProducts(demoProducts);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Muebles y decoración<br />Maria Amor 11B</h1>
          <p>Amplia selección de muebles, electrónica y decoración a la venta, si compras más de 10 productos, recibirás un 10% de descuento.</p>
        </div>
        <div className={styles.heroImage}>
          <img 
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200" 
            alt="Interior moderno"
          />
        </div>
      </section>

      <section className={styles.catalog} id="categories">
        <div className={styles.filters}>
          <div className={styles.categories}>
            {CATEGORIES.map(cat => (
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
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div>
            <h3>Maria Amor 11B</h3>
            <p>Muebles, electrónica y decoración</p>
          </div>
          <div>
            <h4>Contacto</h4>
            <p>Email: contacto@malco.es</p>
          </div>
        </div>
        <div className={styles.copyright}>
          <p>© 2026 Maria Amor 11B. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}