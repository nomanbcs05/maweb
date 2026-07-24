// seed_rest.mjs - pure HTTP fetch seeder for Supabase
const supabaseUrl = 'https://gomoktykrsdfxgxoadph.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvbW9rdHlrcnNkZnhneG9hZHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNDA3MzEsImV4cCI6MjA5OTcxNjczMX0.TtNqLqEDB4x1H1HPhsqQhAGOynlYkp6ubUzdzu7byCQ';

const categories = [
  { name: 'Cakes', slug: 'cakes', display_order: 1 },
  { name: 'Cupcakes & Breads', slug: 'cupcakes-breads', display_order: 2 },
  { name: 'Pastries', slug: 'pastries', display_order: 3 },
  { name: 'Frozen Items', slug: 'frozen-items', display_order: 4 },
  { name: 'Tea Time Munchies', slug: 'tea-time-munchies', display_order: 5 }
];

const products = [
  // CAKES
  { name: 'Black Forest Cake', slug: 'black-forest-cake', category: 'Cakes', description: 'Rich layers of chocolate sponge, whipped cream, and fresh cherries.', price: 600, unit: 'Pound', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80&auto=format', featured: true, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '2 hours', tags: ['chocolate', 'cream', 'cherry'] },
  { name: 'Pineapple Ice Cake', slug: 'pineapple-ice-cake', category: 'Cakes', description: 'Light moist sponge with fresh pineapples and luscious whipped cream.', price: 550, unit: 'Pound', image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&q=80&auto=format', featured: false, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '2 hours', tags: ['pineapple', 'cream'] },
  { name: 'Dry Fruit Cake', slug: 'dry-fruit-cake', category: 'Cakes', description: 'Traditional rich tea cake packed with premium almonds, walnuts, and raisins.', price: 600, unit: 'Pound', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80&auto=format', featured: false, best_seller: false, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '1 hour', tags: ['dry fruit', 'nuts'] },
  { name: 'Three Milky Cake', slug: 'three-milky-cake', category: 'Cakes', description: 'Sensational Tres Leches cake soaked in three kinds of milk, topped with cream.', price: 1300, unit: 'KG', image: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=600&q=80&auto=format', featured: true, best_seller: true, new_arrival: true, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '4 hours', tags: ['milk', 'tres leches'] },
  { name: 'Bombay Chocolate Cake', slug: 'bombay-chocolate-cake', category: 'Cakes', description: 'Ultra-rich fudge cake with smooth, dark chocolate ganache layering.', price: 600, unit: 'Pound', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80&auto=format', featured: true, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '2 hours', tags: ['chocolate', 'fudge'] },
  { name: 'Bombay Coffee Cake', slug: 'bombay-coffee-cake', category: 'Cakes', description: 'Infused with premium espresso, layered with silky coffee buttercream.', price: 600, unit: 'Pound', image: 'https://images.unsplash.com/photo-1516685018646-549198525c1b?w=600&q=80&auto=format', featured: false, best_seller: false, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '2 hours', tags: ['coffee', 'espresso'] },
  { name: 'Brownie Cake', slug: 'brownie-cake', category: 'Cakes', description: 'Dense, fudgy chocolate brownie layers with smooth frosting.', price: 700, unit: 'Pound', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80&auto=format', featured: false, best_seller: false, new_arrival: true, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '3 hours', tags: ['brownie', 'chocolate'] },
  // FROZEN ITEMS
  { name: 'Plain Paratha (5 PC)', slug: 'plain-paratha-5pc', category: 'Frozen Items', description: 'Flaky, layered traditional flatbreads. Frozen and ready to fry.', price: 180, unit: 'Packet', image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&q=80&auto=format', featured: false, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '15 mins', tags: ['paratha', 'frozen', 'breakfast'] },
  { name: 'Plain Paratha (30 PC)', slug: 'plain-paratha-30pc', category: 'Frozen Items', description: 'Bulk packet of flaky, layered flatbreads. Keep frozen.', price: 850, unit: 'Packet', image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&q=80&auto=format', featured: false, best_seller: false, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '15 mins', tags: ['paratha', 'frozen', 'bulk'] },
  { name: 'Malai Boti Samosa (12 PC)', slug: 'malai-boti-samosa', category: 'Frozen Items', description: 'Crisp samosas stuffed with creamy, marinated chicken malai boti.', price: 500, unit: 'Packet', image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&q=80&auto=format', featured: true, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '15 mins', tags: ['samosa', 'chicken', 'frozen'] },
  { name: 'Tikka Samosa (12 PC)', slug: 'tikka-samosa', category: 'Frozen Items', description: 'Samosas filled with spicy chicken tikka and onions.', price: 500, unit: 'Packet', image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&q=80&auto=format', featured: false, best_seller: false, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '15 mins', tags: ['samosa', 'tikka', 'frozen'] },
  { name: 'Chicken Pocket (6 PC)', slug: 'chicken-pocket', category: 'Frozen Items', description: 'Savory pastry pockets loaded with seasoned chicken.', price: 300, unit: 'Packet', image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=600&q=80&auto=format', featured: false, best_seller: false, new_arrival: true, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '15 mins', tags: ['pocket', 'chicken', 'frozen'] },
  { name: 'Chinese Roll (6 PC)', slug: 'chinese-roll', category: 'Frozen Items', description: 'Golden rolls packed with classic Chinese vegetables and shredded chicken.', price: 300, unit: 'Packet', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80&auto=format', featured: true, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '15 mins', tags: ['roll', 'chinese', 'frozen'] },
  { name: 'Macaroni Samosa (12 PC)', slug: 'macaroni-samosa', category: 'Frozen Items', description: 'Unique fusion samosa stuffed with spicy macaroni.', price: 300, unit: 'Packet', image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&q=80&auto=format', featured: false, best_seller: false, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '15 mins', tags: ['samosa', 'macaroni', 'frozen'] },
  // TEA TIME
  { name: 'Khaaray', slug: 'khaaray', category: 'Tea Time Munchies', description: 'Crispy puff pastry biscuits, perfectly salted for your tea time.', price: 660, unit: 'KG', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80&auto=format', featured: false, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '10 mins', tags: ['puff pastry', 'salty', 'tea time'] },
  { name: 'Biscuits', slug: 'biscuits', category: 'Tea Time Munchies', description: 'Freshly baked assorted butter biscuits.', price: 1100, unit: 'KG', image: 'https://images.unsplash.com/photo-1548982458-3e401036774a?w=600&q=80&auto=format', featured: false, best_seller: false, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '10 mins', tags: ['biscuits', 'butter'] },
  { name: 'Sugar Free Biscuits', slug: 'sugar-free-biscuits', category: 'Tea Time Munchies', description: 'Healthy, sugar-free fiber biscuits for guilt-free snacking.', price: 1200, unit: 'KG', image: 'https://images.unsplash.com/photo-1548982458-3e401036774a?w=600&q=80&auto=format', featured: false, best_seller: false, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '10 mins', tags: ['sugar free', 'diet'] },
  { name: 'Rusks', slug: 'rusks', category: 'Tea Time Munchies', description: 'Double-baked crispy rusks, a classic match for morning tea.', price: 560, unit: 'KG', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80&auto=format', featured: false, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '10 mins', tags: ['rusk', 'crisp'] },
  { name: 'Slice Cake', slug: 'slice-cake', category: 'Tea Time Munchies', description: 'Soft, golden vanilla sponge slice cake.', price: 150, unit: 'Piece', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80&auto=format', featured: true, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '10 mins', tags: ['cake slice', 'sponge'] },
  { name: 'Vegetable Patties', slug: 'vegetable-patties', category: 'Tea Time Munchies', description: 'Flaky puff pastry stuffed with spiced mixed vegetables.', price: 40, unit: 'Piece', image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=600&q=80&auto=format', featured: false, best_seller: false, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '15 mins', tags: ['patties', 'veg'] },
  { name: 'Chicken Patties', slug: 'chicken-patties', category: 'Tea Time Munchies', description: 'Classic bakery chicken patties in golden, flaky pastry.', price: 50, unit: 'Piece', image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=600&q=80&auto=format', featured: true, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '15 mins', tags: ['patties', 'chicken'] },
  { name: 'Rusk Cake', slug: 'rusk-cake', category: 'Tea Time Munchies', description: 'Delightfully crunchy sweet rusk cake.', price: 1200, unit: 'KG', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80&auto=format', featured: false, best_seller: false, new_arrival: true, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '10 mins', tags: ['rusk cake', 'sweet'] },
  // CUPCAKES & BREADS
  { name: 'Cupcakes', slug: 'cupcakes', category: 'Cupcakes & Breads', description: 'Perfectly baked vanilla or chocolate cupcakes with cream frosting.', price: 50, unit: 'Piece', image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=600&q=80&auto=format', featured: false, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '30 mins', tags: ['cupcakes', 'cream'] },
  { name: 'Bakery Bread', slug: 'bakery-bread', category: 'Cupcakes & Breads', description: 'Freshly baked daily sandwich bread, soft and large.', price: 160, unit: 'Piece', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80&auto=format', featured: true, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '10 mins', tags: ['bread', 'sandwich'] },
  { name: 'Pita Bread', slug: 'pita-bread', category: 'Cupcakes & Breads', description: 'Soft pocket pita bread, perfect for shawarmas and wraps.', price: 100, unit: 'Packet', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80&auto=format', featured: false, best_seller: false, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '10 mins', tags: ['pita', 'pocket'] },
  { name: 'Burger Buns', slug: 'burger-buns', category: 'Cupcakes & Breads', description: 'Soft sesame-topped burger buns.', price: 25, unit: 'Piece', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80&auto=format', featured: false, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '10 mins', tags: ['bun', 'burger'] },
  // PASTRIES
  { name: 'Bombay Chocolate Pastry', slug: 'bombay-chocolate-pastry', category: 'Pastries', description: 'Individual slice of our signature rich Bombay chocolate cake.', price: 100, unit: 'Piece', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80&auto=format', featured: true, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '10 mins', tags: ['chocolate', 'pastry'] },
  { name: 'Bombay Coffee Pastry', slug: 'bombay-coffee-pastry', category: 'Pastries', description: 'Individual slice of coffee-infused cream pastry.', price: 100, unit: 'Piece', image: 'https://images.unsplash.com/photo-1516685018646-549198525c1b?w=600&q=80&auto=format', featured: false, best_seller: false, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '10 mins', tags: ['coffee', 'pastry'] },
  { name: 'Sundae Small', slug: 'sundae-small', category: 'Pastries', description: 'Creamy mousse sundae cup with chocolate drizzle.', price: 130, unit: 'Piece', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80&auto=format', featured: false, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '10 mins', tags: ['sundae', 'chocolate'] },
  { name: 'Sundae Large', slug: 'sundae-large', category: 'Pastries', description: 'Large premium mousse sundae cup with chocolate chips.', price: 180, unit: 'Piece', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80&auto=format', featured: true, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '10 mins', tags: ['sundae', 'large'] },
  { name: 'Red Velvet Pastry', slug: 'red-velvet-pastry', category: 'Pastries', description: 'Bright red sponge layered with sweet cream cheese frosting.', price: 100, unit: 'Piece', image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=600&q=80&auto=format', featured: false, best_seller: false, new_arrival: true, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '10 mins', tags: ['red velvet', 'cream cheese'] },
  { name: 'Black Forest Pastry', slug: 'black-forest-pastry', category: 'Pastries', description: 'Classic chocolate pastry with cherries and whipped cream.', price: 100, unit: 'Piece', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80&auto=format', featured: false, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '10 mins', tags: ['pastry', 'chocolate'] },
  { name: 'Pineapple Pastry', slug: 'pineapple-pastry', category: 'Pastries', description: 'Sweet, juicy pineapple layers in light cream pastry.', price: 100, unit: 'Piece', image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&q=80&auto=format', featured: false, best_seller: false, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '10 mins', tags: ['pineapple', 'pastry'] },
  { name: 'Brownie', slug: 'brownie', category: 'Pastries', description: 'Rich, dense, and fudgy dark chocolate brownie.', price: 100, unit: 'Piece', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80&auto=format', featured: true, best_seller: true, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '10 mins', tags: ['brownie', 'chocolate'] },
  { name: 'Chocolate Cream Puff', slug: 'chocolate-cream-puff', category: 'Pastries', description: 'Light choux pastry filled with whipped cream and glazed in chocolate.', price: 80, unit: 'Piece', image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=600&q=80&auto=format', featured: false, best_seller: false, new_arrival: false, available: true, stock_quantity: -1, minimum_order: 1, preparation_time: '20 mins', tags: ['puff', 'cream', 'chocolate'] }
];

async function seed() {
  console.log('🌱 Seeding categories and products using pure REST API...');

  // 1. Post categories
  const catRes = await fetch(`${supabaseUrl}/rest/v1/categories`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(categories)
  });

  if (!catRes.ok) {
    const errText = await catRes.text();
    console.warn('⚠️ Categories insert failed (they may already exist):', errText);
  } else {
    console.log('✅ Categories successfully seeded.');
  }

  // 2. Clear old products (optional, let's just insert/upsert new ones)
  // To avoid delete errors, we can just insert with resolution=merge-duplicates
  // since slug or name can act as unique check (if configured). Or just standard POST.
  const prodRes = await fetch(`${supabaseUrl}/rest/v1/products`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(products)
  });

  if (!prodRes.ok) {
    const errText = await prodRes.text();
    console.warn('⚠️ Products insert failed (they may already exist):', errText);
  } else {
    console.log('✅ Products successfully seeded!');
  }

  // 3. Post branches
  const branches = [
    { name: 'DHA Phase 5 Branch', address: 'Plot 5-C, Khayaban-e-Shamsheer, DHA, Karachi' },
    { name: 'Gulshan-e-Iqbal Branch', address: 'Shop 12, Block 13-C, University Road, Karachi' },
    { name: 'North Nazimabad Branch', address: 'D-12, Block H, Barkat-e-Hydri, Karachi' }
  ];

  const branchRes = await fetch(`${supabaseUrl}/rest/v1/branches`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(branches)
  });

  if (!branchRes.ok) {
    console.warn('⚠️ Branches insert warning/error (might already exist):', await branchRes.text());
  } else {
    console.log('✅ Branches successfully seeded.');
  }

  // 4. Post coupons
  const coupons = [
    { code: 'MAB10', discount_type: 'percentage', discount_value: 10, min_order_value: 1000 },
    { code: 'WELCOME5', discount_type: 'fixed', discount_value: 500, min_order_value: 2000 },
    { code: 'FREEDEL', discount_type: 'fixed', discount_value: 150, min_order_value: 1200 }
  ];

  const couponRes = await fetch(`${supabaseUrl}/rest/v1/coupons`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(coupons)
  });

  if (!couponRes.ok) {
    console.warn('⚠️ Coupons insert warning/error (might already exist):', await couponRes.text());
  } else {
    console.log('✅ Coupons successfully seeded.');
  }

  console.log('🎉 Seeding completed successfully!');
}

seed().catch(console.error);
