-- M.A Bakers — Admin Platform Migration
-- Run this in Supabase SQL Editor → https://supabase.com/dashboard

-- 1. Add missing columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 2. Create inventory_movements table
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
ALTER TABLE inventory_movements DISABLE ROW LEVEL SECURITY;

-- 3. Add inventory_movements to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_movements;

-- 4. Add order_number to order_items for quick lookups
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_name TEXT;

-- 5. Create an admin_settings table for website content control
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE admin_settings DISABLE ROW LEVEL SECURITY;

-- Default settings
INSERT INTO admin_settings (key, value) VALUES
  ('announcement_text', 'Free delivery on orders above Rs. 1500!'),
  ('announcement_active', 'true'),
  ('delivery_fee', '150'),
  ('tax_rate', '0'),
  ('whatsapp_number', '923297040402'),
  ('business_phone', '03297040402'),
  ('business_name', 'M.A Bakers')
ON CONFLICT (key) DO NOTHING;

-- 6. Update orders realtime if not already
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE orders;
EXCEPTION WHEN others THEN
  -- already added
END;
$$;
