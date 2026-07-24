/**
 * M.A Bakers - Data Access Layer (Mock API)
 * Uses localStorage to simulate a database.
 * Ready to be swapped with Firebase/Supabase functions.
 */

const DB_KEY_ORDERS = 'mab_orders';
const DB_KEY_CUSTOMERS = 'mab_customers';

// Hardcoded products database for the application
const DB_PRODUCTS = [
  { id:1,  name:'Artisan Sourdough',   cat:'Breads',   desc:'Slow-fermented bread with a crisp crust and soft airy center.',          price:8.50, old:10.00, rating:5, img:'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=600&q=80&auto=format' },
  { id:2,  name:'Chocolate Croissant', cat:'Pastries', desc:'Flaky buttery layers filled with rich dark chocolate.',                  price:5.25, old:6.50,  rating:5, img:'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80&auto=format' },
  { id:3,  name:'Blueberry Scones',    cat:'Pastries', desc:'Soft, buttery scones loaded with fresh blueberries.',                   price:4.75, old:8.50,  rating:5, img:'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=600&q=80&auto=format' },
  { id:4,  name:'Lemon Tart',          cat:'Cakes',    desc:'Tangy lemon filling in a crisp, golden pastry shell.',                  price:6.95, old:8.50,  rating:5, img:'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=600&q=80&auto=format' },
  { id:5,  name:'Classic Bagels',      cat:'Breads',   desc:'Perfectly chewy with a golden crust and topped with premium seeds.',    price:3.95, old:null,  rating:5, img:'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80&auto=format' },
  { id:6,  name:'Vanilla Cupcakes',    cat:'Cakes',    desc:'Light, fluffy cupcakes topped with smooth vanilla buttercream.',        price:4.50, old:null,  rating:5, img:'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=600&q=80&auto=format' },
  { id:7,  name:'Almond Cookies',      cat:'Cookies',  desc:'Made with roasted almonds for rich flavor in every bite.',              price:4.25, old:null,  rating:4, img:'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80&auto=format' },
  { id:8,  name:'Fruit Danish',        cat:'Pastries', desc:'Finished with a light glaze for the perfect balance of sweetness.',     price:5.75, old:null,  rating:5, img:'https://images.unsplash.com/photo-1586788224331-947f68671cf1?w=600&q=80&auto=format' },
  { id:9,  name:'Chocolate Muffins',   cat:'Muffins',  desc:'Rich, moist muffins loaded with deep chocolate flavor.',               price:4.95, old:null,  rating:5, img:'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=600&q=80&auto=format' },
  { id:10, name:'Cinnamon Rolls',      cat:'Pastries', desc:'Soft, fluffy rolls swirled with cinnamon and brown sugar.',            price:5.50, old:null,  rating:5, img:'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=600&q=80&auto=format' },
];

/**
 * Helper to simulate network latency
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get all products
 */
async function getProducts() {
  await delay(100);
  return DB_PRODUCTS;
}

/**
 * Get product by ID
 */
async function getProduct(id) {
  await delay(50);
  return DB_PRODUCTS.find(p => String(p.id) === String(id));
}

/**
 * Generate a unique order ID (e.g., MAB-000123)
 */
function generateOrderId(currentCount) {
  const pad = String(currentCount + 1).padStart(6, '0');
  return `MAB-${pad}`;
}

/**
 * Save a new order
 * @param {Object} orderData 
 */
async function saveOrder(orderData) {
  await delay(800); // Simulate network request
  
  const orders = JSON.parse(localStorage.getItem(DB_KEY_ORDERS) || '[]');
  
  const newOrder = {
    ...orderData,
    id: generateOrderId(orders.length),
    status: 'Pending', // Pending | Preparing | Baking | Out for Delivery | Delivered | Cancelled
    createdAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  localStorage.setItem(DB_KEY_ORDERS, JSON.stringify(orders));
  
  // Also save customer details for auto-fill next time
  if (orderData.customer) {
    localStorage.setItem(DB_KEY_CUSTOMERS, JSON.stringify(orderData.customer));
  }
  
  return newOrder;
}

/**
 * Get all orders (for Admin Dashboard)
 */
async function getOrders() {
  await delay(300);
  const orders = JSON.parse(localStorage.getItem(DB_KEY_ORDERS) || '[]');
  // Return descending by date
  return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Get single order by ID (for Tracking)
 */
async function getOrderById(id) {
  await delay(300);
  const orders = JSON.parse(localStorage.getItem(DB_KEY_ORDERS) || '[]');
  return orders.find(o => o.id === id);
}

/**
 * Update order status (for Admin Dashboard)
 */
async function updateOrderStatus(id, newStatus) {
  await delay(400);
  const orders = JSON.parse(localStorage.getItem(DB_KEY_ORDERS) || '[]');
  const index = orders.findIndex(o => o.id === id);
  if (index !== -1) {
    orders[index].status = newStatus;
    orders[index].updatedAt = new Date().toISOString();
    localStorage.setItem(DB_KEY_ORDERS, JSON.stringify(orders));
    return orders[index];
  }
  throw new Error('Order not found');
}

/**
 * Load saved customer info
 */
async function getSavedCustomer() {
  await delay(100);
  const data = localStorage.getItem(DB_KEY_CUSTOMERS);
  return data ? JSON.parse(data) : null;
}

// Export functions to global scope for the application
window.API = {
  getProducts,
  getProduct,
  saveOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getSavedCustomer
};
