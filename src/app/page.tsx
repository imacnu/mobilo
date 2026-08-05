import Image from 'next/image';
import Catalog from '@/components/Catalog';
import { getInitialProducts } from '@/lib/products';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const initialProducts = await getInitialProducts();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>
            Muebles y decoración
            <br />
            Maria Amor 11B
          </h1>
          <p>
            Amplia selección de muebles, electrónica y decoración a la venta, si
            compras más de 10 productos, recibirás un 10% de descuento.
          </p>
        </div>
        <div className={styles.heroImage}>
          <Image
            src="/hero.jpg"
            alt="Interior moderno"
            fill
            priority
            sizes="50vw"
            style={{ objectFit: 'contain' }}
          />
        </div>
      </section>

      <Catalog initialProducts={initialProducts} />

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
