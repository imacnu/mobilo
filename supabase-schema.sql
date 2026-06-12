-- SQL Schema para Supabase
-- Ejecutar en el SQL Editor de Supabase

-- Tabla de productos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT DEFAULT 'muebles',
  image_url TEXT,
  characteristics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  available BOOLEAN DEFAULT true
);

-- Tabla de pedidos
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Políticas para productos (público lectura, admin escritura)
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Admin insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update products" ON products FOR UPDATE USING (true);
CREATE POLICY "Admin delete products" ON products FOR DELETE USING (true);

-- Políticas para pedidos (público inserción, admin todo)
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Admin update orders" ON orders FOR UPDATE USING (true);

-- Insertar productos de ejemplo
INSERT INTO products (name, description, price, category, image_url, characteristics) VALUES
('Sofá Modular Roma', 'Sofá modular de 3 piezas con tela suave y resistente. Perfecto para salones modernos.', 899.00, 'muebles', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', '{"Material": "Tela premium", "Dimensiones": "240x90x85 cm", "Color": "Gris claro"}'),
('Mesa de Centro Niza', 'Mesa de centro rectangular con superficie de mármol y patas de madera maciza.', 349.00, 'muebles', 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800', '{"Material": "Mármol y madera", "Dimensiones": "120x60x45 cm", "Color": "Negro"}'),
('Lámpara de Pie Oslo', 'Lámpara de pie LED regulable con pantalla de tejido natural.', 159.00, 'iluminacion', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800', '{"Material": "Tejido y metal", "Altura": "160 cm", "Potencia": "60W"}'),
('Estantería Bilbao', 'Estantería modular de 5 niveles en madera de roble.', 279.00, 'muebles', 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800', '{"Material": "Roble macizo", "Niveles": "5", "Dimensiones": "80x35x180 cm"}'),
('Juego de Sillas Copenhagen', 'Set de 4 sillas ergonómicas con asientos acolchados.', 399.00, 'muebles', 'https://images.unsplash.com/photo-1503602642458-232111445657?w=800', '{"Material": "Tela y metal", "Cantidad": "4 sillas", "Color": "Azul grisáceo"}'),
('Armario Nordic', 'Armario grande con puertas correderas y espejos.', 649.00, 'muebles', 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800', '{"Material": "MDF lacado", "Puertas": "2 correderas", "Dimensiones": "160x60x200 cm"}'),
('Espejo Redondo Deco', 'Espejo decorativo con marco de ratán.', 89.00, 'decoracion', 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800', '{"Material": "Ratán y vidrio", "Diámetro": "80 cm", "Color": "Natural"}'),
('Maceteros Set Terra', 'Set de 3 maceteros de ceramica en tonos tierra.', 59.00, 'decoracion', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800', '{"Material": "Cerámica", "Cantidad": "3 piezas", "Colores": "Terracota, crema, marrón"}'),
('Cortinas Blackout Oslo', 'Pair of blackout curtains with grommet top.', 129.00, 'textil', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800', '{"Material": "Poliester', "Tamaño": "140x260 cm", "Color": "Gris oscuro"}'),
('Alfombra Woolly', 'Alfombra de lana natural con patrones geométricos.', 299.00, 'textil', 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800', '{"Material": "Lana 100%", "Tamaño": "200x300 cm", "Color": "Crudo y gris"}'),
('Reloj de Pared Minimal', 'Reloj de pared silencioso con números romanos.', 79.00, 'decoracion', 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800', '{"Material": "Metal y vidrio", "Diámetro": "40 cm", "Color": "Negro mate"}'),
('Set de Cocina Artisan', 'Set de 5 piezas de cocina en acero inoxidable.', 189.00, 'cocina', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', '{"Material": "Acero inoxidable", "Piezas": "5", "Marca": "Artisan"}'),
('Carrito de Bar Móvil', 'Carrito de bar con 2 niveles y ruedas.', 179.00, 'muebles', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', '{"Material": "Madera y metal", "Niveles": "2", "Dimensiones": "75x40x80 cm"}'),
('Biombos Separador', 'Biombo de 3 paneles con tela y marco de madera.', 149.00, 'decoracion', 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800', '{"Material": "Tela y madera", "Paneles": "3", "Altura": "170 cm"}'),
('Butaca Relax Premium', 'Butaca reclinable con ottoman incluido.', 449.00, 'muebles', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', '{"Material": "Cuero sintético", "Funciones": "Reclinable", "Color": "Marrón"}');