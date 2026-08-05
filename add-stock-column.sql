-- Añadir columna stock a la tabla products
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 1;

-- Actualizar productos existentes para tener stock = 1
UPDATE products SET stock = 1 WHERE stock IS NULL;

-- Añadir restricción de no nulo
ALTER TABLE products ALTER COLUMN stock SET DEFAULT 1;
ALTER TABLE products ALTER COLUMN stock SET NOT NULL;