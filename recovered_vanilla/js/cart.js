/**
 * M.A Bakers - Advanced Cart System
 */

const CART_STORAGE_KEY = 'mab_cart';
const DELIVERY_FEE = 150; // Configured delivery fee
const TAX_RATE = 0.0;     // Configured tax rate (0%)

// Initialize Cart State
let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '{}');
let currentDiscount = 0;

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function addToCart(productId, productDetails) {
  if (!cart[productId]) {
    cart[productId] = { ...productDetails, qty: 0, notes: '' };
  }
  cart[productId].qty++;
  saveCart();
  renderCart();
  
  if (typeof window.showToast === 'function') {
    window.showToast(`${productDetails.name} added to cart`);
  }
}

function updateCartQty(productId, delta) {
  if (cart[productId]) {
    cart[productId].qty += delta;
    if (cart[productId].qty <= 0) {
      delete cart[productId];
    }
    saveCart();
    renderCart();
  }
}

function updateItemNotes(productId, notes) {
  if (cart[productId]) {
    cart[productId].notes = notes;
    saveCart();
  }
}

function removeFromCart(productId) {
  if (cart[productId]) {
    delete cart[productId];
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
            <span>$${it.price.toFixed(2)}</span>
            <div class="qty-ctrl">
              <button class="qty-btn" onclick="updateCartQty('${id}', -1)">-</button>
              <span>${it.qty}</span>
              <button class="qty-btn" onclick="updateCartQty('${id}', 1)">+</button>
            </div>
          </div>
          <input type="text" class="ci-notes" placeholder="Special instructions (e.g. No nuts)" value="${it.notes || ''}" onchange="updateItemNotes('${id}', this.value)">
          <div class="ci-bottom">
            <b>$${itemTotal.toFixed(2)}</b>
            <a href="#" class="ci-remove" onclick="removeFromCart('${id}'); return false;">Remove</a>
          </div>
        </div>
      </div>`;
    }).join('');
    
    // Render Totals Breakdown
    if (cartTotalsEl) {
      cartTotalsEl.innerHTML = `
        <div class="tot-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
        <div class="tot-row"><span>Tax (${(TAX_RATE*100).toFixed(0)}%)</span><span>$${tax.toFixed(2)}</span></div>
        <div class="tot-row"><span>Delivery</span><span>$${delivery.toFixed(2)}</span></div>
        ${discountAmount > 0 ? `<div class="tot-row discount"><span>Discount</span><span>-$${discountAmount.toFixed(2)}</span></div>` : ''}
        <div class="drawer-total"><span>Grand Total</span><span>$${total.toFixed(2)}</span></div>
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
});
