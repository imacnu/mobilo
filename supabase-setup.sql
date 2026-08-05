-- =============================================
-- ESTRUCTURA DE BASE DE DATOS PARA MALCO
-- =============================================

-- 1. TABLA DE PRODUCTOS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT DEFAULT 'muebles',
  image_url TEXT,
  image_urls TEXT[],  -- Array de URLs para múltiples imágenes
  characteristics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  available BOOLEAN DEFAULT true,
  stock INTEGER DEFAULT 1
);

-- 2. TABLA DE PEDIDOS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  items JSONB NOT NULL,  -- Array de {product_id, quantity, price, name}
  subtotal DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- =============================================

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Productos: lectura pública solo disponibles con stock
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products
  FOR SELECT USING (available = true AND stock > 0);

-- Sin escritura pública en productos (solo service_role vía server)
DROP POLICY IF EXISTS "Admin insert products" ON products;
DROP POLICY IF EXISTS "Admin update products" ON products;
DROP POLICY IF EXISTS "Admin delete products" ON products;

-- Pedidos: sin acceso público (solo service_role vía server)
DROP POLICY IF EXISTS "Public insert orders" ON orders;
DROP POLICY IF EXISTS "Admin read orders" ON orders;
DROP POLICY IF EXISTS "Admin update orders" ON orders;

-- =============================================
-- STORAGE (Imágenes)
-- =============================================

-- Crear bucket de imágenes (si no existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage (solo lectura pública; escritura vía service_role)
DROP POLICY IF EXISTS "Public access to images" ON storage.objects;
CREATE POLICY "Public access to images" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can insert images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update images" ON storage.objects;

-- =============================================
-- DATOS DE EJEMPLO (opcional)
-- =============================================

INSERT INTO products (name, description, price, category, image_url, image_urls, stock) VALUES
('Sofá Modular Roma', 'Sofá modular de 3 piezas con tela suave y resistente', 899.00, 'muebles', 
'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'],
1),
('Mesa de Centro Niza', 'Mesa de centro con superficie de mármol y patas de madera', 349.00, 'muebles',
'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800',
ARRAY['https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800'],
1),
('Lámpara de Pie Oslo', 'Lámpara de pie LED regulable con pantalla de tejido', 159.00, 'iluminacion',
'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
ARRAY['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800'],
2),
('Estantería Bilbao', 'Estantería modular de 5 niveles en madera de roble', 279.00, 'muebles',
'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800',
ARRAY['https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800'],
1),
('Espejo Redondo Deco', 'Espejo decorativo con marco de ratán', 89.00, 'decoracion',
'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800',
ARRAY['https://images.unsplash.com/photo-1618220179428-22790b461013?w=800'],
3);