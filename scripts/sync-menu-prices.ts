// scripts/sync-menu-prices.ts
// Syncs all prices exactly to M.A Bakers menu and generates KG variants.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gomoktykrsdfxgxoadph.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvbW9rdHlrcnNkZnhneG9hZHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNDA3MzEsImV4cCI6MjA5OTcxNjczMX0.TtNqLqEDB4x1H1HPhsqQhAGOynlYkp6ubUzdzu7byCQ';

const supabase = createClient(supabaseUrl, supabaseKey);

export const KG_CATEGORIES = ['Khaaray', 'Biscuits', 'Rusks', 'Sugar Free Biscuits', 'Rusk Cakes'];

export const calculateGramPrice = (kgPrice: number, grams: number): number => {
  return Math.round((kgPrice / 1000) * grams);
};

export const generateKgVariants = (kgPrice: number) => {
  return [
    { label: '250g', value: '250g', price: calculateGramPrice(kgPrice, 250) },
    { label: '500g', value: '500g', price: calculateGramPrice(kgPrice, 500) },
    { label: '1kg', value: '1kg', price: kgPrice }
  ];
};

export interface MenuProduct {
  name: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  image: string;
  featured?: boolean;
  best_seller?: boolean;
  new_arrival?: boolean;
  available?: boolean;
  tags?: string[];
  quantityOptions?: { label: string; value: string; price: number }[];
}

