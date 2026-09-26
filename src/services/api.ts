import { supabase } from './supabase';
import type { Product, Category, Order } from '../types';
import { isProductAvailable, generateKgVariants } from '../utils/product';
import { branchesData } from '../config/branches';

// FIX: Bug 1: Export isProductAvailable for convenience
export { isProductAvailable };

// ============================================================
// STATIC PRODUCT FALLBACK (used when DB is empty/unreachable)
// ============================================================
const staticProducts: Product[] = [
  // CAKES
  { id: 'cake1', name: 'Black Forest Cake', slug: 'black-forest-cake', category: 'Cakes', description: 'Classic black forest cake with cherries and chocolate layers.', price: 600, unit: 'Pound', status: 'active', available: true, stock_quantity: -1, quantityOptions: [
    { id: 'cake1-1lb', label: '1LB', value: '1lb', price: 600 },
    { id: 'cake1-2lb', label: '2LB', value: '2lb', price: 1200 }
  ], image: '/images/products/cakes/black-forest-cake.png', gallery: [], featured: true, best_seller: true, new_arrival: false, minimum_order: 1, preparation_time: '1 hour', tags: ['Chocolate', 'Cherry'] },
  { id: 'cake2', name: 'Pineapple Ice Cake', slug: 'pineapple-ice-cake', category: 'Cakes', description: 'Refreshing pineapple ice cake with fresh pineapple.', price: 550, unit: 'Pound', status: 'inactive', available: false, out_of_stock: true, stock_quantity: 0, stock: 0, quantityOptions: [
    { id: 'cake2-1lb', label: '1LB', value: '1lb', price: 550, stock: 0, out_of_stock: true },
    { id: 'cake2-2lb', label: '2LB', value: '2lb', price: 1100, stock: 0, out_of_stock: true }
  ], image: '/images/products/cakes/pineapple-ice-cake.png', gallery: [], featured: false, best_seller: false, new_arrival: true, minimum_order: 1, preparation_time: '1 hour', tags: ['Pineapple', 'Ice Cake'] },
  { id: 'cake3', name: 'Dry Fruit Cake', slug: 'dry-fruit-cake', category: 'Cakes', description: 'Rich dry fruit cake with assorted nuts and fruits.', price: 600, unit: 'Pound', quantityOptions: [
    { label: '1LB', value: '1lb', price: 600 },
    { label: '2LB', value: '2lb', price: 1200 }
  ], image: '/images/products/cakes/dry-fruit-cake.png', gallery: [], featured: true, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '1 hour', tags: ['Dry Fruit', 'Nuts'] },
  { id: 'cake4', name: 'Three Milk Cake', slug: 'three-milk-cake', category: 'Cakes', description: 'Moist three milk (tres leches) cake.', price: 1300, unit: 'Kg', quantityOptions: generateKgVariants(1300), image: '/images/products/cakes/three-milk-cake.png', gallery: [], featured: false, best_seller: true, new_arrival: true, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '1 hour', tags: ['Three Milk', 'Tres Leches'] },
  { id: 'cake5', name: 'Bombay Chocolate', slug: 'bombay-chocolate', category: 'Cakes', description: 'Rich Bombay chocolate cake.', price: 600, unit: 'Pound', quantityOptions: [
    { label: '1LB', value: '1lb', price: 600 },
    { label: '2LB', value: '2lb', price: 1200 }
  ], image: '/images/products/cakes/bombay-chocolate.png', gallery: [], featured: true, best_seller: false, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '1 hour', tags: ['Chocolate', 'Bombay'] },
  { id: 'cake6', name: 'Bombay Coffee', slug: 'bombay-coffee', category: 'Cakes', description: 'Delicious Bombay coffee flavored cake.', price: 600, unit: 'Pound', quantityOptions: [
    { label: '1LB', value: '1lb', price: 600 },
    { label: '2LB', value: '2lb', price: 1200 }
  ], image: '/images/products/cakes/bombay-coffee.png', gallery: [], featured: false, best_seller: true, new_arrival: true, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '1 hour', tags: ['Coffee', 'Bombay'] },
  { id: 'cake7', name: 'Brownie Cake', slug: 'brownie-cake', category: 'Cakes', description: 'Fudgy brownie cake with chocolate frosting.', price: 700, unit: 'Pound', quantityOptions: [
    { label: '1LB', value: '1lb', price: 700 },
    { label: '2LB', value: '2lb', price: 1400 }
  ], image: '/images/products/cakes/brownie-cake.png', gallery: [], featured: true, best_seller: false, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '1 hour', tags: ['Brownie', 'Chocolate'] },

  // PASTRIES
  { id: 'pastry1', name: 'Bombay Chocolate Pastry', slug: 'bombay-chocolate-pastry', category: 'Pastries', description: 'Delicious Bombay chocolate pastry.', price: 100, unit: 'Piece', quantityOptions: [{ label: '1 PC', value: '1pc', price: 100 }], image: '/images/products/pastries/bombay-chocolate-pastry.png', gallery: [], featured: true, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '30 mins', tags: ['Pastry', 'Chocolate'] },
  { id: 'pastry2', name: 'Bombay Coffee Pastry', slug: 'bombay-coffee-pastry', category: 'Pastries', description: 'Rich Bombay coffee pastry.', price: 100, unit: 'Piece', quantityOptions: [{ label: '1 PC', value: '1pc', price: 100 }], image: '/images/products/pastries/Bombay_Cake_1254x1254.png', gallery: [], featured: true, best_seller: false, new_arrival: true, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '30 mins', tags: ['Pastry', 'Coffee'] },
  { id: 'pastry3', name: 'Sundae Small', slug: 'sundae-small', category: 'Pastries', description: 'Small sundae pastry cup.', price: 130, unit: 'Piece', quantityOptions: [{ label: '1 PC', value: '1pc', price: 130 }], image: '/images/products/pastries/sundae-small.png', gallery: [], featured: false, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '30 mins', tags: ['Pastry', 'Sundae'] },
  { id: 'pastry3_large', name: 'Sundae Large', slug: 'sundae-large', category: 'Pastries', description: 'Large sundae pastry cup.', price: 140, unit: 'Piece', quantityOptions: [{ label: '1 PC', value: '1pc', price: 140 }], image: '/images/products/pastries/sundae-small.png', gallery: [], featured: true, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '30 mins', tags: ['Pastry', 'Sundae'] },
  { id: 'pastry4', name: 'Red Velvet Pastry', slug: 'red-velvet-pastry', category: 'Pastries', description: 'Light and fluffy red velvet pastry.', price: 100, unit: 'Piece', quantityOptions: [{ label: '1 PC', value: '1pc', price: 100 }], image: '/images/products/pastries/red-velvet-pastry.png', gallery: [], featured: true, best_seller: false, new_arrival: true, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '30 mins', tags: ['Pastry', 'Red Velvet'] },
  { id: 'pastry5', name: 'Black Forest Pastry', slug: 'black-forest-pastry', category: 'Pastries', description: 'Classic black forest pastry.', price: 100, unit: 'Piece', quantityOptions: [{ label: '1 PC', value: '1pc', price: 100 }], image: '/images/products/pastries/black-forest-pastry.png', gallery: [], featured: false, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '30 mins', tags: ['Pastry', 'Black Forest'] },
  { id: 'pastry6', name: 'Pineapple Pastry', slug: 'pineapple-pastry', category: 'Pastries', description: 'Refreshing pineapple pastry.', price: 100, unit: 'Piece', quantityOptions: [{ label: '1 PC', value: '1pc', price: 100 }], image: '/images/products/pastries/pineapple-pastry.png', gallery: [], featured: true, best_seller: false, new_arrival: true, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '30 mins', tags: ['Pastry', 'Pineapple'] },
  { id: 'pastry_brownie', name: 'Brownie', slug: 'brownie', category: 'Pastries', description: 'Fudgy dark chocolate brownie.', price: 100, unit: 'Piece', quantityOptions: [{ label: '1 PC', value: '1pc', price: 100 }], image: '/images/products/pastries/chocolate-cream-puff.png', gallery: [], featured: true, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '30 mins', tags: ['Pastry', 'Brownie'] },
  { id: 'pastry7', name: 'Chocolate Cream Puff', slug: 'chocolate-cream-puff', category: 'Pastries', description: 'Delicious chocolate cream puff.', price: 80, unit: 'Piece', quantityOptions: [{ label: '1 PC', value: '1pc', price: 80 }], image: '/images/products/pastries/chocolate-cream-puff.png', gallery: [], featured: false, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '30 mins', tags: ['Pastry', 'Cream Puff'] },

  // CUPCAKES & BREADS
  { id: 'bread1', name: 'Cupcakes', slug: 'cupcakes', category: 'Breads', description: 'Delicious cupcakes.', price: 50, unit: 'Piece', quantityOptions: [{ label: '1 PC', value: '1pc', price: 50 }], image: '/images/products/breads/cupcakes.png', gallery: [], featured: true, best_seller: true, new_arrival: true, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '30 mins', tags: ['Cupcakes', 'Sweet'] },
  { id: 'bread2', name: 'Bakery bread', slug: 'bakery-bread', category: 'Breads', description: 'Fresh daily sandwich bakery bread.', price: 160, unit: 'Piece', quantityOptions: [{ label: '1 PC', value: '1pc', price: 160 }], image: '/images/products/breads/pita-bread.png', gallery: [], featured: true, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '30 mins', tags: ['Bread', 'Bakery'] },
  { id: 'bread3', name: 'Pita Bread', slug: 'pita-bread', category: 'Breads', description: 'Fresh pita bread packet.', price: 100, unit: 'Packet', quantityOptions: [{ label: '1 PKT', value: '1pkt', price: 100 }], image: '/images/products/breads/pita-bread.png', gallery: [], featured: false, best_seller: true, new_arrival: true, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '40 mins', tags: ['Bread', 'Peta'] },
  { id: 'bread4', name: 'Burger Buns', slug: 'burger-buns', category: 'Breads', description: 'Fresh burger buns.', price: 25, unit: 'Piece', quantityOptions: [{ label: '1 PC', value: '1pc', price: 25 }], image: '/images/products/breads/burger-buns.png', gallery: [], featured: true, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '30 mins', tags: ['Burger Buns', 'Bread'] },

  // COOKIES / TEA TIME
  { id: 'cookie1', name: 'Khaaray', slug: 'khaaray', category: 'Cookies', description: 'Delicious crispy salted khaaray.', price: 660, unit: 'Kg', quantityOptions: generateKgVariants(660), image: '/images/products/cookies/khaasry.png', gallery: [], featured: true, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '20 mins', tags: ['Khaaray', 'Tea Time'] },
  { id: 'cookie2', name: 'Biscuits', slug: 'biscuits', category: 'Cookies', description: 'Classic assorted biscuits.', price: 1100, unit: 'Kg', quantityOptions: generateKgVariants(1100), image: '/images/products/cookies/biscuits.png', gallery: [], featured: false, best_seller: false, new_arrival: true, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '20 mins', tags: ['Biscuits', 'Tea Time'] },
  { id: 'cookie3', name: 'Sugar Free Biscuits', slug: 'sugar-free-biscuits', category: 'Cookies', description: 'Healthy sugar-free biscuits.', price: 1200, unit: 'Kg', quantityOptions: generateKgVariants(1200), image: '/images/products/cookies/sugar-free-biscuits.png', gallery: [], featured: true, best_seller: true, new_arrival: true, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '20 mins', tags: ['Sugar Free', 'Biscuits'] },
  { id: 'cookie4', name: 'Rusks', slug: 'rusks', category: 'Cookies', description: 'Crunchy golden rusks.', price: 560, unit: 'Kg', quantityOptions: generateKgVariants(560), image: '/images/products/cookies/rusks.png', gallery: [], featured: false, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '25 mins', tags: ['Rusks', 'Tea Time'] },
  { id: 'cookie8', name: 'Rusk Cake', slug: 'rusk-cake', category: 'Cookies', description: 'Crispy sweet rusk cake.', price: 1200, unit: 'Kg', quantityOptions: generateKgVariants(1200), image: '/images/products/cookies/rusk-cake.png', gallery: [], featured: false, best_seller: false, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '30 mins', tags: ['Rusk Cake', 'Tea Time'] },
  { id: 'cookie5', name: 'Slice Cake', slug: 'slice-cake', category: 'Cookies', description: 'Tea time vanilla slice cake.', price: 150, unit: 'Piece', quantityOptions: [{ label: '1 PC', value: '1pc', price: 150 }], image: '/images/products/cookies/slice-cake.png', gallery: [], featured: true, best_seller: false, new_arrival: true, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '30 mins', tags: ['Slice Cake', 'Tea Time'] },
  { id: 'cookie6', name: 'Vegetable Patties', slug: 'vegetable-patties', category: 'Cookies', description: 'Vegetable patties.', price: 40, unit: 'Piece', quantityOptions: [{ label: '1 PC', value: '1pc', price: 40 }], image: '/images/products/cookies/vegetable-patties.png', gallery: [], featured: false, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '25 mins', tags: ['Patties', 'Vegetable'] },
  { id: 'cookie7', name: 'Chicken Patties', slug: 'chicken-patties', category: 'Cookies', description: 'Chicken patties.', price: 50, unit: 'Piece', quantityOptions: [{ label: '1 PC', value: '1pc', price: 50 }], image: '/images/products/cookies/chicken-patties.png', gallery: [], featured: true, best_seller: true, new_arrival: true, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '25 mins', tags: ['Patties', 'Chicken'] },

  // FROZEN ITEMS
  { id: 'frozen1', name: 'Plain Paratha 5PC', slug: 'plain-paratha-5pc', category: 'Frozen Items', description: 'Frozen plain paratha - 5 pcs pack.', price: 180, unit: 'Packet', quantityOptions: [{ label: '5 PC', value: '5pc', price: 180 }], image: '/images/products/frozen-items/plain-paratha.png', gallery: [], featured: true, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: 'N/A', tags: ['Frozen', 'Paratha'] },
  { id: 'frozen2', name: 'Plain Paratha 30PC', slug: 'plain-paratha-30pc', category: 'Frozen Items', description: 'Frozen plain paratha - 30 pcs bulk pack.', price: 850, unit: 'Packet', quantityOptions: [{ label: '30 PC', value: '30pc', price: 850 }], image: '/images/products/frozen-items/plain-paratha-30.png', gallery: [], featured: false, best_seller: false, new_arrival: true, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: 'N/A', tags: ['Frozen', 'Paratha'] },
  { id: 'frozen3', name: 'Malai Boti Samosa 12PC', slug: 'malai-boti-samosa-12pc', category: 'Frozen Items', description: 'Frozen malai boti samosa - 12 pcs.', price: 500, unit: 'Packet', quantityOptions: [{ label: '12 PC', value: '12pc', price: 500, stock: 0, out_of_stock: true }], image: '/images/products/frozen-items/molai-boti-samosa.png', gallery: [], featured: true, best_seller: true, new_arrival: true, available: false, out_of_stock: true, stock: 0, stock_quantity: 0, minimum_order: 1, preparation_time: 'N/A', tags: ['Frozen', 'Samosa'] },
  { id: 'frozen4', name: 'Tikka Samosa 12PC', slug: 'tikka-samosa-12pc', category: 'Frozen Items', description: 'Frozen tikka samosa - 12 pcs.', price: 500, unit: 'Packet', quantityOptions: [{ label: '12 PC', value: '12pc', price: 500, stock: 0, out_of_stock: true }], image: '/images/products/frozen-items/tikka-samosa.png', gallery: [], featured: false, best_seller: true, new_arrival: false, available: false, out_of_stock: true, stock: 0, stock_quantity: 0, minimum_order: 1, preparation_time: 'N/A', tags: ['Frozen', 'Samosa'] },
  { id: 'frozen5', name: 'Chicken Pocket 6PC', slug: 'chicken-pocket-6pc', category: 'Frozen Items', description: 'Frozen chicken pocket - 6 pcs.', price: 300, unit: 'Packet', quantityOptions: [{ label: '6 PC', value: '6pc', price: 300, stock: 0, out_of_stock: true }], image: '/images/products/frozen-items/chicken-samosa.png', gallery: [], featured: false, best_seller: false, new_arrival: true, available: false, out_of_stock: true, stock: 0, stock_quantity: 0, minimum_order: 1, preparation_time: 'N/A', tags: ['Frozen', 'Chicken'] },
  { id: 'frozen6', name: 'Chinese Roll 6PC', slug: 'chinese-roll-6pc', category: 'Frozen Items', description: 'Frozen chinese roll - 6 pcs.', price: 300, unit: 'Packet', quantityOptions: [{ label: '6 PC', value: '6pc', price: 300, stock: 0, out_of_stock: true }], image: '/images/products/frozen-items/chinese-roll.png', gallery: [], featured: false, best_seller: true, new_arrival: false, available: false, out_of_stock: true, stock: 0, stock_quantity: 0, minimum_order: 1, preparation_time: 'N/A', tags: ['Frozen', 'Chinese Roll'] },
  { id: 'frozen7', name: 'Macroni Samosa 12PC', slug: 'macroni-samosa-12pc', category: 'Frozen Items', description: 'Frozen macroni samosa - 12 pcs.', price: 300, unit: 'Packet', quantityOptions: [{ label: '12 PC', value: '12pc', price: 300, stock: 0, out_of_stock: true }], image: '/images/products/frozen-items/macroni-samosa.png', gallery: [], featured: true, best_seller: false, new_arrival: true, available: false, out_of_stock: true, stock: 0, stock_quantity: 0, minimum_order: 1, preparation_time: 'N/A', tags: ['Frozen', 'Samosa'] },
];

