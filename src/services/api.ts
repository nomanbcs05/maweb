import { supabase } from './supabase';
import type { Product, Category, Order } from '../types';

// Static product data defined separately
const staticProducts: Product[] = [
  // Cakes
  { id: 'cake1', name: 'Black Forest Cake', slug: 'black-forest-cake', category: 'Cakes', description: 'Classic black forest cake with cherries and chocolate layers.', price: 600, unit: 'Pound', quantityOptions: [
    { label: '1LB', value: '1lb', price: 600 },
    { label: '2LB', value: '2lb', price: 1100 }
  ], image: '/images/products/cakes/black-forest-cake.png', gallery: [], featured: true, best_seller: true, new_arrival: false, available: true, stock_quantity: 10, minimum_order: 1, preparation_time: '1 hour', tags: ['Chocolate', 'Cherry'], ingredients: ['Flour', 'Sugar', 'Cocoa Powder', 'Butter', 'Eggs', 'Cream', 'Cherries'], allergens: ['Gluten', 'Dairy', 'Eggs'] },
  { id: 'cake2', name: 'Pineapple Ice Cake', slug: 'pineapple-ice-cake', category: 'Cakes', description: 'Refreshing pineapple ice cake with fresh pineapple.', price: 550, unit: 'Pound', quantityOptions: [
    { label: '1LB', value: '1lb', price: 550 },
    { label: '2LB', value: '2lb', price: 1000 }
  ], image: '/images/products/cakes/pineapple-ice-cake.png', gallery: [], featured: false, best_seller: false, new_arrival: true, available: true, stock_quantity: 8, minimum_order: 1, preparation_time: '1 hour', tags: ['Pineapple', 'Ice Cake'], ingredients: ['Flour', 'Sugar', 'Butter', 'Pineapple', 'Cream', 'Eggs'], allergens: ['Gluten', 'Dairy', 'Eggs'] },
  { id: 'cake3', name: 'Dry Fruit Cake', slug: 'dry-fruit-cake', category: 'Cakes', description: 'Rich dry fruit cake with assorted nuts and fruits.', price: 1000, unit: 'Kg', quantityOptions: [
    { label: '250g', value: '250g', price: 300 },
    { label: '500g', value: '500g', price: 550 },
    { label: '1kg', value: '1kg', price: 1000 }
  ], image: '/images/products/cakes/dry-fruit-cake.png', gallery: [], featured: true, best_seller: true, new_arrival: false, available: true, stock_quantity: 12, minimum_order: 1, preparation_time: '1 hour', tags: ['Dry Fruit', 'Nuts'], ingredients: ['Flour', 'Sugar', 'Butter', 'Dry Fruits', 'Eggs'], allergens: ['Gluten', 'Dairy', 'Eggs', 'Nuts'] },
  { id: 'cake4', name: 'Three Milk Cake', slug: 'three-milk-cake', category: 'Cakes', description: 'Moist three milk (tres leches) cake.', price: 1300, unit: 'Kg', quantityOptions: [
    { label: '250g', value: '250g', price: 400 },
    { label: '500g', value: '500g', price: 700 },
    { label: '1kg', value: '1kg', price: 1300 }
  ], image: '/images/products/cakes/three-milk-cake.png', gallery: [], featured: false, best_seller: true, new_arrival: true, available: true, stock_quantity: 10, minimum_order: 1, preparation_time: '1 hour', tags: ['Three Milk', 'Tres Leches'], ingredients: ['Flour', 'Sugar', 'Butter', 'Milk', 'Cream', 'Eggs'], allergens: ['Gluten', 'Dairy', 'Eggs'] },
  { id: 'cake5', name: 'Bombay Chocolate', slug: 'bombay-chocolate', category: 'Cakes', description: 'Rich Bombay chocolate cake.', price: 800, unit: 'Pound', quantityOptions: [
    { label: '1LB', value: '1lb', price: 800 },
    { label: '2LB', value: '2lb', price: 1500 }
  ], image: '/images/products/cakes/bombay-chocolate.png', gallery: [], featured: true, best_seller: false, new_arrival: false, available: true, stock_quantity: 15, minimum_order: 1, preparation_time: '1 hour', tags: ['Chocolate', 'Bombay'], ingredients: ['Flour', 'Sugar', 'Cocoa Powder', 'Butter', 'Eggs', 'Cream'], allergens: ['Gluten', 'Dairy', 'Eggs'] },
  { id: 'cake6', name: 'Bombay Coffee', slug: 'bombay-coffee', category: 'Cakes', description: 'Delicious Bombay coffee flavored cake.', price: 800, unit: 'Pound', quantityOptions: [
    { label: '1LB', value: '1lb', price: 800 },
    { label: '2LB', value: '2lb', price: 1500 }
  ], image: '/images/products/cakes/bombay-coffee.png', gallery: [], featured: false, best_seller: true, new_arrival: true, available: true, stock_quantity: 12, minimum_order: 1, preparation_time: '1 hour', tags: ['Coffee', 'Bombay'], ingredients: ['Flour', 'Sugar', 'Coffee', 'Butter', 'Eggs', 'Cream'], allergens: ['Gluten', 'Dairy', 'Eggs'] },
  { id: 'cake7', name: 'Brownie Cake', slug: 'brownie-cake', category: 'Cakes', description: 'Fudgy brownie cake with chocolate frosting.', price: 700, unit: 'Pound', quantityOptions: [
    { label: '1LB', value: '1lb', price: 700 },
    { label: '2LB', value: '2lb', price: 1300 }
  ], image: '/images/products/cakes/brownie-cake.png', gallery: [], featured: true, best_seller: false, new_arrival: false, available: true, stock_quantity: 10, minimum_order: 1, preparation_time: '1 hour', tags: ['Brownie', 'Chocolate'], ingredients: ['Flour', 'Sugar', 'Cocoa Powder', 'Butter', 'Eggs', 'Chocolate'], allergens: ['Gluten', 'Dairy', 'Eggs'] },
  // Pastries
  { id: 'pastry1', name: 'Bombay Chocolate Pastry', slug: 'bombay-chocolate-pastry', category: 'Pastries', description: 'Delicious Bombay chocolate pastry.', price: 100, unit: 'Piece', quantityOptions: [
    { label: '1 PC', value: '1pc', price: 100 }
  ], image: '/images/products/pastries/bombay-chocolate-pastry.png', gallery: [], featured: true, best_seller: true, new_arrival: false, available: true, stock_quantity: 30, minimum_order: 1, preparation_time: '30 mins', tags: ['Pastry', 'Chocolate', 'Bombay'], ingredients: ['Flour', 'Sugar', 'Butter', 'Chocolate', 'Cream', 'Eggs'], allergens: ['Gluten', 'Dairy', 'Eggs'] },
  { id: 'pastry2', name: 'Bombay Coffee Pastry', slug: 'bombay-coffee-pastry', category: 'Pastries', description: 'Rich Bombay coffee pastry.', price: 100, unit: 'Piece', quantityOptions: [
    { label: '1 PC', value: '1pc', price: 100 }
  ], image: '/images/products/pastries/Bombay_Cake_1254x1254.png', gallery: [], featured: true, best_seller: false, new_arrival: true, available: true, stock_quantity: 30, minimum_order: 1, preparation_time: '30 mins', tags: ['Pastry', 'Coffee', 'Bombay'], ingredients: ['Flour', 'Sugar', 'Butter', 'Coffee', 'Cream', 'Eggs'], allergens: ['Gluten', 'Dairy', 'Eggs'] },
  { id: 'pastry3', name: 'Sundae Small', slug: 'sundae-small', category: 'Pastries', description: 'Small sundae pastry.', price: 100, unit: 'Piece', quantityOptions: [
    { label: '1 PC', value: '1pc', price: 100 }
  ], image: '/images/products/pastries/sundae-small.png', gallery: [], featured: false, best_seller: true, new_arrival: false, available: true, stock_quantity: 25, minimum_order: 1, preparation_time: '30 mins', tags: ['Pastry', 'Sundae'], ingredients: ['Flour', 'Sugar', 'Butter', 'Cream', 'Eggs'], allergens: ['Gluten', 'Dairy', 'Eggs'] },
  { id: 'pastry4', name: 'Red Velvet Pastry', slug: 'red-velvet-pastry', category: 'Pastries', description: 'Light and fluffy red velvet pastry.', price: 100, unit: 'Piece', quantityOptions: [
    { label: '1 PC', value: '1pc', price: 100 }
  ], image: '/images/products/pastries/red-velvet-pastry.png', gallery: [], featured: true, best_seller: false, new_arrival: true, available: true, stock_quantity: 30, minimum_order: 1, preparation_time: '30 mins', tags: ['Pastry', 'Red Velvet'], ingredients: ['Flour', 'Sugar', 'Butter', 'Cream Cheese', 'Eggs'], allergens: ['Gluten', 'Dairy', 'Eggs'] },
  { id: 'pastry5', name: 'Black Forest Pastry', slug: 'black-forest-pastry', category: 'Pastries', description: 'Classic black forest pastry.', price: 100, unit: 'Piece', quantityOptions: [
    { label: '1 PC', value: '1pc', price: 100 }
  ], image: '/images/products/pastries/black-forest-pastry.png', gallery: [], featured: false, best_seller: true, new_arrival: false, available: true, stock_quantity: 28, minimum_order: 1, preparation_time: '30 mins', tags: ['Pastry', 'Black Forest', 'Chocolate'], ingredients: ['Flour', 'Sugar', 'Cocoa Powder', 'Butter', 'Cream', 'Eggs', 'Cherries'], allergens: ['Gluten', 'Dairy', 'Eggs'] },
  { id: 'pastry6', name: 'Pineapple Pastry', slug: 'pineapple-pastry', category: 'Pastries', description: 'Refreshing pineapple pastry.', price: 100, unit: 'Piece', quantityOptions: [
    { label: '1 PC', value: '1pc', price: 100 }
  ], image: '/images/products/pastries/pineapple-pastry.png', gallery: [], featured: true, best_seller: false, new_arrival: true, available: true, stock_quantity: 30, minimum_order: 1, preparation_time: '30 mins', tags: ['Pastry', 'Pineapple'], ingredients: ['Flour', 'Sugar', 'Butter', 'Pineapple', 'Cream', 'Eggs'], allergens: ['Gluten', 'Dairy', 'Eggs'] },
  { id: 'pastry7', name: 'Chocolate Cream Puff', slug: 'chocolate-cream-puff', category: 'Pastries', description: 'Delicious chocolate cream puff.', price: 100, unit: 'Piece', quantityOptions: [
    { label: '1 PC', value: '1pc', price: 100 }
  ], image: '/images/products/pastries/chocolate-cream-puff.png', gallery: [], featured: false, best_seller: true, new_arrival: false, available: true, stock_quantity: 25, minimum_order: 1, preparation_time: '30 mins', tags: ['Pastry', 'Cream Puff', 'Chocolate'], ingredients: ['Flour', 'Sugar', 'Butter', 'Chocolate', 'Cream', 'Eggs'], allergens: ['Gluten', 'Dairy', 'Eggs'] },
  // Cupcakes & Breads
  { id: 'bread1', name: 'Cupcakes', slug: 'cupcakes', category: 'Breads', description: 'Delicious cupcakes.', price: 50, unit: 'Piece', quantityOptions: [
    { label: '1 PC', value: '1pc', price: 50 }
  ], image: '/images/products/breads/cupcakes.png', gallery: [], featured: true, best_seller: true, new_arrival: true, available: true, stock_quantity: 40, minimum_order: 1, preparation_time: '30 mins', tags: ['Cupcakes', 'Sweet'], ingredients: ['Flour', 'Sugar', 'Butter', 'Eggs', 'Cream'], allergens: ['Gluten', 'Dairy', 'Eggs'] },
  { id: 'bread3', name: 'Peta Bread', slug: 'peta-bread', category: 'Breads', description: 'Fresh peta bread.', price: 100, unit: 'Piece', quantityOptions: [
    { label: '1 PC', value: '1pc', price: 100 }
  ], image: '/images/products/breads/pita-bread.png', gallery: [], featured: false, best_seller: true, new_arrival: true, available: true, stock_quantity: 20, minimum_order: 1, preparation_time: '40 mins', tags: ['Bread', 'Peta'], ingredients: ['Flour', 'Water', 'Salt', 'Yeast'], allergens: ['Gluten'] },
  { id: 'bread4', name: 'Burger Buns', slug: 'burger-buns', category: 'Breads', description: 'Fresh burger buns.', price: 25, unit: 'Piece', quantityOptions: [
    { label: '1 PC', value: '1pc', price: 25 }
  ], image: '/images/products/breads/burger-buns.png', gallery: [], featured: true, best_seller: true, new_arrival: false, available: true, stock_quantity: 50, minimum_order: 1, preparation_time: '30 mins', tags: ['Burger Buns', 'Bread'], ingredients: ['Flour', 'Water', 'Salt', 'Yeast', 'Sugar', 'Butter'], allergens: ['Gluten', 'Dairy'] },
  // Cookies (Tea Time Munchies)
  { id: 'cookie1', name: 'Khaasry', slug: 'khaasry', category: 'Cookies', description: 'Delicious khaasry.', price: 600, unit: 'Kg', quantityOptions: [
    { label: '250g', value: '250g', price: 180 },
    { label: '500g', value: '500g', price: 350 },
    { label: '1kg', value: '1kg', price: 600 }
  ], image: '/images/products/cookies/khaasry.png', gallery: [], featured: true, best_seller: true, new_arrival: false, available: true, stock_quantity: 20, minimum_order: 1, preparation_time: '20 mins', tags: ['Khaasry', 'Tea Time', 'Cookies'], ingredients: ['Flour', 'Sugar', 'Butter', 'Eggs'], allergens: ['Gluten', 'Dairy', 'Eggs'] },
  { id: 'cookie2', name: 'Biscuits', slug: 'biscuits', category: 'Cookies', description: 'Classic biscuits.', price: 700, unit: 'Kg', quantityOptions: [
    { label: '250g', value: '250g', price: 200 },
    { label: '500g', value: '500g', price: 400 },
    { label: '1kg', value: '1kg', price: 700 }
  ], image: '/images/products/cookies/biscuits.png', gallery: [], featured: false, best_seller: false, new_arrival: true, available: true, stock_quantity: 25, minimum_order: 1, preparation_time: '20 mins', tags: ['Biscuits', 'Tea Time'], ingredients: ['Flour', 'Sugar', 'Butter', 'Eggs'], allergens: ['Gluten', 'Dairy', 'Eggs'] },
  { id: 'cookie3', name: 'Sugar Free Biscuits', slug: 'sugar-free-biscuits', category: 'Cookies', description: 'Sugar free biscuits.', price: 1200, unit: 'Kg', quantityOptions: [
    { label: '250g', value: '250g', price: 350 },
    { label: '500g', value: '500g', price: 650 },
    { label: '1kg', value: '1kg', price: 1200 }
  ], image: '/images/products/cookies/sugar-free-biscuits.png', gallery: [], featured: true, best_seller: true, new_arrival: true, available: true, stock_quantity: 15, minimum_order: 1, preparation_time: '20 mins', tags: ['Sugar Free', 'Biscuits', 'Tea Time'], ingredients: ['Flour', 'Sugar Free Sweetener', 'Butter', 'Eggs'], allergens: ['Gluten', 'Dairy', 'Eggs'] },
  { id: 'cookie4', name: 'Rusks', slug: 'rusks', category: 'Cookies', description: 'Crunchy rusks.', price: 550, unit: 'Kg', quantityOptions: [
    { label: '250g', value: '250g', price: 160 },
    { label: '500g', value: '500g', price: 300 },
    { label: '1kg', value: '1kg', price: 550 }
  ], image: '/images/products/cookies/rusks.png', gallery: [], featured: false, best_seller: true, new_arrival: false, available: true, stock_quantity: 30, minimum_order: 1, preparation_time: '25 mins', tags: ['Rusks', 'Tea Time'], ingredients: ['Flour', 'Sugar', 'Butter', 'Eggs', 'Milk'], allergens: ['Gluten', 'Dairy', 'Eggs'] },
  { id: 'cookie5', name: 'Slice Cake', slug: 'slice-cake', category: 'Cookies', description: 'Tea time slice cake.', price: 150, unit: 'Piece', quantityOptions: [
    { label: '1 PC', value: '1pc', price: 150 }
  ], image: '/images/products/cookies/slice-cake.png', gallery: [], featured: true, best_seller: false, new_arrival: true, available: true, stock_quantity: 25, minimum_order: 1, preparation_time: '30 mins', tags: ['Slice Cake', 'Tea Time'], ingredients: ['Flour', 'Sugar', 'Butter', 'Eggs', 'Milk'], allergens: ['Gluten', 'Dairy', 'Eggs'] },
  { id: 'cookie6', name: 'Vegetable Patties', slug: 'vegetable-patties', category: 'Cookies', description: 'Vegetable patties.', price: 40, unit: 'Piece', quantityOptions: [
    { label: '1 PC', value: '1pc', price: 40 }
  ], image: '/images/products/cookies/vegetable-patties.png', gallery: [], featured: false, best_seller: true, new_arrival: false, available: true, stock_quantity: 40, minimum_order: 1, preparation_time: '25 mins', tags: ['Patties', 'Vegetable', 'Tea Time'], ingredients: ['Flour', 'Butter', 'Vegetables', 'Spices'], allergens: ['Gluten', 'Dairy'] },
  { id: 'cookie7', name: 'Chicken Patties', slug: 'chicken-patties', category: 'Cookies', description: 'Chicken patties.', price: 50, unit: 'Piece', quantityOptions: [
    { label: '1 PC', value: '1pc', price: 50 }
  ], image: '/images/products/cookies/chicken-patties.png', gallery: [], featured: true, best_seller: true, new_arrival: true, available: true, stock_quantity: 35, minimum_order: 1, preparation_time: '25 mins', tags: ['Patties', 'Chicken', 'Tea Time'], ingredients: ['Flour', 'Butter', 'Chicken', 'Spices'], allergens: ['Gluten', 'Dairy'] },
  { id: 'cookie8', name: 'Rusk Cake', slug: 'rusk-cake', category: 'Cookies', description: 'Rusk cake.', price: 1200, unit: 'Kg', quantityOptions: [
    { label: '250g', value: '250g', price: 350 },
    { label: '500g', value: '500g', price: 650 },
    { label: '1kg', value: '1kg', price: 1200 }
  ], image: '/images/products/cookies/rusk-cake.png', gallery: [], featured: false, best_seller: false, new_arrival: false, available: true, stock_quantity: 15, minimum_order: 1, preparation_time: '30 mins', tags: ['Rusk Cake', 'Tea Time'], ingredients: ['Flour', 'Sugar', 'Butter', 'Eggs', 'Milk'], allergens: ['Gluten', 'Dairy', 'Eggs'] },
  // Frozen Items (Snacks)
  { id: 'frozen1', name: 'Plain Paratha', slug: 'plain-paratha', category: 'Frozen Items', description: 'Frozen plain paratha - 8 pcs.', price: 180, unit: 'Pack', quantityOptions: [
    { label: '1 Pack', value: '1pack', price: 180 }
  ], image: '/images/products/frozen-items/plain-paratha.png', gallery: [], featured: true, best_seller: true, new_arrival: false, available: true, stock_quantity: 40, minimum_order: 1, preparation_time: 'N/A', tags: ['Frozen', 'Paratha', 'Plain'], ingredients: ['Flour', 'Water', 'Salt', 'Ghee'], allergens: ['Gluten', 'Dairy'] },
  { id: 'frozen2', name: 'Plain Paratha (30 pcs)', slug: 'plain-paratha-30', category: 'Frozen Items', description: 'Frozen plain paratha - 30 pcs.', price: 650, unit: 'Pack', quantityOptions: [
    { label: '1 Pack', value: '1pack', price: 650 }
  ], image: '/images/products/frozen-items/plain-paratha-30.png', gallery: [], featured: false, best_seller: false, new_arrival: true, available: true, stock_quantity: 25, minimum_order: 1, preparation_time: 'N/A', tags: ['Frozen', 'Paratha', 'Family Pack'], ingredients: ['Flour', 'Water', 'Salt', 'Ghee'], allergens: ['Gluten', 'Dairy'] },
  { id: 'frozen3', name: 'Molai Boti Samosa', slug: 'molai-boti-samosa', category: 'Frozen Items', description: 'Frozen molai boti samosa - 12 pcs.', price: 500, unit: 'Pack', quantityOptions: [
    { label: '1 Pack', value: '1pack', price: 500 }
  ], image: '/images/products/frozen-items/molai-boti-samosa.png', gallery: [], featured: true, best_seller: true, new_arrival: true, available: false, stock_quantity: 30, minimum_order: 1, preparation_time: 'N/A', tags: ['Frozen', 'Samosa', 'Molai Boti'], ingredients: ['Flour', 'Chicken', 'Spices', 'Ghee'], allergens: ['Gluten', 'Dairy'] },
  { id: 'frozen4', name: 'Tikka Samosa', slug: 'tikka-samosa', category: 'Frozen Items', description: 'Frozen tikka samosa - 12 pcs.', price: 500, unit: 'Pack', quantityOptions: [
    { label: '1 Pack', value: '1pack', price: 500 }
  ], image: '/images/products/frozen-items/tikka-samosa.png', gallery: [], featured: false, best_seller: true, new_arrival: false, available: false, stock_quantity: 30, minimum_order: 1, preparation_time: 'N/A', tags: ['Frozen', 'Samosa', 'Tikka'], ingredients: ['Flour', 'Chicken', 'Tikka Spices', 'Ghee'], allergens: ['Gluten', 'Dairy'] },
  { id: 'frozen5', name: 'Chicken Samosa', slug: 'chicken-samosa', category: 'Frozen Items', description: 'Frozen chicken samosa - 12 pcs.', price: 500, unit: 'Pack', quantityOptions: [
    { label: '1 Pack', value: '1pack', price: 500 }
  ], image: '/images/products/frozen-items/chicken-samosa.png', gallery: [], featured: true, best_seller: false, new_arrival: true, available: false, stock_quantity: 30, minimum_order: 1, preparation_time: 'N/A', tags: ['Frozen', 'Samosa', 'Chicken'], ingredients: ['Flour', 'Chicken', 'Spices', 'Ghee'], allergens: ['Gluten', 'Dairy'] },
  { id: 'frozen6', name: 'Chinese Roll', slug: 'chinese-roll', category: 'Frozen Items', description: 'Frozen chinese roll - 12 pcs.', price: 500, unit: 'Pack', quantityOptions: [
    { label: '1 Pack', value: '1pack', price: 500 }
  ], image: '/images/products/frozen-items/chinese-roll.png', gallery: [], featured: false, best_seller: true, new_arrival: false, available: false, stock_quantity: 30, minimum_order: 1, preparation_time: 'N/A', tags: ['Frozen', 'Chinese Roll', 'Snacks'], ingredients: ['Flour', 'Chicken', 'Vegetables', 'Spices', 'Ghee'], allergens: ['Gluten', 'Dairy'] },
  { id: 'frozen7', name: 'Macroni Samosa', slug: 'macroni-samosa', category: 'Frozen Items', description: 'Frozen macroni samosa - 12 pcs.', price: 330, unit: 'Pack', quantityOptions: [
    { label: '1 Pack', value: '1pack', price: 330 }
  ], image: '/images/products/frozen-items/macroni-samosa.png', gallery: [], featured: true, best_seller: false, new_arrival: true, available: false, stock_quantity: 30, minimum_order: 1, preparation_time: 'N/A', tags: ['Frozen', 'Samosa', 'Macroni'], ingredients: ['Flour', 'Macaroni', 'Spices', 'Ghee'], allergens: ['Gluten', 'Dairy'] },
];

