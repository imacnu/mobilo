-- =============================================
-- SEGURIDAD: RLS restrictivo + checkout atómico
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(available) WHERE available = true;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Constraint de status en pedidos
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered'));

-- =============================================
-- POLÍTICAS RLS RESTRICTIVAS
-- =============================================

-- Productos: lectura pública solo disponibles con stock
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products
  FOR SELECT USING (available = true AND stock > 0);

DROP POLICY IF EXISTS "Admin insert products" ON products;
DROP POLICY IF EXISTS "Admin update products" ON products;
DROP POLICY IF EXISTS "Admin delete products" ON products;

-- Pedidos: sin acceso público (solo service_role vía server)
DROP POLICY IF EXISTS "Public insert orders" ON orders;
DROP POLICY IF EXISTS "Admin read orders" ON orders;
DROP POLICY IF EXISTS "Admin update orders" ON orders;

-- Storage: solo lectura pública
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can insert images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update images" ON storage.objects;

-- =============================================
-- FUNCIÓN: crear pedido con validación de stock
-- =============================================

CREATE OR REPLACE FUNCTION create_order_with_stock(
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item JSONB;
  v_product_id UUID;
  v_quantity INT;
  v_product RECORD;
  v_subtotal DECIMAL(10,2) := 0;
  v_total_items INT := 0;
  v_discount DECIMAL(10,2) := 0;
  v_total DECIMAL(10,2);
  v_order_items JSONB := '[]'::JSONB;
  v_order_id UUID;
BEGIN
  IF p_customer_name IS NULL OR trim(p_customer_name) = '' THEN
    RAISE EXCEPTION 'Nombre requerido';
  END IF;
  IF p_customer_email IS NULL OR trim(p_customer_email) = '' THEN
    RAISE EXCEPTION 'Email requerido';
  END IF;
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'El carrito está vacío';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity := (v_item->>'quantity')::INT;

    IF v_quantity IS NULL OR v_quantity <= 0 THEN
      RAISE EXCEPTION 'Cantidad inválida';
    END IF;

    SELECT * INTO v_product
    FROM products
    WHERE id = v_product_id AND available = true
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Producto no disponible: %', v_product_id;
    END IF;

    IF v_product.stock < v_quantity THEN
      RAISE EXCEPTION 'Stock insuficiente para "%" (disponible: %)', v_product.name, v_product.stock;
    END IF;

    v_subtotal := v_subtotal + (v_product.price * v_quantity);
    v_total_items := v_total_items + v_quantity;

    -- Apilamos cada item dentro de un JSON array (evita inconsistencias array/object)
    v_order_items := v_order_items || jsonb_build_array(
      jsonb_build_object(
        'product_id', v_product_id,
        'quantity', v_quantity,
        'price', v_product.price,
        'name', v_product.name
      )
    );

    UPDATE products SET stock = stock - v_quantity WHERE id = v_product_id;
  END LOOP;

  IF v_total_items >= 10 THEN
    v_discount := v_subtotal * 0.10;
  END IF;

  v_total := v_subtotal - v_discount;

  INSERT INTO orders (
    customer_name, customer_email, customer_phone,
    items, subtotal, discount, total, status
  ) VALUES (
    trim(p_customer_name), trim(p_customer_email), NULLIF(trim(p_customer_phone), ''),
    v_order_items, v_subtotal, v_discount, v_total, 'pending'
  ) RETURNING id INTO v_order_id;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'subtotal', v_subtotal,
    'discount', v_discount,
    'total', v_total
  );
END;
$$;

REVOKE ALL ON FUNCTION create_order_with_stock FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_order_with_stock TO service_role;