export const menuProducts: MenuProduct[] = [
  // ==========================================
  // CAKES - Base is per pound except Three milky cake
  // ==========================================
  {
    name: 'Black Forest cake',
    slug: 'black-forest-cake',
    category: 'Cakes',
    description: 'Classic black forest cake with rich cherries and chocolate layers.',
    price: 600,
    unit: 'Pound',
    image: '/images/products/cakes/black-forest-cake.png',
    featured: true,
    best_seller: true,
    tags: ['Chocolate', 'Cherry'],
    quantityOptions: [
      { label: '1LB', value: '1lb', price: 600 },
      { label: '2LB', value: '2lb', price: 1200 }
    ]
  },
  {
    name: 'Pineapple ice cake',
    slug: 'pineapple-ice-cake',
    category: 'Cakes',
    description: 'Refreshing pineapple ice cake with fresh pineapple cream.',
    price: 550,
    unit: 'Pound',
    image: '/images/products/cakes/pineapple-ice-cake.png',
    featured: false,
    best_seller: true,
    tags: ['Pineapple', 'Ice Cake'],
    quantityOptions: [
      { label: '1LB', value: '1lb', price: 550 },
      { label: '2LB', value: '2lb', price: 1100 }
    ]
  },
  {
    name: 'Dry fruit cake',
    slug: 'dry-fruit-cake',
    category: 'Cakes',
    description: 'Rich dry fruit cake with assorted nuts and fruits.',
    price: 600,
    unit: 'Pound',
    image: '/images/products/cakes/dry-fruit-cake.png',
    featured: true,
    best_seller: true,
    tags: ['Dry Fruit', 'Nuts'],
    quantityOptions: [
      { label: '1LB', value: '1lb', price: 600 },
      { label: '2LB', value: '2lb', price: 1200 }
    ]
  },
  {
    name: 'Three milky cake',
    slug: 'three-milky-cake',
    category: 'Cakes',
    description: 'Moist three milk (tres leches) cake soaked in three varieties of milk.',
    price: 1300,
    unit: 'KG',
    image: '/images/products/cakes/three-milk-cake.png',
    featured: true,
    best_seller: true,
    tags: ['Three Milk', 'Tres Leches'],
    quantityOptions: generateKgVariants(1300)
  },
  {
    name: 'Bombay Chocolate',
    slug: 'bombay-chocolate',
    category: 'Cakes',
    description: 'Rich Bombay chocolate cake with dark chocolate ganache.',
    price: 600,
    unit: 'Pound',
    image: '/images/products/cakes/bombay-chocolate.png',
    featured: true,
    best_seller: false,
    tags: ['Chocolate', 'Bombay'],
    quantityOptions: [
      { label: '1LB', value: '1lb', price: 600 },
      { label: '2LB', value: '2lb', price: 1200 }
    ]
  },
  {
    name: 'Bombay Coffee',
    slug: 'bombay-coffee',
    category: 'Cakes',
    description: 'Delicious Bombay coffee flavored cake.',
    price: 600,
    unit: 'Pound',
    image: '/images/products/cakes/bombay-coffee.png',
    featured: false,
    best_seller: true,
    tags: ['Coffee', 'Bombay'],
    quantityOptions: [
      { label: '1LB', value: '1lb', price: 600 },
      { label: '2LB', value: '2lb', price: 1200 }
    ]
  },
  {
    name: 'Brownie Cake',
    slug: 'brownie-cake',
    category: 'Cakes',
    description: 'Fudgy brownie cake with smooth chocolate frosting.',
    price: 700,
    unit: 'Pound',
    image: '/images/products/cakes/brownie-cake.png',
    featured: true,
    best_seller: false,
    tags: ['Brownie', 'Chocolate'],
    quantityOptions: [
      { label: '1LB', value: '1lb', price: 700 },
      { label: '2LB', value: '2lb', price: 1400 }
    ]
  },

  // ==========================================
  // TEA TIME MUNCHIES - Base is per KG
  // ==========================================
  {
    name: 'Khaaray',
    slug: 'khaaray',
    category: 'Tea Time Munchies',
    description: 'Crispy salted puff pastry khaaray for tea time.',
    price: 660,
    unit: 'KG',
    image: '/images/products/cookies/khaasry.png',
    featured: true,
    best_seller: true,
    tags: ['Khaaray', 'Tea Time'],
    quantityOptions: generateKgVariants(660)
  },
  {
    name: 'Biscuits',
    slug: 'biscuits',
    category: 'Tea Time Munchies',
    description: 'Freshly baked classic assorted biscuits.',
    price: 1100,
    unit: 'KG',
    image: '/images/products/cookies/biscuits.png',
    featured: false,
    best_seller: false,
    tags: ['Biscuits', 'Tea Time'],
    quantityOptions: generateKgVariants(1100)
  },
  {
    name: 'Sugar free Biscuits',
    slug: 'sugar-free-biscuits',
    category: 'Tea Time Munchies',
    description: 'Healthy sugar-free biscuits for diet-conscious tea lovers.',
    price: 1200,
    unit: 'KG',
    image: '/images/products/cookies/sugar-free-biscuits.png',
    featured: true,
    best_seller: true,
    tags: ['Sugar Free', 'Biscuits'],
    quantityOptions: generateKgVariants(1200)
  },
  {
    name: 'Rusks',
    slug: 'rusks',
    category: 'Tea Time Munchies',
    description: 'Double baked crispy golden rusks.',
    price: 560,
    unit: 'KG',
    image: '/images/products/cookies/rusks.png',
    featured: false,
    best_seller: true,
    tags: ['Rusks', 'Tea Time'],
    quantityOptions: generateKgVariants(560)
  },
  {
    name: 'Rusk Cake',
    slug: 'rusk-cake',
    category: 'Tea Time Munchies',
    description: 'Crunchy and sweet rusk cake.',
    price: 1200,
    unit: 'KG',
    image: '/images/products/cookies/rusk-cake.png',
    featured: false,
    best_seller: false,
    tags: ['Rusk Cake', 'Tea Time'],
    quantityOptions: generateKgVariants(1200)
  },
  {
    name: 'Slice cake',
    slug: 'slice-cake',
    category: 'Tea Time Munchies',
    description: 'Soft golden tea-time vanilla sponge slice cake.',
    price: 150,
    unit: 'Piece',
    image: '/images/products/cookies/slice-cake.png',
    featured: true,
    best_seller: false,
    tags: ['Slice Cake', 'Tea Time'],
    quantityOptions: [{ label: '1 PC', value: '1pc', price: 150 }]
  },
  {
    name: 'Vegetable patties',
    slug: 'vegetable-patties',
    category: 'Tea Time Munchies',
    description: 'Flaky puff pastry filled with spiced vegetables.',
    price: 40,
    unit: 'Piece',
    image: '/images/products/cookies/vegetable-patties.png',
    featured: false,
    best_seller: true,
    tags: ['Patties', 'Vegetable'],
    quantityOptions: [{ label: '1 PC', value: '1pc', price: 40 }]
  },
  {
    name: 'Chicken patties',
    slug: 'chicken-patties',
    category: 'Tea Time Munchies',
    description: 'Fresh chicken patties in crisp golden puff pastry.',
    price: 50,
    unit: 'Piece',
    image: '/images/products/cookies/chicken-patties.png',
    featured: true,
    best_seller: true,
    tags: ['Patties', 'Chicken'],
    quantityOptions: [{ label: '1 PC', value: '1pc', price: 50 }]
  },

  // ==========================================
  // M.A FROZEN ITEMS
  // ==========================================
  {
    name: 'Plain Paratha 5PC',
    slug: 'plain-paratha-5pc',
    category: 'Frozen Items',
    description: 'Frozen flaky layered plain parathas - 5 pcs pack.',
    price: 180,
    unit: 'Packet',
    image: '/images/products/frozen-items/plain-paratha.png',
    featured: true,
    best_seller: true,
    tags: ['Frozen', 'Paratha'],
    quantityOptions: [{ label: '5 PC', value: '5pc', price: 180 }]
  },
  {
    name: 'Plain Paratha 30PC',
    slug: 'plain-paratha-30pc',
    category: 'Frozen Items',
    description: 'Bulk frozen plain parathas - 30 pcs family pack.',
    price: 850,
    unit: 'Packet',
    image: '/images/products/frozen-items/plain-paratha-30.png',
    featured: false,
    best_seller: false,
    tags: ['Frozen', 'Paratha', 'Family Pack'],
    quantityOptions: [{ label: '30 PC', value: '30pc', price: 850 }]
  },
  {
    name: 'Malai Boti Samosa 12PC',
    slug: 'malai-boti-samosa-12pc',
    category: 'Frozen Items',
    description: 'Creamy marinated chicken malai boti samosas - 12 pcs pack.',
    price: 500,
    unit: 'Packet',
    image: '/images/products/frozen-items/molai-boti-samosa.png',
    featured: true,
    best_seller: true,
    available: false,
    tags: ['Frozen', 'Samosa', 'Malai Boti'],
    quantityOptions: [{ label: '12 PC', value: '12pc', price: 500 }]
  },
  {
    name: 'Tikka Samosa 12PC',
    slug: 'tikka-samosa-12pc',
    category: 'Frozen Items',
    description: 'Spicy chicken tikka stuffed samosas - 12 pcs pack.',
    price: 500,
    unit: 'Packet',
    image: '/images/products/frozen-items/tikka-samosa.png',
    featured: false,
    best_seller: true,
    available: false,
    tags: ['Frozen', 'Samosa', 'Tikka'],
    quantityOptions: [{ label: '12 PC', value: '12pc', price: 500 }]
  },
  {
    name: 'Chicken Pocket 6PC',
    slug: 'chicken-pocket-6pc',
    category: 'Frozen Items',
    description: 'Savory crispy pastry pockets with spiced chicken - 6 pcs.',
    price: 300,
    unit: 'Packet',
    image: '/images/products/frozen-items/chicken-samosa.png',
    featured: false,
    best_seller: false,
    available: false,
    tags: ['Frozen', 'Chicken Pocket'],
    quantityOptions: [{ label: '6 PC', value: '6pc', price: 300 }]
  },
  {
    name: 'Chinese Roll 6PC',
    slug: 'chinese-roll-6pc',
    category: 'Frozen Items',
    description: 'Golden rolls packed with vegetables and chicken - 6 pcs.',
    price: 300,
    unit: 'Packet',
    image: '/images/products/frozen-items/chinese-roll.png',
    featured: true,
    best_seller: true,
    available: false,
    tags: ['Frozen', 'Chinese Roll'],
    quantityOptions: [{ label: '6 PC', value: '6pc', price: 300 }]
  },
  {
    name: 'Macroni Samosa 12PC',
    slug: 'macroni-samosa-12pc',
    category: 'Frozen Items',
    description: 'Spicy macaroni filled crispy samosas - 12 pcs pack.',
    price: 300,
    unit: 'Packet',
    image: '/images/products/frozen-items/macroni-samosa.png',
    featured: true,
    best_seller: false,
    available: false,
    tags: ['Frozen', 'Macroni Samosa'],
    quantityOptions: [{ label: '12 PC', value: '12pc', price: 300 }]
  },

  // ==========================================
  // CUPCAKES & BREADS
  // ==========================================
  {
    name: 'Cupcakes',
    slug: 'cupcakes',
    category: 'Cupcakes & Breads',
    description: 'Freshly baked cupcakes with delicious swirl frosting.',
    price: 50,
    unit: 'Piece',
    image: '/images/products/breads/cupcakes.png',
    featured: true,
    best_seller: true,
    tags: ['Cupcakes', 'Sweet'],
    quantityOptions: [{ label: '1 PC', value: '1pc', price: 50 }]
  },
  {
    name: 'Bakery bread',
    slug: 'bakery-bread',
    category: 'Cupcakes & Breads',
    description: 'Soft, freshly baked daily sandwich bakery bread.',
    price: 160,
    unit: 'Piece',
    image: '/images/products/breads/pita-bread.png',
    featured: true,
    best_seller: true,
    tags: ['Bread', 'Bakery'],
    quantityOptions: [{ label: '1 PC', value: '1pc', price: 160 }]
  },
  {
    name: 'Pita bread',
    slug: 'pita-bread',
    category: 'Cupcakes & Breads',
    description: 'Soft pocket pita bread, perfect for rolls and shawarma.',
    price: 100,
    unit: 'Packet',
    image: '/images/products/breads/pita-bread.png',
    featured: false,
    best_seller: true,
    tags: ['Bread', 'Pita'],
    quantityOptions: [{ label: '1 PKT', value: '1pkt', price: 100 }]
  },
  {
    name: 'Burger buns',
    slug: 'burger-buns',
    category: 'Cupcakes & Breads',
    description: 'Fresh soft burger buns with sesame topping.',
    price: 25,
    unit: 'Piece',
    image: '/images/products/breads/burger-buns.png',
    featured: true,
    best_seller: true,
    tags: ['Burger Buns', 'Bread'],
    quantityOptions: [{ label: '1 PC', value: '1pc', price: 25 }]
  },

  // ==========================================
  // PASTRIES
  // ==========================================
  {
    name: 'Bombay Chocolate pastry',
    slug: 'bombay-chocolate-pastry',
    category: 'Pastries',
    description: 'Single slice of our signature rich Bombay chocolate cake.',
    price: 100,
    unit: 'Piece',
    image: '/images/products/pastries/bombay-chocolate-pastry.png',
    featured: true,
    best_seller: true,
    tags: ['Pastry', 'Chocolate'],
    quantityOptions: [{ label: '1 PC', value: '1pc', price: 100 }]
  },
  {
    name: 'Bombay Coffee pastry',
    slug: 'bombay-coffee-pastry',
    category: 'Pastries',
    description: 'Rich coffee flavored cream pastry slice.',
    price: 100,
    unit: 'Piece',
    image: '/images/products/pastries/Bombay_Cake_1254x1254.png',
    featured: true,
    best_seller: false,
    tags: ['Pastry', 'Coffee'],
    quantityOptions: [{ label: '1 PC', value: '1pc', price: 100 }]
  },
  {
    name: 'Sundae Small',
    slug: 'sundae-small',
    category: 'Pastries',
    description: 'Creamy chocolate sundae mousse cup.',
    price: 130,
    unit: 'Piece',
    image: '/images/products/pastries/sundae-small.png',
    featured: false,
    best_seller: true,
    tags: ['Pastry', 'Sundae'],
    quantityOptions: [{ label: '1 PC', value: '1pc', price: 130 }]
  },
  {
    name: 'Sundae Large',
    slug: 'sundae-large',
    category: 'Pastries',
    description: 'Large premium chocolate sundae cup with chips.',
    price: 140,
    unit: 'Piece',
    image: '/images/products/pastries/sundae-small.png',
    featured: true,
    best_seller: true,
    tags: ['Pastry', 'Sundae Large'],
    quantityOptions: [{ label: '1 PC', value: '1pc', price: 140 }]
  },
  {
    name: 'Red velvet pastry',
    slug: 'red-velvet-pastry',
    category: 'Pastries',
    description: 'Bright red velvet sponge layered with sweet cream cheese.',
    price: 100,
    unit: 'Piece',
    image: '/images/products/pastries/red-velvet-pastry.png',
    featured: true,
    best_seller: false,
    tags: ['Pastry', 'Red Velvet'],
    quantityOptions: [{ label: '1 PC', value: '1pc', price: 100 }]
  },
  {
    name: 'Black Forest pastry',
    slug: 'black-forest-pastry',
    category: 'Pastries',
    description: 'Classic black forest pastry with cherries and chocolate.',
    price: 100,
    unit: 'Piece',
    image: '/images/products/pastries/black-forest-pastry.png',
    featured: false,
    best_seller: true,
    tags: ['Pastry', 'Black Forest'],
    quantityOptions: [{ label: '1 PC', value: '1pc', price: 100 }]
  },
  {
    name: 'Pineapple pastry',
    slug: 'pineapple-pastry',
    category: 'Pastries',
    description: 'Refreshing pineapple cream pastry slice.',
    price: 100,
    unit: 'Piece',
    image: '/images/products/pastries/pineapple-pastry.png',
    featured: true,
    best_seller: false,
    tags: ['Pastry', 'Pineapple'],
    quantityOptions: [{ label: '1 PC', value: '1pc', price: 100 }]
  },
  {
    name: 'Brownie',
    slug: 'brownie',
    category: 'Pastries',
    description: 'Dense, rich and fudgy chocolate brownie.',
    price: 100,
    unit: 'Piece',
    image: '/images/products/pastries/chocolate-cream-puff.png',
    featured: true,
    best_seller: true,
    tags: ['Brownie', 'Pastry'],
    quantityOptions: [{ label: '1 PC', value: '1pc', price: 100 }]
  },
  {
    name: 'Chocolate cream puff',
    slug: 'chocolate-cream-puff',
    category: 'Pastries',
    description: 'Delicate choux pastry filled with whipped cream & glazed with chocolate.',
    price: 80,
    unit: 'Piece',
    image: '/images/products/pastries/chocolate-cream-puff.png',
    featured: false,
    best_seller: true,
    tags: ['Pastry', 'Cream Puff'],
    quantityOptions: [{ label: '1 PC', value: '1pc', price: 80 }]
  }
];

