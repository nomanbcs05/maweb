// seed.js
// Script to seed product catalog into Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gomoktykrsdfxgxoadph.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvbW9rdHlrcnNkZnhneG9hZHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNDA3MzEsImV4cCI6MjA5OTcxNjczMX0.TtNqLqEDB4x1H1HPhsqQhAGOynlYkp6ubUzdzu7byCQ';

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL and Key are required in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
  { name: 'Cakes', slug: 'cakes', display_order: 1 },
  { name: 'Cupcakes & Breads', slug: 'cupcakes-breads', display_order: 2 },
  { name: 'Pastries', slug: 'pastries', display_order: 3 },
  { name: 'Frozen Items', slug: 'frozen-items', display_order: 4 },
  { name: 'Tea Time Munchies', slug: 'tea-time-munchies', display_order: 5 }
];

const products = [
  // 1. Cakes
  {
    name: 'Black Forest Cake',
    slug: 'black-forest-cake',
    category: 'Cakes',
    description: 'Rich layers of chocolate sponge cake, whipped cream, and cherries.',
    price: 600,
    unit: 'Pound',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80&auto=format',
    featured: true,
    best_seller: true,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '2 hours',
    tags: ['chocolate', 'cream', 'cherry', 'classic']
  },
  {
    name: 'Pineapple Ice Cake',
    slug: 'pineapple-ice-cake',
    category: 'Cakes',
    description: 'Light, moist sponge filled with fresh pineapples and luscious whipped cream.',
    price: 550,
    unit: 'Pound',
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&q=80&auto=format',
    featured: false,
    best_seller: true,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '2 hours',
    tags: ['fruit', 'cream', 'pineapple']
  },
  {
    name: 'Dry Fruit Cake',
    slug: 'dry-fruit-cake',
    category: 'Cakes',
    description: 'Traditional rich tea cake packed with premium almonds, walnuts, and raisins.',
    price: 600,
    unit: 'Pound',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80&auto=format',
    featured: false,
    best_seller: false,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '1 hour',
    tags: ['dry fruit', 'tea cake', 'nuts']
  },
  {
    name: 'Three Milky Cake',
    slug: 'three-milky-cake',
    category: 'Cakes',
    description: 'Sensational Tres Leches cake soaked in three kinds of milk, topped with whipped cream.',
    price: 1300,
    unit: 'KG',
    image: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=600&q=80&auto=format',
    featured: true,
    best_seller: true,
    new_arrival: true,
    available: true,
    stock_quantity: -1,
    preparation_time: '4 hours',
    tags: ['milk', 'tres leches', 'creamy']
  },
  {
    name: 'Bombay Chocolate Cake',
    slug: 'bombay-chocolate-cake',
    category: 'Cakes',
    description: 'Ultra-rich fudge cake with smooth, dark chocolate ganache layering.',
    price: 600,
    unit: 'Pound',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80&auto=format',
    featured: true,
    best_seller: true,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '2 hours',
    tags: ['chocolate', 'fudge', 'rich']
  },
  {
    name: 'Bombay Coffee Cake',
    slug: 'bombay-coffee-cake',
    category: 'Cakes',
    description: 'Infused with premium espresso, layered with silky coffee buttercream.',
    price: 600,
    unit: 'Pound',
    image: 'https://images.unsplash.com/photo-1516685018646-549198525c1b?w=600&q=80&auto=format',
    featured: false,
    best_seller: false,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '2 hours',
    tags: ['coffee', 'mocha', 'buttercream']
  },
  {
    name: 'Brownie Cake',
    slug: 'brownie-cake',
    category: 'Cakes',
    description: 'Combination of dense, fudgy chocolate brownie layers and smooth frosting.',
    price: 700,
    unit: 'Pound',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80&auto=format',
    featured: false,
    best_seller: false,
    new_arrival: true,
    available: true,
    stock_quantity: -1,
    preparation_time: '3 hours',
    tags: ['brownie', 'chocolate', 'dense']
  },

  // 2. Frozen Items
  {
    name: 'Plain Paratha (5 PC)',
    slug: 'plain-paratha-5pc',
    category: 'Frozen Items',
    description: 'Flaky, layered traditional flatbreads. Frozen and ready to fry.',
    price: 180,
    unit: 'Packet',
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&q=80&auto=format',
    featured: false,
    best_seller: true,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '15 mins',
    tags: ['paratha', 'frozen', 'breakfast']
  },
  {
    name: 'Plain Paratha (30 PC)',
    slug: 'plain-paratha-30pc',
    category: 'Frozen Items',
    description: 'Bulk packet of flaky, layered flatbreads. Keep frozen.',
    price: 850,
    unit: 'Packet',
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&q=80&auto=format',
    featured: false,
    best_seller: false,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '15 mins',
    tags: ['paratha', 'frozen', 'bulk']
  },
  {
    name: 'Malai Boti Samosa (12 PC)',
    slug: 'malai-boti-samosa-12pc',
    category: 'Frozen Items',
    description: 'Crisp samosas stuffed with creamy, marinated chicken malai boti.',
    price: 500,
    unit: 'Packet',
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&q=80&auto=format',
    featured: true,
    best_seller: true,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '15 mins',
    tags: ['samosa', 'chicken', 'malai boti', 'frozen']
  },
  {
    name: 'Tikka Samosa (12 PC)',
    slug: 'tikka-samosa-12pc',
    category: 'Frozen Items',
    description: 'Samosas filled with spicy chicken tikka chunks and onions.',
    price: 500,
    unit: 'Packet',
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&q=80&auto=format',
    featured: false,
    best_seller: false,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '15 mins',
    tags: ['samosa', 'chicken', 'tikka', 'frozen']
  },
  {
    name: 'Chicken Pocket (6 PC)',
    slug: 'chicken-pocket-6pc',
    category: 'Frozen Items',
    description: 'Savory pastry pockets loaded with seasoned chicken and vegetables.',
    price: 300,
    unit: 'Packet',
    image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=600&q=80&auto=format',
    featured: false,
    best_seller: false,
    new_arrival: true,
    available: true,
    stock_quantity: -1,
    preparation_time: '15 mins',
    tags: ['pocket', 'chicken', 'frozen']
  },
  {
    name: 'Chinese Roll (6 PC)',
    slug: 'chinese-roll-6pc',
    category: 'Frozen Items',
    description: 'Golden rolls packed with classic Chinese vegetables and shredded chicken.',
    price: 300,
    unit: 'Packet',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80&auto=format',
    featured: true,
    best_seller: true,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '15 mins',
    tags: ['roll', 'chinese', 'frozen']
  },
  {
    name: 'Macaroni Samosa (12 PC)',
    slug: 'macaroni-samosa-12pc',
    category: 'Frozen Items',
    description: 'Unique fusion samosa stuffed with spicy macaroni and cheese.',
    price: 300,
    unit: 'Packet',
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&q=80&auto=format',
    featured: false,
    best_seller: false,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '15 mins',
    tags: ['samosa', 'macaroni', 'frozen']
  },

  // 3. Tea Time Munchies
  {
    name: 'Khaaray',
    slug: 'khaaray',
    category: 'Tea Time Munchies',
    description: 'Crispy puff pastry biscuits, perfectly salted for your tea time.',
    price: 660,
    unit: 'KG',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80&auto=format',
    featured: false,
    best_seller: true,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '10 mins',
    tags: ['puff pastry', 'salty', 'bakery', 'tea time']
  },
  {
    name: 'Biscuits',
    slug: 'biscuits',
    category: 'Tea Time Munchies',
    description: 'Freshly baked assorted butter biscuits.',
    price: 1100,
    unit: 'KG',
    image: 'https://images.unsplash.com/photo-1548982458-3e401036774a?w=600&q=80&auto=format',
    featured: false,
    best_seller: false,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '10 mins',
    tags: ['biscuits', 'sweet', 'butter']
  },
  {
    name: 'Sugar Free Biscuits',
    slug: 'sugar-free-biscuits',
    category: 'Tea Time Munchies',
    description: 'Healthy, sugar-free oats and fiber biscuits for guilt-free snacking.',
    price: 1200,
    unit: 'KG',
    image: 'https://images.unsplash.com/photo-1548982458-3e401036774a?w=600&q=80&auto=format',
    featured: false,
    best_seller: false,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '10 mins',
    tags: ['sugar free', 'diet', 'healthy']
  },
  {
    name: 'Rusks',
    slug: 'rusks',
    category: 'Tea Time Munchies',
    description: 'Double-baked crispy rusks, a classic match for morning tea.',
    price: 560,
    unit: 'KG',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80&auto=format',
    featured: false,
    best_seller: true,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '10 mins',
    tags: ['rusk', 'crisp', 'traditional']
  },
  {
    name: 'Slice Cake',
    slug: 'slice-cake',
    category: 'Tea Time Munchies',
    description: 'Soft, yellow vanilla sponge slice cake.',
    price: 150,
    unit: 'Piece',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80&auto=format',
    featured: true,
    best_seller: true,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '10 mins',
    tags: ['cake slice', 'tea cake', 'sponge']
  },
  {
    name: 'Vegetable Patties',
    slug: 'vegetable-patties',
    category: 'Tea Time Munchies',
    description: 'Flaky puff pastry stuffed with a spiced mixed vegetable filling.',
    price: 40,
    unit: 'Piece',
    image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=600&q=80&auto=format',
    featured: false,
    best_seller: false,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '15 mins',
    tags: ['patties', 'veg', 'savoury']
  },
  {
    name: 'Chicken Patties',
    slug: 'chicken-patties',
    category: 'Tea Time Munchies',
    description: 'Classic bakery chicken patties in golden, flaky pastry shells.',
    price: 50,
    unit: 'Piece',
    image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=600&q=80&auto=format',
    featured: true,
    best_seller: true,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '15 mins',
    tags: ['patties', 'chicken', 'puff pastry']
  },
  {
    name: 'Rusk Cake',
    slug: 'rusk-cake',
    category: 'Tea Time Munchies',
    description: 'Delightfully crunchy sweet rusk cake.',
    price: 1200,
    unit: 'KG',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80&auto=format',
    featured: false,
    best_seller: false,
    new_arrival: true,
    available: true,
    stock_quantity: -1,
    preparation_time: '10 mins',
    tags: ['rusk cake', 'sweet', 'crunchy']
  },

  // 4. Cupcakes & Breads
  {
    name: 'Cupcakes',
    slug: 'cupcakes',
    category: 'Cupcakes & Breads',
    description: 'Perfectly baked vanilla or chocolate cupcakes with cream frosting.',
    price: 50,
    unit: 'Piece',
    image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=600&q=80&auto=format',
    featured: false,
    best_seller: true,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '30 mins',
    tags: ['cupcakes', 'cream', 'sweet']
  },
  {
    name: 'Bakery Bread',
    slug: 'bakery-bread',
    category: 'Cupcakes & Breads',
    description: 'Freshly baked daily sandwich bread, soft and large.',
    price: 160,
    unit: 'Piece',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80&auto=format',
    featured: true,
    best_seller: true,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '10 mins',
    tags: ['bread', 'sandwich', 'plain']
  },
  {
    name: 'Pita Bread',
    slug: 'pita-bread',
    category: 'Cupcakes & Breads',
    description: 'Soft pocket pita bread, perfect for shawarmas and wraps.',
    price: 100,
    unit: 'Packet',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80&auto=format',
    featured: false,
    best_seller: false,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '10 mins',
    tags: ['pita', 'bread', 'pocket']
  },
  {
    name: 'Burger Buns',
    slug: 'burger-buns',
    category: 'Cupcakes & Breads',
    description: 'Soft burger buns topped with sesame seeds.',
    price: 25,
    unit: 'Piece',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80&auto=format',
    featured: false,
    best_seller: true,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '10 mins',
    tags: ['bun', 'burger', 'sesame']
  },

  // 5. Pastries
  {
    name: 'Bombay Chocolate Pastry',
    slug: 'bombay-chocolate-pastry',
    category: 'Pastries',
    description: 'Individual slice of our signature rich Bombay chocolate cake.',
    price: 100,
    unit: 'Piece',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80&auto=format',
    featured: true,
    best_seller: true,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '10 mins',
    tags: ['chocolate', 'pastry', 'slice']
  },
  {
    name: 'Bombay Coffee Pastry',
    slug: 'bombay-coffee-pastry',
    category: 'Pastries',
    description: 'Individual slice of coffee-infused cream pastry.',
    price: 100,
    unit: 'Piece',
    image: 'https://images.unsplash.com/photo-1516685018646-549198525c1b?w=600&q=80&auto=format',
    featured: false,
    best_seller: false,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '10 mins',
    tags: ['coffee', 'pastry', 'slice']
  },
  {
    name: 'Sundae Small',
    slug: 'sundae-small',
    category: 'Pastries',
    description: 'Creamy mousse sundae cup with chocolate drizzle and biscuit crumble.',
    price: 130,
    unit: 'Piece',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80&auto=format',
    featured: false,
    best_seller: true,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '10 mins',
    tags: ['sundae', 'chocolate', 'cup']
  },
  {
    name: 'Sundae Large',
    slug: 'sundae-large',
    category: 'Pastries',
    description: 'Large premium mousse sundae cup with chocolate chips.',
    price: 180,
    unit: 'Piece',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80&auto=format',
    featured: true,
    best_seller: true,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '10 mins',
    tags: ['sundae', 'chocolate', 'large']
  },
  {
    name: 'Red Velvet Pastry',
    slug: 'red-velvet-pastry',
    category: 'Pastries',
    description: 'Bright red sponge layered with sweet cream cheese frosting.',
    price: 100,
    unit: 'Piece',
    image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=600&q=80&auto=format',
    featured: false,
    best_seller: false,
    new_arrival: true,
    available: true,
    stock_quantity: -1,
    preparation_time: '10 mins',
    tags: ['red velvet', 'pastry', 'cream cheese']
  },
  {
    name: 'Black Forest Pastry',
    slug: 'black-forest-pastry',
    category: 'Pastries',
    description: 'Classic chocolate pastry with cherries and whipped cream.',
    price: 100,
    unit: 'Piece',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80&auto=format',
    featured: false,
    best_seller: true,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '10 mins',
    tags: ['pastry', 'chocolate', 'cream']
  },
  {
    name: 'Pineapple Pastry',
    slug: 'pineapple-pastry',
    category: 'Pastries',
    description: 'Sweet, juicy pineapple layers in a light cream pastry.',
    price: 100,
    unit: 'Piece',
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&q=80&auto=format',
    featured: false,
    best_seller: false,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '10 mins',
    tags: ['pastry', 'pineapple', 'fruit']
  },
  {
    name: 'Brownie',
    slug: 'brownie',
    category: 'Pastries',
    description: 'Rich, dense, and fudgy dark chocolate brownie.',
    price: 100,
    unit: 'Piece',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80&auto=format',
    featured: true,
    best_seller: true,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '10 mins',
    tags: ['brownie', 'chocolate', 'fudge']
  },
  {
    name: 'Chocolate Cream Puff',
    slug: 'chocolate-cream-puff',
    category: 'Pastries',
    description: 'Light chux pastry filled with whipped cream and glazed in chocolate.',
    price: 80,
    unit: 'Piece',
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=600&q=80&auto=format',
    featured: false,
    best_seller: false,
    new_arrival: false,
    available: true,
    stock_quantity: -1,
    preparation_time: '20 mins',
    tags: ['puff', 'chux', 'cream', 'chocolate']
  }
];

async function seed() {
  console.log("Seeding started...");
  
  // Clean products first (optional, but good for restart/fresh)
  const { error: dErr } = await supabase.from('products').delete().neq('name', '');
  if (dErr) console.error("Clean error:", dErr);

  // Insert Categories
  const { error: catErr } = await supabase.from('categories').upsert(categories, { onConflict: 'name' });
  if (catErr) {
    console.error("Error seeding categories:", catErr);
    return;
  }
  console.log("Categories seeded successfully.");

  // Insert Products
  const { error: prodErr } = await supabase.from('products').insert(products);
  if (prodErr) {
    console.error("Error seeding products:", prodErr);
  } else {
    console.log("Products seeded successfully.");
  }
}

seed();
