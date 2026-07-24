-- Enable Realtime on Orders table
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table products;

-- Disable Row Level Security (RLS) to allow the app client to read/write tables directly
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
