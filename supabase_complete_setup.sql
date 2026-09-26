-- =====================================================================
-- M.A BAKERS — COMPLETE SUPABASE DATABASE SETUP & SEED SCRIPT
-- Paste this entire script into your Supabase SQL Editor and click "Run"
-- Works on any brand new or existing Supabase project.
-- =====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create CATEGORIES Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create PRODUCTS Table (includes all catalog, inventory, and admin columns)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  sale_price NUMERIC,
  unit TEXT NOT NULL DEFAULT 'Piece',
  image TEXT,
  featured BOOLEAN DEFAULT false,
  best_seller BOOLEAN DEFAULT false,
  new_arrival BOOLEAN DEFAULT false,
  available BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active',
  stock_quantity INTEGER DEFAULT -1,
  minimum_order INTEGER DEFAULT 1,
  preparation_time TEXT,
  display_order INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create CUSTOMERS Table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  whatsapp TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create BRANCHES Table
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create DELIVERY_ADDRESSES Table
CREATE TABLE IF NOT EXISTS delivery_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  house_flat TEXT NOT NULL,
  street TEXT NOT NULL DEFAULT '',
  area TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Nawabshah',
  nearby_landmark TEXT,
  delivery_instructions TEXT,
  map_link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Create COUPONS Table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  min_order_value NUMERIC DEFAULT 0,
  expiry_date TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Create ORDERS Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('delivery', 'pickup')),
  delivery_address_id UUID REFERENCES delivery_addresses(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  delivery_time_type TEXT NOT NULL DEFAULT 'asap',
  scheduled_date DATE,
  scheduled_time TEXT,
  subtotal NUMERIC NOT NULL,
  tax NUMERIC NOT NULL DEFAULT 0,
  delivery_charges NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL,
  coupon_code TEXT,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  estimated_delivery_time TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Create ORDER_ITEMS Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Create PAYMENTS Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  receipt_screenshot TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Create INVENTORY_MOVEMENTS Table (stock history & adjustments)
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT,
  type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment', 'order')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  previous_stock INTEGER,
  new_stock INTEGER,
  created_by TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Create ADMIN_SETTINGS Table (dynamic website settings)
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Create NOTIFICATIONS Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'browser',
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Disable Row Level Security (RLS) for direct client operations
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- 15. Enable Supabase Realtime Publications
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  EXCEPTION WHEN others THEN NULL; END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE products;
  EXCEPTION WHEN others THEN NULL; END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE inventory_movements;
  EXCEPTION WHEN others THEN NULL; END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  EXCEPTION WHEN others THEN NULL; END;
END;
$$;

-- =====================================================================
-- SEED INITIAL DATA
-- =====================================================================

-- Seed Categories
INSERT INTO categories (name, slug, display_order) VALUES
  ('Cakes', 'cakes', 1),
  ('Pastries', 'pastries', 2),
  ('Breads', 'breads', 3),
  ('Cookies', 'cookies', 4),
  ('Muffins', 'muffins', 5),
  ('Frozen Items', 'frozen-items', 6)
ON CONFLICT (name) DO UPDATE SET display_order = EXCLUDED.display_order;

-- Seed Branches
INSERT INTO branches (name, address, active) VALUES
  ('M.A Bakers 1 — Dhamra Road', 'Dhamra Road Main Factory Gate, Nawabshah', true),
  ('M.A Bakers 2 — Jam Sahib Road', 'Jam Sahib Road, Nawabshah', true)
ON CONFLICT (name) DO NOTHING;

-- Seed Default Coupons
INSERT INTO coupons (code, discount_type, discount_value, min_order_value, active) VALUES
  ('MAB10', 'percentage', 10, 1000, true),
  ('WELCOME5', 'fixed', 500, 2000, true),
  ('FREEDEL', 'fixed', 150, 1200, true)
ON CONFLICT (code) DO NOTHING;

-- Seed Admin Settings
INSERT INTO admin_settings (key, value) VALUES
  ('announcement_text', 'Free delivery on orders above Rs. 1500!'),
  ('announcement_active', 'true'),
  ('delivery_fee', '150'),
  ('tax_rate', '0'),
  ('whatsapp_number', '923297040402'),
  ('business_phone', '03297040402'),
  ('business_name', 'M.A Bakers')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Seed Products
INSERT INTO products (name, slug, category, description, price, unit, image, featured, best_seller, new_arrival, available, status, stock_quantity, preparation_time, tags) VALUES
  -- CAKES
  ('Black Forest Cake', 'black-forest-cake', 'Cakes', 'Classic black forest cake with cherries and chocolate layers.', 600, 'Pound', '/images/products/cakes/black-forest-cake.png', true, true, false, true, 'active', -1, '1 hour', ARRAY['Chocolate', 'Cherry']),
  ('Pineapple Ice Cake', 'pineapple-ice-cake', 'Cakes', 'Refreshing pineapple ice cake with fresh pineapple.', 550, 'Pound', '/images/products/cakes/pineapple-ice-cake.png', false, false, true, false, 'inactive', 0, '1 hour', ARRAY['Pineapple', 'Ice Cake']),
  ('Dry Fruit Cake', 'dry-fruit-cake', 'Cakes', 'Rich dry fruit cake with assorted nuts and fruits.', 600, 'Pound', '/images/products/cakes/dry-fruit-cake.png', true, true, false, true, 'active', -1, '1 hour', ARRAY['Dry Fruit', 'Nuts']),
  ('Three Milk Cake', 'three-milk-cake', 'Cakes', 'Moist three milk (tres leches) cake.', 1300, 'Kg', '/images/products/cakes/three-milk-cake.png', false, true, true, true, 'active', -1, '1 hour', ARRAY['Three Milk', 'Tres Leches']),
  ('Bombay Chocolate', 'bombay-chocolate', 'Cakes', 'Rich Bombay chocolate cake.', 600, 'Pound', '/images/products/cakes/bombay-chocolate.png', true, false, false, true, 'active', -1, '1 hour', ARRAY['Chocolate', 'Bombay']),
  ('Bombay Coffee', 'bombay-coffee', 'Cakes', 'Delicious Bombay coffee flavored cake.', 600, 'Pound', '/images/products/cakes/bombay-coffee.png', false, true, true, true, 'active', -1, '1 hour', ARRAY['Coffee', 'Bombay']),
  ('Brownie Cake', 'brownie-cake', 'Cakes', 'Fudgy brownie cake with chocolate frosting.', 700, 'Pound', '/images/products/cakes/brownie-cake.png', true, false, false, true, 'active', -1, '1 hour', ARRAY['Brownie', 'Chocolate']),

  -- PASTRIES
  ('Bombay Chocolate Pastry', 'bombay-chocolate-pastry', 'Pastries', 'Delicious Bombay chocolate pastry.', 100, 'Piece', '/images/products/pastries/bombay-chocolate-pastry.png', true, true, false, true, 'active', -1, '30 mins', ARRAY['Pastry', 'Chocolate']),
  ('Bombay Coffee Pastry', 'bombay-coffee-pastry', 'Pastries', 'Rich Bombay coffee pastry.', 100, 'Piece', '/images/products/pastries/Bombay_Cake_1254x1254.png', true, false, true, true, 'active', -1, '30 mins', ARRAY['Pastry', 'Coffee']),
  ('Sundae Small', 'sundae-small', 'Pastries', 'Small sundae pastry cup.', 130, 'Piece', '/images/products/pastries/sundae-small.png', false, true, false, true, 'active', -1, '30 mins', ARRAY['Pastry', 'Sundae']),
  ('Sundae Large', 'sundae-large', 'Pastries', 'Large sundae pastry cup.', 140, 'Piece', '/images/products/pastries/sundae-small.png', true, true, false, true, 'active', -1, '30 mins', ARRAY['Pastry', 'Sundae']),
  ('Red Velvet Pastry', 'red-velvet-pastry', 'Pastries', 'Light and fluffy red velvet pastry.', 100, 'Piece', '/images/products/pastries/red-velvet-pastry.png', true, false, true, true, 'active', -1, '30 mins', ARRAY['Pastry', 'Red Velvet']),
  ('Black Forest Pastry', 'black-forest-pastry', 'Pastries', 'Classic black forest pastry.', 100, 'Piece', '/images/products/pastries/black-forest-pastry.png', false, true, false, true, 'active', -1, '30 mins', ARRAY['Pastry', 'Black Forest']),
  ('Pineapple Pastry', 'pineapple-pastry', 'Pastries', 'Refreshing pineapple pastry.', 100, 'Piece', '/images/products/pastries/pineapple-pastry.png', true, false, true, true, 'active', -1, '30 mins', ARRAY['Pastry', 'Pineapple']),
  ('Brownie', 'brownie', 'Pastries', 'Fudgy dark chocolate brownie.', 100, 'Piece', '/images/products/pastries/chocolate-cream-puff.png', true, true, false, true, 'active', -1, '30 mins', ARRAY['Pastry', 'Brownie']),
  ('Chocolate Cream Puff', 'chocolate-cream-puff', 'Pastries', 'Delicious chocolate cream puff.', 80, 'Piece', '/images/products/pastries/chocolate-cream-puff.png', false, true, false, true, 'active', -1, '30 mins', ARRAY['Pastry', 'Cream Puff']),

  -- BREADS & CUPCAKES
  ('Cupcakes', 'cupcakes', 'Breads', 'Delicious cupcakes.', 50, 'Piece', '/images/products/breads/cupcakes.png', true, true, true, true, 'active', -1, '30 mins', ARRAY['Cupcakes', 'Sweet']),
  ('Bakery bread', 'bakery-bread', 'Breads', 'Fresh daily sandwich bakery bread.', 160, 'Piece', '/images/products/breads/pita-bread.png', true, true, false, true, 'active', -1, '30 mins', ARRAY['Bread', 'Bakery']),
  ('Pita Bread', 'pita-bread', 'Breads', 'Fresh pita bread packet.', 100, 'Packet', '/images/products/breads/pita-bread.png', false, true, true, true, 'active', -1, '40 mins', ARRAY['Bread', 'Pita']),
  ('Burger Buns', 'burger-buns', 'Breads', 'Fresh burger buns.', 25, 'Piece', '/images/products/breads/burger-buns.png', true, true, false, true, 'active', -1, '30 mins', ARRAY['Burger Buns', 'Bread']),

  -- COOKIES & TEA TIME
  ('Khaaray', 'khaaray', 'Cookies', 'Delicious crispy salted khaaray.', 660, 'Kg', '/images/products/cookies/khaasry.png', true, true, false, true, 'active', -1, '20 mins', ARRAY['Khaaray', 'Tea Time']),
  ('Biscuits', 'biscuits', 'Cookies', 'Classic assorted biscuits.', 1100, 'Kg', '/images/products/cookies/biscuits.png', false, false, true, true, 'active', -1, '20 mins', ARRAY['Biscuits', 'Tea Time']),
  ('Sugar Free Biscuits', 'sugar-free-biscuits', 'Cookies', 'Healthy sugar-free biscuits.', 1200, 'Kg', '/images/products/cookies/sugar-free-biscuits.png', true, true, true, true, 'active', -1, '20 mins', ARRAY['Sugar Free', 'Biscuits']),
  ('Rusks', 'rusks', 'Cookies', 'Crunchy golden rusks.', 560, 'Kg', '/images/products/cookies/rusks.png', false, true, false, true, 'active', -1, '25 mins', ARRAY['Rusks', 'Tea Time']),
  ('Rusk Cake', 'rusk-cake', 'Cookies', 'Crispy sweet rusk cake.', 1200, 'Kg', '/images/products/cookies/rusk-cake.png', false, false, false, true, 'active', -1, '30 mins', ARRAY['Rusk Cake', 'Tea Time']),
  ('Slice Cake', 'slice-cake', 'Cookies', 'Tea time vanilla slice cake.', 150, 'Piece', '/images/products/cookies/slice-cake.png', true, false, true, true, 'active', -1, '30 mins', ARRAY['Slice Cake', 'Tea Time']),
  ('Vegetable Patties', 'vegetable-patties', 'Cookies', 'Vegetable patties.', 40, 'Piece', '/images/products/cookies/vegetable-patties.png', false, true, false, true, 'active', -1, '25 mins', ARRAY['Patties', 'Vegetable']),
  ('Chicken Patties', 'chicken-patties', 'Cookies', 'Chicken patties.', 50, 'Piece', '/images/products/cookies/chicken-patties.png', true, true, true, true, 'active', -1, '25 mins', ARRAY['Patties', 'Chicken']),

  -- FROZEN ITEMS
  ('Plain Paratha 5PC', 'plain-paratha-5pc', 'Frozen Items', 'Frozen plain paratha - 5 pcs pack.', 180, 'Packet', '/images/products/frozen-items/plain-paratha.png', true, true, false, true, 'active', -1, 'N/A', ARRAY['Frozen', 'Paratha']),
  ('Plain Paratha 30PC', 'plain-paratha-30pc', 'Frozen Items', 'Frozen plain paratha - 30 pcs bulk pack.', 850, 'Packet', '/images/products/frozen-items/plain-paratha-30.png', false, false, true, true, 'active', -1, 'N/A', ARRAY['Frozen', 'Paratha']),
  ('Malai Boti Samosa 12PC', 'malai-boti-samosa-12pc', 'Frozen Items', 'Frozen malai boti samosa - 12 pcs.', 500, 'Packet', '/images/products/frozen-items/molai-boti-samosa.png', true, true, true, false, 'inactive', 0, 'N/A', ARRAY['Frozen', 'Samosa']),
  ('Tikka Samosa 12PC', 'tikka-samosa-12pc', 'Frozen Items', 'Frozen tikka samosa - 12 pcs.', 500, 'Packet', '/images/products/frozen-items/tikka-samosa.png', false, true, false, false, 'inactive', 0, 'N/A', ARRAY['Frozen', 'Samosa']),
  ('Chicken Pocket 6PC', 'chicken-pocket-6pc', 'Frozen Items', 'Frozen chicken pocket - 6 pcs.', 300, 'Packet', '/images/products/frozen-items/chicken-samosa.png', false, false, true, false, 'inactive', 0, 'N/A', ARRAY['Frozen', 'Chicken']),
  ('Chinese Roll 6PC', 'chinese-roll-6pc', 'Frozen Items', 'Frozen chinese roll - 6 pcs.', 300, 'Packet', '/images/products/frozen-items/chinese-roll.png', false, true, false, false, 'inactive', 0, 'N/A', ARRAY['Frozen', 'Chinese Roll']),
  ('Macroni Samosa 12PC', 'macroni-samosa-12pc', 'Frozen Items', 'Frozen macroni samosa - 12 pcs.', 300, 'Packet', '/images/products/frozen-items/macroni-samosa.png', true, false, true, false, 'inactive', 0, 'N/A', ARRAY['Frozen', 'Samosa'])
ON CONFLICT (name) DO UPDATE SET
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  unit = EXCLUDED.unit,
  image = EXCLUDED.image,
  status = EXCLUDED.status,
  available = EXCLUDED.available,
  stock_quantity = EXCLUDED.stock_quantity;
