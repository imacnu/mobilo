-- Ejecutar en Supabase SQL Editor para actualizar la función de checkout
-- (marca available=false cuando el stock llega a 0)

CREATE OR REPLACE FUNCTION create_order_with_stock(
  p_customer_email TEXT,
  p_customer_name TEXT,
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

    v_order_items := v_order_items || jsonb_build_array(
      jsonb_build_object(
        'product_id', v_product_id,
        'quantity', v_quantity,
        'price', v_product.price,
        'name', v_product.name
      )
    );

    UPDATE products
    SET
      stock = stock - v_quantity,
      available = (stock - v_quantity) > 0
    WHERE id = v_product_id;
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
