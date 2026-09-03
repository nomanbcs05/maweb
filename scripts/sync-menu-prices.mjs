// scripts/sync-menu-prices.mjs - Pure REST API seeder/syncer for Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gomoktykrsdfxgxoadph.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvbW9rdHlrcnNkZnhneG9hZHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNDA3MzEsImV4cCI6MjA5OTcxNjczMX0.TtNqLqEDB4x1H1HPhsqQhAGOynlYkp6ubUzdzu7byCQ';

const headers = {
  'apikey': supabaseKey,
  'Authorization': `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

export const KG_CATEGORIES = ['Khaaray', 'Biscuits', 'Rusks', 'Sugar Free Biscuits', 'Rusk Cakes'];

export const calculateGramPrice = (kgPrice, grams) => {
  return Math.round((kgPrice / 1000) * grams);
};

export const generateKgVariants = (kgPrice) => {
  return [
    { label: '250g', value: '250g', price: calculateGramPrice(kgPrice, 250) },
    { label: '500g', value: '500g', price: calculateGramPrice(kgPrice, 500) },
    { label: '1kg', value: '1kg', price: kgPrice }
  ];
};

export const menuProducts = [
  // CAKES - Base is per pound except Three milky cake
  { name: 'Black Forest cake', slug: 'black-forest-cake', category: 'Cakes', description: 'Classic black forest cake with cherries and chocolate.', price: 600, unit: 'Pound', image: '/images/products/cakes/black-forest-cake.png' },
  { name: 'Pineapple ice cake', slug: 'pineapple-ice-cake', category: 'Cakes', description: 'Refreshing pineapple ice cake with fresh pineapple cream.', price: 550, unit: 'Pound', image: '/images/products/cakes/pineapple-ice-cake.png' },
  { name: 'Dry fruit cake', slug: 'dry-fruit-cake', category: 'Cakes', description: 'Rich dry fruit cake with assorted nuts and fruits.', price: 600, unit: 'Pound', image: '/images/products/cakes/dry-fruit-cake.png' },
  { name: 'Three milky cake', slug: 'three-milky-cake', category: 'Cakes', description: 'Sensational Tres Leches cake soaked in three kinds of milk.', price: 1300, unit: 'KG', image: '/images/products/cakes/three-milk-cake.png' },
  { name: 'Bombay Chocolate', slug: 'bombay-chocolate', category: 'Cakes', description: 'Ultra-rich fudge cake with smooth, dark chocolate ganache.', price: 600, unit: 'Pound', image: '/images/products/cakes/bombay-chocolate.png' },
  { name: 'Bombay Coffee', slug: 'bombay-coffee', category: 'Cakes', description: 'Infused with premium espresso and coffee buttercream.', price: 600, unit: 'Pound', image: '/images/products/cakes/bombay-coffee.png' },
  { name: 'Brownie Cake', slug: 'brownie-cake', category: 'Cakes', description: 'Dense, fudgy chocolate brownie layers with smooth frosting.', price: 700, unit: 'Pound', image: '/images/products/cakes/brownie-cake.png' },

  // TEA TIME MUNCHIES - Base is per KG
  { name: 'Khaaray', slug: 'khaaray', category: 'Tea Time Munchies', description: 'Crispy salted puff pastry khaaray for tea time.', price: 660, unit: 'KG', image: '/images/products/cookies/khaasry.png' },
  { name: 'Biscuits', slug: 'biscuits', category: 'Tea Time Munchies', description: 'Freshly baked classic assorted biscuits.', price: 1100, unit: 'KG', image: '/images/products/cookies/biscuits.png' },
  { name: 'Sugar free Biscuits', slug: 'sugar-free-biscuits', category: 'Tea Time Munchies', description: 'Healthy sugar-free fiber biscuits.', price: 1200, unit: 'KG', image: '/images/products/cookies/sugar-free-biscuits.png' },
  { name: 'Rusks', slug: 'rusks', category: 'Tea Time Munchies', description: 'Double baked crispy golden rusks.', price: 560, unit: 'KG', image: '/images/products/cookies/rusks.png' },
  { name: 'Rusk Cake', slug: 'rusk-cake', category: 'Tea Time Munchies', description: 'Crunchy and sweet rusk cake.', price: 1200, unit: 'KG', image: '/images/products/cookies/rusk-cake.png' },
  { name: 'Slice cake', slug: 'slice-cake', category: 'Tea Time Munchies', description: 'Soft golden tea-time vanilla sponge slice cake.', price: 150, unit: 'Piece', image: '/images/products/cookies/slice-cake.png' },
  { name: 'Vegetable patties', slug: 'vegetable-patties', category: 'Tea Time Munchies', description: 'Flaky puff pastry stuffed with spiced mixed vegetables.', price: 40, unit: 'Piece', image: '/images/products/cookies/vegetable-patties.png' },
  { name: 'Chicken patties', slug: 'chicken-patties', category: 'Tea Time Munchies', description: 'Classic bakery chicken patties in golden, flaky pastry.', price: 50, unit: 'Piece', image: '/images/products/cookies/chicken-patties.png' },

  // M.A FROZEN ITEMS
  { name: 'Plain Paratha 5PC', slug: 'plain-paratha-5pc', category: 'Frozen Items', description: 'Flaky, layered traditional flatbreads - 5 pcs pack.', price: 180, unit: 'Packet', image: '/images/products/frozen-items/plain-paratha.png' },
  { name: 'Plain Paratha 30PC', slug: 'plain-paratha-30pc', category: 'Frozen Items', description: 'Bulk pack of flaky, layered flatbreads - 30 pcs.', price: 850, unit: 'Packet', image: '/images/products/frozen-items/plain-paratha-30.png' },
  { name: 'Malai Boti Samosa 12PC', slug: 'malai-boti-samosa-12pc', category: 'Frozen Items', description: 'Crisp samosas stuffed with chicken malai boti - 12 pcs.', price: 500, unit: 'Packet', available: false, image: '/images/products/frozen-items/molai-boti-samosa.png' },
  { name: 'Tikka Samosa 12PC', slug: 'tikka-samosa-12pc', category: 'Frozen Items', description: 'Samosas filled with spicy chicken tikka - 12 pcs.', price: 500, unit: 'Packet', available: false, image: '/images/products/frozen-items/tikka-samosa.png' },
  { name: 'Chicken Pocket 6PC', slug: 'chicken-pocket-6pc', category: 'Frozen Items', description: 'Savory pastry pockets with spiced chicken - 6 pcs.', price: 300, unit: 'Packet', available: false, image: '/images/products/frozen-items/chicken-samosa.png' },
  { name: 'Chinese Roll 6PC', slug: 'chinese-roll-6pc', category: 'Frozen Items', description: 'Golden rolls packed with vegetables & chicken - 6 pcs.', price: 300, unit: 'Packet', available: false, image: '/images/products/frozen-items/chinese-roll.png' },
  { name: 'Macroni Samosa 12PC', slug: 'macroni-samosa-12pc', category: 'Frozen Items', description: 'Unique fusion samosa stuffed with spicy macaroni - 12 pcs.', price: 300, unit: 'Packet', available: false, image: '/images/products/frozen-items/macroni-samosa.png' },

  // CUPCAKES & BREADS
  { name: 'Cupcakes', slug: 'cupcakes', category: 'Cupcakes & Breads', description: 'Freshly baked cupcakes with delicious swirl frosting.', price: 50, unit: 'Piece', image: '/images/products/breads/cupcakes.png' },
  { name: 'Bakery bread', slug: 'bakery-bread', category: 'Cupcakes & Breads', description: 'Freshly baked daily sandwich bread.', price: 160, unit: 'Piece', image: '/images/products/breads/pita-bread.png' },
  { name: 'Pita bread', slug: 'pita-bread', category: 'Cupcakes & Breads', description: 'Soft pocket pita bread - 1 packet.', price: 100, unit: 'Packet', image: '/images/products/breads/pita-bread.png' },
  { name: 'Burger buns', slug: 'burger-buns', category: 'Cupcakes & Breads', description: 'Fresh soft burger buns with sesame topping.', price: 25, unit: 'Piece', image: '/images/products/breads/burger-buns.png' },

  // PASTRIES
  { name: 'Bombay Chocolate pastry', slug: 'bombay-chocolate-pastry', category: 'Pastries', description: 'Slice of our signature rich Bombay chocolate cake.', price: 100, unit: 'Piece', image: '/images/products/pastries/bombay-chocolate-pastry.png' },
  { name: 'Bombay Coffee pastry', slug: 'bombay-coffee-pastry', category: 'Pastries', description: 'Slice of coffee-infused cream pastry.', price: 100, unit: 'Piece', image: '/images/products/pastries/Bombay_Cake_1254x1254.png' },
  { name: 'Sundae Small', slug: 'sundae-small', category: 'Pastries', description: 'Creamy mousse sundae cup with chocolate drizzle.', price: 130, unit: 'Piece', image: '/images/products/pastries/sundae-small.png' },
  { name: 'Sundae Large', slug: 'sundae-large', category: 'Pastries', description: 'Large premium mousse sundae cup with chocolate chips.', price: 140, unit: 'Piece', image: '/images/products/pastries/sundae-small.png' },
  { name: 'Red velvet pastry', slug: 'red-velvet-pastry', category: 'Pastries', description: 'Bright red sponge layered with cream cheese frosting.', price: 100, unit: 'Piece', image: '/images/products/pastries/red-velvet-pastry.png' },
  { name: 'Black Forest pastry', slug: 'black-forest-pastry', category: 'Pastries', description: 'Classic chocolate pastry with cherries and cream.', price: 100, unit: 'Piece', image: '/images/products/pastries/black-forest-pastry.png' },
  { name: 'Pineapple pastry', slug: 'pineapple-pastry', category: 'Pastries', description: 'Sweet pineapple layers in light cream pastry.', price: 100, unit: 'Piece', image: '/images/products/pastries/pineapple-pastry.png' },
  { name: 'Brownie', slug: 'brownie', category: 'Pastries', description: 'Rich, dense, and fudgy dark chocolate brownie.', price: 100, unit: 'Piece', image: '/images/products/pastries/chocolate-cream-puff.png' },
  { name: 'Chocolate cream puff', slug: 'chocolate-cream-puff', category: 'Pastries', description: 'Choux pastry filled with whipped cream & glazed with chocolate.', price: 80, unit: 'Piece', image: '/images/products/pastries/chocolate-cream-puff.png' }
];

export async function syncMenuPrices() {
  console.log('🔄 Connecting to Supabase via REST API to sync menu prices...');

  let existingProducts = [];
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/products?select=id,name,slug,price`, { headers });
    if (res.ok) {
      existingProducts = await res.json();
      console.log(`📦 Found ${existingProducts.length} existing products in Supabase.`);
    } else {
      console.warn(`⚠️ Supabase products query returned status ${res.status}:`, await res.text());
    }
  } catch (e) {
    console.warn('⚠️ Could not connect to Supabase:', e.message);
  }

  const existingMap = new Map();
  for (const p of existingProducts) {
    if (p.slug) existingMap.set(p.slug.toLowerCase(), p);
    if (p.name) existingMap.set(p.name.toLowerCase(), p);
  }

  let updatedCount = 0;
  let createdCount = 0;

  for (const item of menuProducts) {
    const existing = existingMap.get(item.slug.toLowerCase()) || existingMap.get(item.name.toLowerCase());

    if (existing) {
      try {
        const patchRes = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${existing.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            price: item.price,
            unit: item.unit,
            description: item.description,
            category: item.category
          })
        });

        if (patchRes.ok) {
          console.log(`✅ Updated: ${item.name} -> Rs. ${item.price}`);
          updatedCount++;
        } else {
          console.warn(`⚠️ Failed updating ${item.name}:`, await patchRes.text());
        }
      } catch (err) {
        console.warn(`⚠️ Network error updating ${item.name}:`, err.message);
      }
    } else {
      try {
        const postRes = await fetch(`${supabaseUrl}/rest/v1/products`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: item.name,
            slug: item.slug,
            category: item.category,
            description: item.description,
            price: item.price,
            unit: item.unit,
            image: item.image,
            featured: false,
            best_seller: false,
            new_arrival: false,
            available: true
          })
        });

        if (postRes.ok) {
          console.log(`🆕 Created: ${item.name} -> Rs. ${item.price}`);
          createdCount++;
        } else {
          console.warn(`⚠️ Failed creating ${item.name}:`, await postRes.text());
        }
      } catch (err) {
        console.warn(`⚠️ Network error creating ${item.name}:`, err.message);
      }
    }
  }

  console.log(`\n🎉 Completed menu sync: ${updatedCount} updated, ${createdCount} created.`);
}

syncMenuPrices()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Fatal sync error:', e);
    process.exit(1);
  });
