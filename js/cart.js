/**
 * M.A Bakers - Advanced Cart System
 */

const CART_STORAGE_KEY = 'mab_cart';
const DELIVERY_FEE = 150; // Configured delivery fee
const TAX_RATE = 0.0;     // Configured tax rate (0%)

// Initialize Cart State
let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '{}');
let currentDiscount = 0;

// FIX: Bug 2: Migration for legacy cart items without variantId
(function migrateLegacyCart() {
  let hasOld = false;
  for (const key in cart) {
    if (!cart[key].variantId) {
      delete cart[key];
      hasOld = true;
    }
  }
  if (hasOld) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    if (typeof window.showToast === 'function') {
      window.showToast('Please re-add items', true);
    }
  }
})();

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

// FIX: Bug 1: Vanilla availability check
function isProductAvailable(product, variant) {
  if (!product) return false;
  if (product.status && product.status !== 'active') return false;
  if (product.available === false || product.out_of_stock === true) return false;
  if (typeof product.stock === 'number' && product.stock <= 0) return false;
  if (variant && variant.out_of_stock) return false;
  return true;
}

// FIX: Bug 1 & Bug 2: Check availability and use composite key ${productId}-${variantId}
function addToCart(productId, productDetails, variantId = '1lb', variantName = '1LB', price = null) {
  if (!isProductAvailable(productDetails)) {
    if (typeof window.showToast === 'function') {
      window.showToast('This item is currently out of stock', true);
    }
    return;
  }

  const itemPrice = price !== null ? price : (productDetails.price || 0);
  const compositeId = `${productId}-${variantId}`;

  if (!cart[compositeId]) {
    cart[compositeId] = {
      id: compositeId,
      productId: productId,
      variantId: variantId,
      variantName: variantName,
      price: itemPrice,
      qty: 0,
      notes: '',
      ...productDetails
    };
  }
  cart[compositeId].qty++;
  saveCart();
  renderCart();
  
  if (typeof window.showToast === 'function') {
    window.showToast(`${productDetails.name} (${variantName}) added to cart`);
  }
}

function updateCartQty(key, delta) {
  if (cart[key]) {
    cart[key].qty += delta;
    if (cart[key].qty <= 0) {
      delete cart[key];
    }
    saveCart();
    renderCart();
  }
}

function updateItemNotes(key, notes) {
  if (cart[key]) {
    cart[key].notes = notes;
    saveCart();
  }
}

function removeFromCart(key) {
  if (cart[key]) {
    delete cart[key];
    saveCart();
    renderCart();
  }
}

function clearCart() {
  cart = {};
  saveCart();
  renderCart();
}

function calculateTotals() {
  const ids = Object.keys(cart);
  let subtotal = 0;
  let totalItems = 0;

  ids.forEach(id => {
    subtotal += cart[id].price * cart[id].qty;
    totalItems += cart[id].qty;
  });

  const tax = subtotal * TAX_RATE;
  const delivery = totalItems > 0 ? DELIVERY_FEE : 0;
  const discountAmount = subtotal * (currentDiscount / 100);
  const total = subtotal + tax + delivery - discountAmount;

  return { subtotal, tax, delivery, discountAmount, total, totalItems };
}

function renderCart() {
  const cartCountEl = document.getElementById('cartCount');
  const cartBodyEl = document.getElementById('cartBody');
  const cartTotalsEl = document.getElementById('cartTotals'); // We will add this to HTML
  const checkoutBtn = document.getElementById('checkoutBtn');

  const { subtotal, tax, delivery, discountAmount, total, totalItems } = calculateTotals();

  // Update Badge
  if (cartCountEl) {
    cartCountEl.textContent = totalItems;
    cartCountEl.classList.toggle('show', totalItems > 0);
  }

  // Update Body
  if (cartBodyEl) {
    const ids = Object.keys(cart);
    if (!ids.length) {
      cartBodyEl.innerHTML = `<div class="cart-empty"><svg viewBox="0 0 24 24"><path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M6 6L4 2H2"/></svg><p>Your cart is empty.<br>Add something delicious!</p></div>`;
      if (cartTotalsEl) cartTotalsEl.innerHTML = '';
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;

    cartBodyEl.innerHTML = ids.map(id => {
      const it = cart[id];
      const itemTotal = it.price * it.qty;
      return `
      <div class="cart-item">
        <img src="${it.img}" alt="${it.name}" loading="lazy">
        <div class="ci-info">
          <h5>${it.name}</h5>
          <span class="ci-cat">${it.cat}</span>
          <div class="ci-price-row">
            <span>Rs. ${it.price.toFixed(0)}</span>
            <div class="qty-ctrl">
              <button class="qty-btn" onclick="updateCartQty('${id}', -1)">-</button>
              <span>${it.qty}</span>
              <button class="qty-btn" onclick="updateCartQty('${id}', 1)">+</button>
            </div>
          </div>
          <input type="text" class="ci-notes" placeholder="Special instructions (e.g. No nuts)" value="${it.notes || ''}" onchange="updateItemNotes('${id}', this.value)">
          <div class="ci-bottom">
            <b>Rs. ${itemTotal.toFixed(0)}</b>
            <a href="#" class="ci-remove" onclick="removeFromCart('${id}'); return false;">Remove</a>
          </div>
        </div>
      </div>`;
    }).join('');
    
    // Render Totals Breakdown
    if (cartTotalsEl) {
      cartTotalsEl.innerHTML = `
        <div class="tot-row"><span>Subtotal</span><span>Rs. ${subtotal.toFixed(0)}</span></div>
         <div class="tot-row"><span>Tax (${(TAX_RATE*100).toFixed(0)}%)</span><span>Rs. ${tax.toFixed(0)}</span></div>
         <div class="tot-row"><span>Delivery</span><span>Rs. ${delivery.toFixed(0)}</span></div>
         ${discountAmount > 0 ? `<div class="tot-row discount"><span>Discount</span><span>-Rs. ${discountAmount.toFixed(0)}</span></div>` : ''}
         <div class="drawer-total"><span>Grand Total</span><span>Rs. ${total.toFixed(0)}</span></div>
      `;
    }
  }
}

// Ensure global access
window.Cart = {
  getCart: () => cart,
  addToCart,
  updateCartQty,
  updateItemNotes,
  removeFromCart,
  clearCart,
  calculateTotals,
  renderCart,
  applyDiscount: (pct) => { currentDiscount = pct; saveCart(); renderCart(); }
};

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  // Auto‑add first product for quick checkout testing (remove in production)
  if (Object.keys(window.Cart.getCart()).length === 0) {
    const first = window.products?.[0];
    if (first) {
      window.Cart.addToCart(first.id, first);
      // Open checkout modal automatically for verification
      openCheckout();
    }
  }
});
