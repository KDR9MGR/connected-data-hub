-- =====================================================
-- SHOP: products (managed from the admin panel) and
-- product_orders (a record of every "Buy now" request,
-- which is also sent to WhatsApp / the clinic inbox).
-- Idempotent where practical; safe to run once.
-- =====================================================

-- ---------- products ----------
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category TEXT,
  short_description TEXT,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  compare_at_price NUMERIC(10, 2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  size_label TEXT,
  images TEXT[] NOT NULL DEFAULT '{}' CHECK (cardinality(images) <= 8),
  in_stock BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Published products readable" ON public.products;
CREATE POLICY "Published products readable" ON public.products FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "Editors manage products" ON public.products;
CREATE POLICY "Editors manage products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'editor')) WITH CHECK (public.has_role(auth.uid(), 'editor'));

DROP TRIGGER IF EXISTS trg_products_updated ON public.products;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_products_published_sort ON public.products (is_published, sort_order);

-- ---------- product_orders ----------
CREATE TABLE IF NOT EXISTS public.product_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- shown to the customer in the WhatsApp / email message so both sides can quote it
  order_ref TEXT NOT NULL UNIQUE
    DEFAULT ('SW-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)))
    CHECK (order_ref ~ '^SW-[A-Z0-9]{8}$'),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  -- name / price / total are filled in by the trigger below from the live product row,
  -- so a visitor cannot choose their own price.
  product_name TEXT NOT NULL DEFAULT '',
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL CHECK (quantity BETWEEN 1 AND 50),
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  customer_name TEXT NOT NULL CHECK (char_length(customer_name) BETWEEN 2 AND 100),
  phone TEXT NOT NULL CHECK (char_length(phone) BETWEEN 6 AND 30),
  email TEXT CHECK (email IS NULL OR char_length(email) <= 255),
  address TEXT NOT NULL CHECK (char_length(address) BETWEEN 5 AND 300),
  city TEXT NOT NULL CHECK (char_length(city) BETWEEN 2 AND 80),
  state TEXT NOT NULL CHECK (char_length(state) BETWEEN 2 AND 80),
  pincode TEXT NOT NULL CHECK (pincode ~ '^[0-9]{6}$'),
  notes TEXT CHECK (notes IS NULL OR char_length(notes) <= 500),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.product_orders TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.product_orders TO authenticated;
GRANT ALL ON public.product_orders TO service_role;
ALTER TABLE public.product_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can place an order" ON public.product_orders;
CREATE POLICY "Anyone can place an order" ON public.product_orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Editors read orders" ON public.product_orders;
CREATE POLICY "Editors read orders" ON public.product_orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'editor'));
DROP POLICY IF EXISTS "Editors update orders" ON public.product_orders;
CREATE POLICY "Editors update orders" ON public.product_orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'editor'));
DROP POLICY IF EXISTS "Editors delete orders" ON public.product_orders;
CREATE POLICY "Editors delete orders" ON public.product_orders FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'editor'));

-- Fill the authoritative product name / price / total and reject unavailable products.
CREATE OR REPLACE FUNCTION public.product_orders_prepare()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  p public.products%ROWTYPE;
BEGIN
  IF NEW.product_id IS NULL THEN
    RAISE EXCEPTION 'Please choose a product to order';
  END IF;
  SELECT * INTO p FROM public.products WHERE id = NEW.product_id;
  IF NOT FOUND OR NOT p.is_published THEN
    RAISE EXCEPTION 'This product is no longer available';
  END IF;
  IF NOT p.in_stock THEN
    RAISE EXCEPTION 'This product is currently out of stock';
  END IF;
  NEW.product_name := p.name;
  NEW.unit_price := p.price;
  NEW.total := p.price * NEW.quantity;
  NEW.status := 'new';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_product_orders_prepare ON public.product_orders;
CREATE TRIGGER trg_product_orders_prepare BEFORE INSERT ON public.product_orders
  FOR EACH ROW EXECUTE FUNCTION public.product_orders_prepare();

DROP TRIGGER IF EXISTS trg_product_orders_updated ON public.product_orders;
CREATE TRIGGER trg_product_orders_updated BEFORE UPDATE ON public.product_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_product_orders_created ON public.product_orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_orders_status ON public.product_orders (status);