export const API = {
  async getProducts(): Promise<Product[]> {
    // For now, always use static product data
    console.log('📦 Using static product data (local images enabled)');
    return staticProducts;
  },

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
      console.warn('⚠️ Categories fetch error, using client fallback.');
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
      
      return {
        valid: true,
        code: code.toUpperCase(),
        type: found.type,
        value: found.value
      };
    }
  },

  async getBranches(): Promise<{ id: string; name: string; address: string }[]> {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('active', true);
        
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('No branches in database');
      
      return data;
    } catch (e) {
      return [
        { id: '1', name: 'Nawabshah Main Branch', address: 'Katchery Road, Nawabshah' },
        { id: '2', name: 'Karachi Clifton Branch', address: 'Block 5, Clifton, Karachi' },
        { id: '3', name: 'Karachi Gulshan Branch', address: 'University Road, Gulshan-e-Iqbal' }
      ];
    }
  },

  async saveOrder(orderData: any): Promise<Order> {
    const order_number = `MAB-${Math.floor(100000 + Math.random() * 900000)}`;
    
    try {
      // 1. Save or match Customer record
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
      } catch (e) {
        console.warn('Customers table insert bypassed:', e);
      }
      
      // 2. Save Delivery Address if applicable
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
        } catch (e) {
          console.warn('Delivery addresses insert bypassed:', e);
        }
      }

      // 3. Save main Order
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
      
      // 4. Save Order Items
      try {
        const itemsPayload = Object.values(orderData.items).map((item: any) => ({
          order_id: orderId,
          product_id: item.product?.id || item.id,
          quantity: item.quantity || item.qty,
          price: item.product?.price || item.price,
          special_instructions: item.notes || null
        }));
        
        await supabase.from('order_items').insert(itemsPayload);
      } catch (e) {
        console.warn('Order items insert bypassed:', e);
      }
      
      // 5. Save Payment Transaction receipt if available
      if (orderData.paymentScreenshot && orderId) {
        try {
          await supabase.from('payments').insert({
            order_id: orderId,
            payment_method: orderData.payment,
            amount: orderData.totals.total,
            receipt_screenshot: orderData.paymentScreenshot,
            status: 'pending'
          });
        } catch (e) {
          console.warn('Payments receipt insert bypassed:', e);
        }
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
      console.warn('⚠️ Seeding transactions failed, placing order in mockup mode:', error);
      
      // Save local mock order for offline/sandbox tracking
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

  async getOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (!data) return [];
      
      // Map to Order interface
      return data.map(o => {
        // Fetch items if joined, else empty
        const itemsList: any[] = [];
        return {
          id: o.order_number,
          customer_name: o.customer_name || 'Customer',
          customer_phone: o.customer_phone || '',
          customer_email: o.customer_email || undefined,
          total_amount: Number(o.total || o.subtotal),
          status: this.mapStatus(o.status),
          type: o.delivery_type as 'delivery' | 'pickup',
          delivery_fee: Number(o.delivery_charges || 0),
          tax: Number(o.tax || 0),
          discount: Number(o.discount || 0),
          notes: o.notes || '',
          created_at: o.created_at,
          items: itemsList
        };
      });
    } catch (e) {
      // Mockup retrieve
      return JSON.parse(localStorage.getItem('mab_orders_mock') || '[]');
    }
  },

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', id.toUpperCase())
        .maybeSingle();
        
      if (error) throw error;
      if (!data) {
        // Check mock orders
        const mocks: Order[] = JSON.parse(localStorage.getItem('mab_orders_mock') || '[]');
        const found = mocks.find(o => o.id.toUpperCase() === id.toUpperCase());
        return found || null;
      }
      
      return {
        id: data.order_number,
        customer_name: data.customer_name || 'Customer',
        customer_phone: data.customer_phone || '',
        customer_email: data.customer_email || undefined,
        total_amount: Number(data.total),
        status: this.mapStatus(data.status),
        type: data.delivery_type as 'delivery' | 'pickup',
        delivery_fee: Number(data.delivery_charges || 0),
        tax: Number(data.tax || 0),
        discount: Number(data.discount || 0),
        notes: data.notes || '',
        created_at: data.created_at,
        items: [] // In a real system we would query order_items too
      };
    } catch (e) {
      const mocks: Order[] = JSON.parse(localStorage.getItem('mab_orders_mock') || '[]');
      const found = mocks.find(o => o.id.toUpperCase() === id.toUpperCase());
      return found || null;
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
      // Mock orders status update
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