export async function syncMenuPrices() {
  console.log('🔄 Starting menu prices synchronization...');

  // Fetch current products from Supabase
  const { data: existingProducts, error: fetchErr } = await supabase
    .from('products')
    .select('id, name, slug, price');

  if (fetchErr) {
    console.warn('⚠️ Notice: Could not read existing products from Supabase:', fetchErr.message);
  }

  const existingMap = new Map<string, any>();
  if (existingProducts && Array.isArray(existingProducts)) {
    for (const p of existingProducts) {
      if (p.slug) existingMap.set(p.slug.toLowerCase(), p);
      if (p.name) existingMap.set(p.name.toLowerCase(), p);
    }
  }

  let updatedCount = 0;
  let createdCount = 0;

  for (const item of menuProducts) {
    // If KG category, auto-generate variants if not provided
    if (item.unit === 'KG' && (!item.quantityOptions || item.quantityOptions.length === 0)) {
      item.quantityOptions = generateKgVariants(item.price);
    }

    const existing = existingMap.get(item.slug.toLowerCase()) || existingMap.get(item.name.toLowerCase());

    if (existing) {
      // Update price and details
      const { error: updateErr } = await supabase
        .from('products')
        .update({
          price: item.price,
          unit: item.unit,
          description: item.description,
          category: item.category
        })
        .eq('id', existing.id);

      if (updateErr) {
        console.warn(`⚠️ Failed to update ${item.name}:`, updateErr.message);
      } else {
        console.log(`✅ Updated price for: ${item.name} -> Rs. ${item.price}`);
        updatedCount++;
      }
    } else {
      // Create new product
      const { error: insertErr } = await supabase
        .from('products')
        .insert({
          name: item.name,
          slug: item.slug,
          category: item.category,
          description: item.description,
          price: item.price,
          unit: item.unit,
          image: item.image,
          featured: item.featured ?? false,
          best_seller: item.best_seller ?? false,
          new_arrival: item.new_arrival ?? false,
          available: item.available ?? true,
          tags: item.tags ?? []
        });

      if (insertErr) {
        console.warn(`⚠️ Failed to insert ${item.name}:`, insertErr.message);
      } else {
        console.log(`🆕 Created product: ${item.name} -> Rs. ${item.price}`);
        createdCount++;
      }
    }
  }

  console.log(`\n🎉 Menu price sync completed: ${updatedCount} updated, ${createdCount} created.`);
}

// Execute if run directly
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('sync-menu-prices')) {
  syncMenuPrices()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal sync error:', err);
      process.exit(1);
    });
}
