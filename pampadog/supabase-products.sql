CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric,
  category text,
  image_url text,
  product_url text,
  link_type text DEFAULT 'whatsapp',
  is_promocao boolean DEFAULT false,
  is_mais_pedido boolean DEFAULT false,
  is_produto_semana boolean DEFAULT false,
  is_delivery_off boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active products" ON products;
CREATE POLICY "Public can read active products"
ON products
FOR SELECT
USING (active = true);

-- TEMPORARIO para testes do admin com publishable key.
-- Remova estas policies depois de configurar autenticacao no painel.
DROP POLICY IF EXISTS "Temporary public insert products" ON products;
CREATE POLICY "Temporary public insert products"
ON products
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Temporary public update products" ON products;
CREATE POLICY "Temporary public update products"
ON products
FOR UPDATE
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Temporary public delete products" ON products;
CREATE POLICY "Temporary public delete products"
ON products
FOR DELETE
USING (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('produtos', 'produtos', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;
CREATE POLICY "Public can read product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'produtos');

-- TEMPORARIO para testes do admin com publishable key.
-- Remova estas policies depois de configurar autenticacao no painel.
DROP POLICY IF EXISTS "Temporary public insert product images" ON storage.objects;
CREATE POLICY "Temporary public insert product images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'produtos');

DROP POLICY IF EXISTS "Temporary public update product images" ON storage.objects;
CREATE POLICY "Temporary public update product images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'produtos')
WITH CHECK (bucket_id = 'produtos');

DROP POLICY IF EXISTS "Temporary public delete product images" ON storage.objects;
CREATE POLICY "Temporary public delete product images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'produtos');
