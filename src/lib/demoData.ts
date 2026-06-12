import { Product } from '@/lib/supabase';

export const demoProducts: Product[] = [
  {
    id: '1',
    name: 'Sofá Modular Roma',
    description: 'Sofá modular de 3 piezas con tela suave y resistente. Perfecto para salones modernos.',
    price: 899.00,
    category: 'muebles',
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    characteristics: { Material: 'Tela premium', Dimensiones: '240x90x85 cm', Color: 'Gris claro' },
    created_at: new Date().toISOString(),
    available: true
  },
  {
    id: '2',
    name: 'Mesa de Centro Niza',
    description: 'Mesa de centro rectangular con superficie de mármol y patas de madera maciza.',
    price: 349.00,
    category: 'muebles',
    image_url: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800',
    characteristics: { Material: 'Mármol y madera', Dimensiones: '120x60x45 cm', Color: 'Negro' },
    created_at: new Date().toISOString(),
    available: true
  },
  {
    id: '3',
    name: 'Lámpara de Pie Oslo',
    description: 'Lámpara de pie LED regulable con pantalla de tejido natural.',
    price: 159.00,
    category: 'iluminacion',
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
    characteristics: { Material: 'Tejido y metal', Altura: '160 cm', Potencia: '60W' },
    created_at: new Date().toISOString(),
    available: true
  },
  {
    id: '4',
    name: 'Estantería Bilbao',
    description: 'Estantería modular de 5 niveles en madera de roble.',
    price: 279.00,
    category: 'muebles',
    image_url: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800',
    characteristics: { Material: 'Roble macizo', Niveles: '5', Dimensiones: '80x35x180 cm' },
    created_at: new Date().toISOString(),
    available: true
  },
  {
    id: '5',
    name: 'Juego de Sillas Copenhagen',
    description: 'Set de 4 sillas ergonómicas con asientos acolchados.',
    price: 399.00,
    category: 'muebles',
    image_url: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=800',
    characteristics: { Material: 'Tela y metal', Cantidad: '4 sillas', Color: 'Azul grisáceo' },
    created_at: new Date().toISOString(),
    available: true
  },
  {
    id: '6',
    name: 'Armario Nordic',
    description: 'Armario grande con puertas correderas y espejos.',
    price: 649.00,
    category: 'muebles',
    image_url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800',
    characteristics: { Material: 'MDF lacado', Puertas: '2 correderas', Dimensiones: '160x60x200 cm' },
    created_at: new Date().toISOString(),
    available: true
  },
  {
    id: '7',
    name: 'Espejo Redondo Deco',
    description: 'Espejo decorativo con marco de ratán.',
    price: 89.00,
    category: 'decoracion',
    image_url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800',
    characteristics: { Material: 'Ratán y vidrio', Diámetro: '80 cm', Color: 'Natural' },
    created_at: new Date().toISOString(),
    available: true
  },
  {
    id: '8',
    name: 'Maceteros Set Terra',
    description: 'Set de 3 maceteros de cerámica en tonos tierra.',
    price: 59.00,
    category: 'decoracion',
    image_url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800',
    characteristics: { Material: 'Cerámica', Cantidad: '3 piezas', Colores: 'Terracota, crema, marrón' },
    created_at: new Date().toISOString(),
    available: true
  },
  {
    id: '9',
    name: 'Cortinas Blackout Oslo',
    description: 'Pair of blackout curtains with grommet top.',
    price: 129.00,
    category: 'textil',
    image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
    characteristics: { Material: 'Poliester', Tamaño: '140x260 cm', Color: 'Gris oscuro' },
    created_at: new Date().toISOString(),
    available: true
  },
  {
    id: '10',
    name: 'Alfombra Woolly',
    description: 'Alfombra de lana natural con patrones geométricos.',
    price: 299.00,
    category: 'textil',
    image_url: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800',
    characteristics: { Material: 'Lana 100%', Tamaño: '200x300 cm', Color: 'Crudo y gris' },
    created_at: new Date().toISOString(),
    available: true
  },
  {
    id: '11',
    name: 'Reloj de Pared Minimal',
    description: 'Reloj de pared silencioso con números romanos.',
    price: 79.00,
    category: 'decoracion',
    image_url: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800',
    characteristics: { Material: 'Metal y vidrio', Diámetro: '40 cm', Color: 'Negro mate' },
    created_at: new Date().toISOString(),
    available: true
  },
  {
    id: '12',
    name: 'Set de Cocina Artisan',
    description: 'Set de 5 piezas de cocina en acero inoxidable.',
    price: 189.00,
    category: 'cocina',
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    characteristics: { Material: 'Acero inoxidable', Piezas: '5', Marca: 'Artisan' },
    created_at: new Date().toISOString(),
    available: true
  },
  {
    id: '13',
    name: 'Carrito de Bar Móvil',
    description: 'Carrito de bar con 2 niveles y ruedas.',
    price: 179.00,
    category: 'muebles',
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    characteristics: { Material: 'Madera y metal', Niveles: '2', Dimensiones: '75x40x80 cm' },
    created_at: new Date().toISOString(),
    available: true
  },
  {
    id: '14',
    name: 'Biombos Separador',
    description: 'Biombo de 3 paneles con tela y marco de madera.',
    price: 149.00,
    category: 'decoracion',
    image_url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800',
    characteristics: { Material: 'Tela y madera', Paneles: '3', Altura: '170 cm' },
    created_at: new Date().toISOString(),
    available: true
  },
  {
    id: '15',
    name: 'Butaca Relax Premium',
    description: 'Butaca reclinable con ottoman incluido.',
    price: 449.00,
    category: 'muebles',
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    characteristics: { Material: 'Cuero sintético', Funciones: 'Reclinable', Color: 'Marrón' },
    created_at: new Date().toISOString(),
    available: true
  }
];