// ============================================================
// DB → Product mapper
// ============================================================
function mapDbProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    description: row.description || '',
    price: Number(row.price),
    sale_price: row.sale_price ? Number(row.sale_price) : undefined,
    unit: row.unit || 'Piece',
    status: row.status || 'active',
    available: row.available !== false,
    stock_quantity: row.stock_quantity ?? -1,
    out_of_stock: row.stock_quantity === 0,
    featured: row.featured === true,
    best_seller: row.best_seller === true,
    new_arrival: row.new_arrival === true,
    minimum_order: row.minimum_order || 1,
    preparation_time: row.preparation_time || '',
    display_order: row.display_order || 0,
    tags: Array.isArray(row.tags) ? row.tags : [],
    image: row.image || '',
    gallery: [],
    quantityOptions: row.quantityOptions || [{ label: '1 PC', value: '1pc', price: Number(row.price) }],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export const API = {
  // ============================================================
  // PRODUCTS — DB-first, static fallback
  // ============================================================
  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) {
        console.log('📦 DB products empty, using static data');
        return staticProducts;
      }

      return data.map(mapDbProduct);
    } catch (e) {
      console.warn('⚠️ Products fetch error, using static data:', e);
      return staticProducts;
    }
  },

  async getAllProductsRaw(): Promise<Product[]> {
    // Admin: get ALL products including inactive
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) return staticProducts;
      return data.map(mapDbProduct);
    } catch (e) {
      return staticProducts;
    }
  },

  // ============================================================
  // ADMIN: Product CRUD
  // ============================================================
  async createProduct(productData: Partial<Product>): Promise<{ success: boolean; data?: Product; error?: string }> {
    try {
      const slug = (productData.name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const payload = {
        name: productData.name,
        slug: productData.slug || slug,
        category: productData.category,
        description: productData.description || '',
        price: productData.price,
        sale_price: productData.sale_price || null,
        unit: productData.unit || 'Piece',
        image: productData.image || '',
        featured: productData.featured || false,
        best_seller: productData.best_seller || false,
        new_arrival: productData.new_arrival || false,
        available: productData.available !== false,
        status: productData.status || 'active',
        stock_quantity: productData.stock_quantity ?? -1,
        minimum_order: productData.minimum_order || 1,
        preparation_time: productData.preparation_time || '',
        display_order: productData.display_order || 0,
        tags: productData.tags || [],
      };

      const { data, error } = await supabase
        .from('products')
        .insert(payload)
        .select('*')
        .single();

      if (error) throw error;
      return { success: true, data: mapDbProduct(data) };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to create product' };
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<{ success: boolean; error?: string }> {
    try {
      const payload: any = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.price !== undefined) payload.price = updates.price;
      if (updates.sale_price !== undefined) payload.sale_price = updates.sale_price || null;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.unit !== undefined) payload.unit = updates.unit;
      if (updates.image !== undefined) payload.image = updates.image;
      if (updates.featured !== undefined) payload.featured = updates.featured;
      if (updates.best_seller !== undefined) payload.best_seller = updates.best_seller;
      if (updates.new_arrival !== undefined) payload.new_arrival = updates.new_arrival;
      if (updates.available !== undefined) payload.available = updates.available;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.stock_quantity !== undefined) payload.stock_quantity = updates.stock_quantity;
      if (updates.minimum_order !== undefined) payload.minimum_order = updates.minimum_order;
      if (updates.preparation_time !== undefined) payload.preparation_time = updates.preparation_time;
      if (updates.display_order !== undefined) payload.display_order = updates.display_order;
      if (updates.tags !== undefined) payload.tags = updates.tags;

      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to update product' };
    }
  },

  async deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to delete product' };
    }
  },

  async toggleProductAvailability(id: string, available: boolean): Promise<{ success: boolean; error?: string }> {
    return this.updateProduct(id, {
      available,
      status: available ? 'active' : 'inactive',
      stock_quantity: available ? -1 : 0,
    });
  },

  // ============================================================
  // CATEGORIES
  // ============================================================
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      if (!data) return [];
      return data;
    } catch (e) {
      console.warn('⚠️ Categories fetch error, using fallback.');
      return [
        { id: 'cat1', name: 'Cakes', slug: 'cakes', display_order: 1 },
        { id: 'cat2', name: 'Pastries', slug: 'pastries', display_order: 2 },
        { id: 'cat3', name: 'Breads', slug: 'breads', display_order: 3 },
        { id: 'cat4', name: 'Cookies', slug: 'cookies', display_order: 4 },
        { id: 'cat5', name: 'Muffins', slug: 'muffins', display_order: 5 },
        { id: 'cat6', name: 'Frozen Items', slug: 'frozen-items', display_order: 6 }
      ];
    }
  },

  async createCategory(name: string, displayOrder?: number): Promise<{ success: boolean; error?: string }> {
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const { error } = await supabase.from('categories').insert({
        name,
        slug,
        display_order: displayOrder || 99,
      });
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async updateCategory(id: string, updates: { name?: string; display_order?: number }): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('categories').update(updates).eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  // ============================================================
  // COUPONS
  // ============================================================
  async getCoupons(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      return [];
    }
  },

  async createCoupon(coupon: {
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_value?: number;
    expiry_date?: string;
    active?: boolean;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('coupons').insert({
        code: coupon.code.toUpperCase(),
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_order_value: coupon.min_order_value || 0,
        expiry_date: coupon.expiry_date || null,
        active: coupon.active !== false,
      });
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async updateCoupon(id: string, updates: any): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('coupons').update(updates).eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async deleteCoupon(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async validateCoupon(code: string, subtotal: number): Promise<{
    valid: boolean;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    message?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('active', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return { valid: false, code: '', type: 'fixed', value: 0, message: 'Invalid or inactive coupon code.' };
      }

      if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
        return { valid: false, code: '', type: 'fixed', value: 0, message: 'This coupon has expired.' };
      }

      if (subtotal < Number(data.min_order_value)) {
        return { valid: false, code: '', type: 'fixed', value: 0, message: `Minimum order value of Rs. ${data.min_order_value} required.` };
      }

      return {
        valid: true,
        code: data.code,
        type: data.discount_type as 'percentage' | 'fixed',
        value: Number(data.discount_value)
      };
    } catch (e) {
      const fallbackCoupons: Record<string, { type: 'percentage' | 'fixed'; value: number; min: number }> = {
        'MAB10': { type: 'percentage', value: 10, min: 1000 },
        'WELCOME5': { type: 'fixed', value: 500, min: 2000 },
        'FREEDEL': { type: 'fixed', value: 150, min: 1200 }
      };
      const found = fallbackCoupons[code.toUpperCase()];
      if (!found) return { valid: false, code: '', type: 'fixed', value: 0, message: 'Invalid coupon code.' };
      if (subtotal < found.min) return { valid: false, code: '', type: 'fixed', value: 0, message: `Min order Rs. ${found.min} required.` };
      return { valid: true, code: code.toUpperCase(), type: found.type, value: found.value };
    }
  },

  // ============================================================
  // BRANCHES & LOCATIONS
  // ============================================================
  async getBranches(): Promise<{ id: string; name: string; address: string }[]> {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('active', true);

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('No branches');
      return data;
    } catch (e) {
      return [
        { id: 'branch-1', name: 'M.A Bakers 1 — Dhamra Road', address: 'Dhamra Road Main Factory Gate, Nawabshah' },
        { id: 'branch-2', name: 'M.A Bakers 2 — Jam Sahib Road', address: 'Jam Sahib Road, Nawabshah' }
      ];
    }
  },

  async getLocations(): Promise<{ id: string; name: string; branch_id?: string; isActive: boolean }[]> {
    const CACHE_KEY = 'mab_locations_cache';
    const CACHE_TIME_KEY = 'mab_locations_cache_time';
    const ONE_HOUR = 60 * 60 * 1000;

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const cacheTime = localStorage.getItem(CACHE_TIME_KEY);
      if (cached && cacheTime && (Date.now() - Number(cacheTime) < ONE_HOUR)) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { /* ignore */ }

    let fetchedLocations: { id: string; name: string; branch_id?: string; isActive: boolean }[] = [];
    try {
      const { data, error } = await supabase.from('locations').select('*').eq('isActive', true);
      if (!error && data && data.length > 0) {
        fetchedLocations = data.map((item: any) => ({
          id: item.id || item.name,
          name: item.name || item.area,
          branch_id: item.branch_id,
          isActive: true
        }));
      }
    } catch (e) { /* ignore */ }

    if (fetchedLocations.length === 0) {
      fetchedLocations = branchesData.flatMap(b =>
        b.locations.map(loc => ({
          id: `${b.id}-${loc.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          name: loc,
          branch_id: b.id,
          isActive: true
        }))
      );
    }

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(fetchedLocations));
      localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
    } catch (e) { /* ignore */ }

    return fetchedLocations;
  },

  // ============================================================
  // ORDERS
  // ============================================================
  async saveOrder(orderData: any): Promise<Order> {
    const order_number = `MAB-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      let customerId = null;
      try {
        const { data: custCheck } = await supabase
          .from('customers')
          .select('id')
          .eq('phone', orderData.customer.phone)
          .maybeSingle();

        if (custCheck) {
          customerId = custCheck.id;
        } else {
          const { data: newCust, error: custErr } = await supabase
            .from('customers')
            .insert({
              name: orderData.customer.name,
              phone: orderData.customer.phone,
              whatsapp: orderData.customer.whatsapp || orderData.customer.phone,
              email: orderData.customer.email || null
            })
            .select('id')
            .single();
          if (!custErr && newCust) customerId = newCust.id;
        }
      } catch (e) { /* ignore */ }

      let addressId = null;
      if (orderData.type === 'delivery' && customerId) {
        try {
          const { data: newAddr, error: addrErr } = await supabase
            .from('delivery_addresses')
            .insert({
              customer_id: customerId,
              house_flat: orderData.address.house,
              street: orderData.address.street || '',
              area: orderData.address.area,
              city: orderData.address.city || 'Nawabshah',
              nearby_landmark: orderData.address.landmark || null,
              delivery_instructions: orderData.address.instructions || null,
              map_link: orderData.address.mapLink || null
            })
            .select('id')
            .single();
          if (!addrErr && newAddr) addressId = newAddr.id;
        } catch (e) { /* ignore */ }
      }

      const orderPayload = {
        order_number,
        customer_id: customerId,
        delivery_type: orderData.type,
        delivery_address_id: addressId,
        delivery_time_type: orderData.deliveryTimeType || 'asap',
        scheduled_date: orderData.scheduledDate || null,
        scheduled_time: orderData.scheduledTime || null,
        subtotal: orderData.totals.subtotal,
        tax: orderData.totals.tax,
        delivery_charges: orderData.totals.delivery,
        discount: orderData.totals.discountAmount || 0,
        total: orderData.totals.total,
        coupon_code: orderData.couponCode || null,
        payment_method: orderData.payment,
        payment_status: 'pending',
        status: 'pending',
        notes: orderData.type === 'delivery' ? (orderData.address?.instructions || '') : (orderData.pickup?.instructions || '')
      };

      const { data: insertedOrder, error: orderErr } = await supabase
        .from('orders')
        .insert(orderPayload)
        .select('*')
        .single();

      if (orderErr) throw orderErr;
      const orderId = insertedOrder.id;

      try {
        const itemsPayload = Object.values(orderData.items).map((item: any) => ({
          order_id: orderId,
          product_id: item.product?.id || item.id,
          product_name: item.product?.name || item.name,
          quantity: item.quantity || item.qty,
          price: item.product?.price || item.price,
          special_instructions: item.notes || null
        }));
        await supabase.from('order_items').insert(itemsPayload);
      } catch (e) { /* ignore */ }

      if (orderData.paymentScreenshot && orderId) {
        try {
          await supabase.from('payments').insert({
            order_id: orderId,
            payment_method: orderData.payment,
            amount: orderData.totals.total,
            receipt_screenshot: orderData.paymentScreenshot,
            status: 'pending'
          });
        } catch (e) { /* ignore */ }
      }

      localStorage.setItem('mab_customers', JSON.stringify(orderData.customer));

      return {
        id: order_number,
        customer_name: orderData.customer.name,
        customer_phone: orderData.customer.phone,
        customer_email: orderData.customer.email,
        total_amount: orderData.totals.total,
        status: 'Pending',
        type: orderData.type as 'delivery' | 'pickup',
        delivery_fee: orderData.totals.delivery,
        tax: orderData.totals.tax,
        discount: orderData.totals.discountAmount || 0,
        notes: orderPayload.notes,
        created_at: new Date().toISOString(),
        items: Object.values(orderData.items).map((it: any) => ({
          product_id: it.product?.id || it.id,
          product_name: it.product?.name || it.name,
          quantity: it.quantity || it.qty,
          price: it.product?.price || it.price,
          notes: it.notes || ''
        }))
      };
    } catch (error) {
      console.warn('⚠️ Order save failed, using mock mode:', error);
      const localOrders = JSON.parse(localStorage.getItem('mab_orders_mock') || '[]');
      const mockOrderObj: Order = {
        id: order_number,
        customer_name: orderData.customer.name,
        customer_phone: orderData.customer.phone,
        customer_email: orderData.customer.email || undefined,
        total_amount: orderData.totals.total,
        status: 'Pending',
        type: orderData.type as 'delivery' | 'pickup',
        address: orderData.type === 'delivery' ? {
          house: orderData.address.house,
          area: orderData.address.area,
          instructions: orderData.address.instructions || undefined
        } : undefined,
        branch: orderData.type === 'pickup' ? orderData.pickup.branch : undefined,
        delivery_fee: orderData.totals.delivery,
        tax: orderData.totals.tax,
        discount: orderData.totals.discountAmount || 0,
        notes: orderData.type === 'delivery' ? orderData.address.instructions : orderData.pickup.instructions,
        created_at: new Date().toISOString(),
        items: Object.values(orderData.items).map((it: any) => ({
          product_id: it.product?.id || it.id,
          product_name: it.product?.name || it.name,
          quantity: it.quantity || it.qty,
          price: it.product?.price || it.price,
          notes: it.notes || ''
        }))
      };
      localOrders.push(mockOrderObj);
      localStorage.setItem('mab_orders_mock', JSON.stringify(localOrders));
      localStorage.setItem('mab_customers', JSON.stringify(orderData.customer));
      if (orderData.paymentScreenshot) {
        localStorage.setItem(`receipt_${order_number}`, orderData.paymentScreenshot);
      }
      return mockOrderObj;
    }
  },

  async getOrders(options?: { limit?: number; status?: string; search?: string; from?: string; to?: string }): Promise<Order[]> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          customers ( name, phone, email ),
          order_items ( id, product_id, product_name, quantity, price, special_instructions )
        `)
        .order('created_at', { ascending: false });

      if (options?.status && options.status !== 'all') {
        query = query.eq('status', options.status.toLowerCase().replace(/\s+/g, '_'));
      }
      if (options?.from) query = query.gte('created_at', options.from);
      if (options?.to) query = query.lte('created_at', options.to);
      if (options?.limit) query = query.limit(options.limit);

      const { data, error } = await query;
      if (error) throw error;
      if (!data) return [];

      let orders = data.map((o: any) => ({
        id: o.order_number,
        db_id: o.id,
        customer_name: o.customers?.name || o.customer_name || 'Customer',
        customer_phone: o.customers?.phone || o.customer_phone || '',
        customer_email: o.customers?.email || o.customer_email || undefined,
        total_amount: Number(o.total || o.subtotal),
        status: this.mapStatus(o.status),
        type: o.delivery_type as 'delivery' | 'pickup',
        delivery_fee: Number(o.delivery_charges || 0),
        tax: Number(o.tax || 0),
        discount: Number(o.discount || 0),
        payment_method: o.payment_method,
        notes: o.notes || '',
        created_at: o.created_at,
        items: (o.order_items || []).map((item: any) => ({
          product_id: item.product_id,
          product_name: item.product_name || 'Item',
          quantity: item.quantity,
          price: Number(item.price),
          notes: item.special_instructions || '',
        })),
      })) as Order[];

      // Search filter
      if (options?.search) {
        const s = options.search.toLowerCase();
        orders = orders.filter(o =>
          o.id.toLowerCase().includes(s) ||
          o.customer_name.toLowerCase().includes(s) ||
          o.customer_phone.includes(s)
        );
      }

      return orders;
    } catch (e) {
      return JSON.parse(localStorage.getItem('mab_orders_mock') || '[]');
    }
  },

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers ( name, phone, email ),
          order_items ( id, product_id, product_name, quantity, price, special_instructions ),
          delivery_addresses ( house_flat, street, area, city, nearby_landmark, delivery_instructions )
        `)
        .eq('order_number', id.toUpperCase())
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        const mocks: Order[] = JSON.parse(localStorage.getItem('mab_orders_mock') || '[]');
        return mocks.find(o => o.id.toUpperCase() === id.toUpperCase()) || null;
      }

      const addr = data.delivery_addresses;
      return {
        id: data.order_number,
        customer_name: data.customers?.name || 'Customer',
        customer_phone: data.customers?.phone || '',
        customer_email: data.customers?.email || undefined,
        total_amount: Number(data.total),
        status: this.mapStatus(data.status),
        type: data.delivery_type as 'delivery' | 'pickup',
        delivery_fee: Number(data.delivery_charges || 0),
        tax: Number(data.tax || 0),
        discount: Number(data.discount || 0),
        payment_method: data.payment_method,
        notes: data.notes || '',
        created_at: data.created_at,
        address: addr ? {
          house: addr.house_flat,
          area: addr.area,
          instructions: addr.delivery_instructions || undefined,
        } : undefined,
        items: (data.order_items || []).map((item: any) => ({
          product_id: item.product_id,
          product_name: item.product_name || 'Item',
          quantity: item.quantity,
          price: Number(item.price),
          notes: item.special_instructions || '',
        })),
      };
    } catch (e) {
      const mocks: Order[] = JSON.parse(localStorage.getItem('mab_orders_mock') || '[]');
      return mocks.find(o => o.id.toUpperCase() === id.toUpperCase()) || null;
    }
  },

  async updateOrderStatus(id: string, newStatus: string): Promise<boolean> {
    try {
      const dbStatus = newStatus.toLowerCase().replace(/\s+/g, '_');
      const { error } = await supabase
        .from('orders')
        .update({ status: dbStatus })
        .eq('order_number', id);

      if (error) throw error;
      return true;
    } catch (e) {
      const mocks: Order[] = JSON.parse(localStorage.getItem('mab_orders_mock') || '[]');
      const idx = mocks.findIndex(o => o.id === id);
      if (idx !== -1) {
        mocks[idx].status = newStatus as any;
        localStorage.setItem('mab_orders_mock', JSON.stringify(mocks));
        return true;
      }
      return false;
    }
  },

  // ============================================================
  // CUSTOMERS
  // ============================================================
  async getCustomers(options?: { search?: string; limit?: number }): Promise<any[]> {
    try {
      let query = supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (options?.limit) query = query.limit(options.limit);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (e) {
      return [];
    }
  },

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`*, order_items ( id, product_id, product_name, quantity, price )`)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map((o: any) => ({
        id: o.order_number,
        customer_name: '',
        customer_phone: '',
        total_amount: Number(o.total),
        status: this.mapStatus(o.status),
        type: o.delivery_type as 'delivery' | 'pickup',
        delivery_fee: Number(o.delivery_charges || 0),
        tax: Number(o.tax || 0),
        discount: Number(o.discount || 0),
        notes: o.notes || '',
        created_at: o.created_at,
        items: (o.order_items || []).map((item: any) => ({
          product_id: item.product_id,
          product_name: item.product_name || 'Item',
          quantity: item.quantity,
          price: Number(item.price),
        })),
      }));
    } catch (e) {
      return [];
    }
  },

  // ============================================================
  // INVENTORY
  // ============================================================
  async adjustStock(productId: string, productName: string, type: 'in' | 'out' | 'adjustment', quantity: number, reason: string, currentStock: number): Promise<{ success: boolean; error?: string }> {
    try {
      let newStock = currentStock;
      if (type === 'in') newStock = currentStock + quantity;
      else if (type === 'out') newStock = Math.max(0, currentStock - quantity);
      else newStock = quantity; // 'adjustment' = set to exact value

      // Update product stock
      const { error: productErr } = await supabase
        .from('products')
        .update({ stock_quantity: newStock, available: newStock !== 0 })
        .eq('id', productId);

      if (productErr) throw productErr;

      // Log the movement
      await supabase.from('inventory_movements').insert({
        product_id: productId,
        product_name: productName,
        type,
        quantity: type === 'adjustment' ? Math.abs(quantity - currentStock) : quantity,
        reason,
        previous_stock: currentStock,
        new_stock: newStock,
      });

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async getInventoryMovements(productId?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('inventory_movements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (productId) query = query.eq('product_id', productId);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (e) {
      return [];
    }
  },

  async getLowStockProducts(threshold: number = 5): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gte('stock_quantity', 0) // excludes -1 (unlimited)
        .lte('stock_quantity', threshold)
        .order('stock_quantity', { ascending: true });

      if (error) throw error;
      return (data || []).map(mapDbProduct);
    } catch (e) {
      return [];
    }
  },

  // ============================================================
  // ADMIN SETTINGS
  // ============================================================
  async getSettings(): Promise<Record<string, string>> {
    try {
      const { data, error } = await supabase.from('admin_settings').select('*');
      if (error) throw error;
      const settings: Record<string, string> = {};
      (data || []).forEach((row: any) => {
        settings[row.key] = row.value;
      });
      return settings;
    } catch (e) {
      return {};
    }
  },

  async updateSetting(key: string, value: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  // ============================================================
  // ANALYTICS
  // ============================================================
  async getDashboardStats(): Promise<{
    totalOrders: number;
    todayOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    todayRevenue: number;
    totalCustomers: number;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [ordersRes, customersRes, todayRes, pendingRes] = await Promise.all([
        supabase.from('orders').select('total, status', { count: 'exact' }),
        supabase.from('customers').select('id', { count: 'exact' }),
        supabase.from('orders').select('total').gte('created_at', today),
        supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'pending'),
      ]);

      const allOrders = ordersRes.data || [];
      const todayOrders = todayRes.data || [];
      const delivered = allOrders.filter((o: any) => o.status === 'delivered');

      return {
        totalOrders: ordersRes.count || allOrders.length,
        todayOrders: todayOrders.length,
        pendingOrders: pendingRes.count || 0,
        totalRevenue: delivered.reduce((s: number, o: any) => s + Number(o.total), 0),
        todayRevenue: todayOrders.reduce((s: number, o: any) => s + Number(o.total), 0),
        totalCustomers: customersRes.count || 0,
      };
    } catch (e) {
      return { totalOrders: 0, todayOrders: 0, pendingOrders: 0, totalRevenue: 0, todayRevenue: 0, totalCustomers: 0 };
    }
  },

  async getRevenueByDay(days: number = 7): Promise<{ date: string; revenue: number; orders: number }[]> {
    try {
      const from = new Date();
      from.setDate(from.getDate() - (days - 1));
      from.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('orders')
        .select('created_at, total, status')
        .gte('created_at', from.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      const result: { date: string; revenue: number; orders: number }[] = [];
      for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        const dateStr = d.toISOString().split('T')[0];
        const dayOrders = (data || []).filter((o: any) => o.created_at.startsWith(dateStr));
        result.push({
          date: dateStr,
          revenue: dayOrders.filter((o: any) => o.status === 'delivered').reduce((s: number, o: any) => s + Number(o.total), 0),
          orders: dayOrders.length,
        });
      }
      return result;
    } catch (e) {
      return [];
    }
  },

  // ============================================================
  // REALTIME
  // ============================================================
  subscribeToOrders(callback: (order: any) => void) {
    return supabase
      .channel('admin-orders-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders'
      }, (payload) => {
        callback(payload.new);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders'
      }, (payload) => {
        callback(payload.new);
      })
      .subscribe();
  },

  unsubscribeFromOrders(channel: any) {
    supabase.removeChannel(channel);
  },

  // ============================================================
  // CUSTOMER HELPERS
  // ============================================================
  async getSavedCustomer(): Promise<{ name: string; phone: string; email?: string } | null> {
    const data = localStorage.getItem('mab_customers');
    return data ? JSON.parse(data) : null;
  },

  mapStatus(raw: string): Order['status'] {
    let s = raw || 'pending';
    s = s.toLowerCase().replace(/_/g, ' ');
    if (s.includes('pending')) return 'Pending';
    if (s.includes('accept') || s.includes('confirm')) return 'Confirmed';
    if (s.includes('prepar')) return 'Preparing';
    if (s.includes('bake') || s.includes('baking')) return 'Baking';
    if (s.includes('out')) return 'Out for Delivery';
    if (s.includes('ready')) return 'Ready for Pickup';
    if (s.includes('deliver')) return 'Delivered';
    if (s.includes('cancel')) return 'Cancelled';
    return 'Pending';
  }
};
