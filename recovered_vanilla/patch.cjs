const fs = require('fs');

let html = fs.readFileSync('d:\\MA WEBSITE\\index.html', 'utf8');

// 1. Add CSS
html = html.replace('</head>', '  <link rel="stylesheet" href="css/checkout.css">\n</head>');

// 2. Replace Drawer Foot
const oldDrawerFoot = `<div class="drawer-foot">
    <div class="drawer-total"><span>Total</span><span id="cartTotal">$0.00</span></div>
    <button id="checkoutBtn" class="btn btn-primary" style="width:100%;justify-content:center;">Proceed to Checkout</button>
  </div>`;
const newDrawerFoot = `<div class="drawer-foot">
    <div id="cartTotals" class="cart-totals-wrap"></div>
    <button id="checkoutBtn" class="btn btn-primary" style="width:100%;justify-content:center;" onclick="openCheckout()" disabled>Proceed to Checkout</button>
  </div>`;
html = html.replace(oldDrawerFoot, newDrawerFoot);

// 3. Inject Modals before JavaScript
const modalsHtml = `
<!-- CHECKOUT MODAL -->
<div class="co-modal" id="coModal" role="dialog" aria-modal="true">
  <div class="co-header">
    <div class="co-logo">Checkout</div>
    <button class="co-close" onclick="closeCheckout()" aria-label="Close Checkout">
      <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>
  <div class="co-body">
    <div class="co-container">
      <div class="co-main">
        <!-- Steps Indicator -->
        <div class="co-steps">
          <div class="co-step-indicator active" data-step="1"><div class="co-step-num">1</div> Details</div><div class="co-step-line"></div>
          <div class="co-step-indicator" data-step="2"><div class="co-step-num">2</div> Schedule</div><div class="co-step-line"></div>
          <div class="co-step-indicator" data-step="3"><div class="co-step-num">3</div> Payment</div><div class="co-step-line"></div>
          <div class="co-step-indicator" data-step="4"><div class="co-step-num">4</div> Review</div>
        </div>

        <!-- Step 1: Info & Type -->
        <div class="co-step active" id="step1">
          <h2>Customer Details</h2>
          <p>Please enter your contact information.</p>
          <div class="co-form-grid">
            <div class="co-fg"><label for="coName">Full Name *</label><input type="text" id="coName" placeholder="e.g. Ahmed Ali"><span class="err">Required (Min 2 chars)</span></div>
            <div class="co-fg"><label for="coPhone">Phone / WhatsApp *</label><input type="tel" id="coPhone" placeholder="03XXXXXXXXX"><span class="err">Valid 11-digit number required</span></div>
            <div class="co-fg" style="grid-column: 1 / -1;"><label for="coEmail">Email (Optional)</label><input type="email" id="coEmail" placeholder="you@email.com"></div>
          </div>
          
          <h2 style="margin-top:40px">Order Type</h2>
          <p>How would you like to receive your order?</p>
          <div class="co-cards">
            <div class="sel-card type-card selected" data-val="delivery" onclick="selectType('delivery')">
              <svg viewBox="0 0 24 24"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v5c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
              <b>Delivery</b><p>Delivered to your door</p>
            </div>
            <div class="sel-card type-card" data-val="pickup" onclick="selectType('pickup')">
              <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <b>Store Pickup</b><p>Collect from our branch</p>
            </div>
          </div>
          
          <div id="deliveryForm">
            <h3>Delivery Address</h3>
            <div class="co-form-grid full" style="margin-top:16px">
              <div class="co-fg"><label for="coAddress">House / Flat / Street *</label><input type="text" id="coAddress" placeholder="e.g. House 22, Street 4"><span class="err">Required</span></div>
              <div class="co-fg"><label for="coArea">Area / Sector *</label><input type="text" id="coArea" placeholder="e.g. DHA Phase 5"><span class="err">Required</span></div>
              <div class="co-fg"><label for="coInstr">Delivery Instructions (Optional)</label><textarea id="coInstr" rows="2" placeholder="e.g. Leave at the gate"></textarea></div>
            </div>
          </div>
          
          <div id="pickupForm" style="display:none">
            <h3>Select Branch</h3>
            <div class="co-form-grid full" style="margin-top:16px">
              <div class="co-fg">
                <select id="coBranch">
                  <option value="Main Branch - DHA Phase 5">Main Branch - DHA Phase 5</option>
                  <option value="Clifton Branch">Clifton Branch</option>
                  <option value="Gulshan Branch">Gulshan Branch</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Time -->
        <div class="co-step" id="step2">
          <h2>Delivery Time</h2>
          <p>When would you like your order?</p>
          <div class="co-cards">
            <div class="sel-card time-card selected" data-val="asap" onclick="selectTime('asap')">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <b>Deliver ASAP</b><p>Usually within 45 mins</p>
            </div>
            <div class="sel-card time-card" data-val="schedule" onclick="selectTime('schedule')">
              <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <b>Schedule Order</b><p>Select date and time</p>
            </div>
          </div>
        </div>

        <!-- Step 3: Payment -->
        <div class="co-step" id="step3">
          <h2>Payment Method</h2>
          <p>Select how you want to pay.</p>
          <div class="co-cards">
            <div class="sel-card pmt-card selected" data-val="cod" onclick="selectPayment('cod')">
              <svg viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
              <b>Cash on Delivery</b><p>Pay when you receive</p>
            </div>
            <div class="sel-card pmt-card" data-val="card" onclick="selectPayment('card')">
              <svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              <b>Credit / Debit Card</b><p>Pay online securely</p>
            </div>
            <div class="sel-card pmt-card" data-val="transfer" onclick="selectPayment('transfer')">
              <svg viewBox="0 0 24 24"><path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6l7-3 7 3"/><line x1="4" y1="10" x2="4" y2="21"/><line x1="20" y1="10" x2="20" y2="21"/><line x1="8" y1="14" x2="8" y2="17"/><line x1="12" y1="14" x2="12" y2="17"/><line x1="16" y1="14" x2="16" y2="17"/></svg>
              <b>Bank Transfer</b><p>Upload receipt (EasyPaisa/JazzCash)</p>
            </div>
          </div>
        </div>

        <!-- Step 4: Review -->
        <div class="co-step" id="step4">
          <h2>Review Order</h2>
          <p>Please confirm your details before placing the order.</p>
          <div class="co-form-grid full">
            <div class="co-fg">
              <div style="background:var(--bg-card); border:1px solid var(--border); padding:20px; border-radius:8px;">
                <h4 style="margin-bottom:12px">Customer Information</h4>
                <p id="revCust" style="font-size:14px; color:var(--text-sub); line-height:1.6"></p>
                <h4 style="margin-top:20px; margin-bottom:12px">Order Logistics</h4>
                <p id="revType" style="font-size:14px; color:var(--text-sub); line-height:1.6"></p>
                <h4 style="margin-top:20px; margin-bottom:12px">Payment</h4>
                <p id="revPmt" style="font-size:14px; color:var(--text-sub); line-height:1.6"></p>
              </div>
            </div>
          </div>
        </div>

        <div class="co-actions">
          <button class="btn btn-outline" id="coPrevBtn" style="visibility:hidden" onclick="handlePrev()">Back</button>
          <button class="btn btn-primary" id="coNextBtn" onclick="handleNext()">Continue <svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;margin-left:8px"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
        </div>
      </div>
      
      <!-- Summary Sidebar -->
      <div class="co-summary">
        <h3>Order Summary</h3>
        <div class="sum-items" id="sumItems"></div>
        <div class="sum-totals">
          <div class="sum-tot-row"><span>Subtotal</span><span id="sumSub">$0.00</span></div>
          <div class="sum-tot-row"><span>Tax (0%)</span><span id="sumTax">$0.00</span></div>
          <div class="sum-tot-row"><span>Delivery</span><span id="sumDel">$0.00</span></div>
          <div class="sum-tot-row grand"><span>Total</span><span id="sumGrand">$0.00</span></div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ORDER CONFIRMATION MODAL -->
<div class="conf-modal" id="confModal" role="dialog" aria-modal="true">
  <div class="conf-content">
    <div class="conf-icon"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>
    <h2>Order Placed!</h2>
    <p>Your order has been successfully placed. We're preparing your freshly baked goods.</p>
    
    <div class="conf-details">
      <div class="cd-row"><span>Order Number:</span><b id="confOrderNo">MAB-000000</b></div>
      <div class="cd-row"><span>Est. Time:</span><b>35 Minutes</b></div>
    </div>
    
    <div class="conf-btns">
      <button class="btn btn-wa" style="width:100%;justify-content:center;padding:16px" onclick="sendToWhatsApp()">
        <svg viewBox="0 0 24 24" style="width:18px;height:18px;margin-right:8px"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
        Send Order to WhatsApp
      </button>
      <button class="btn btn-primary" style="width:100%;justify-content:center;padding:16px" onclick="window.location.href='track.html'">Track Order</button>
      <button class="btn btn-outline" style="width:100%;justify-content:center;padding:16px" onclick="downloadInvoice()">Download Invoice (PDF)</button>
      <button class="btn" style="width:100%;justify-content:center;margin-top:12px;color:var(--text-sub)" onclick="closeConf()">Back to Store</button>
    </div>
  </div>
</div>

<!-- ============================================================
     JAVASCRIPT
============================================================ -->
`;
html = html.replace('<!-- ============================================================\n     JAVASCRIPT\n============================================================ -->\n<script>', modalsHtml + '<script src="js/api.js"></script>\n<script src="js/cart.js"></script>\n<script src="js/checkout.js"></script>\n<script>');

// 4. Remove old inline cart logic
const cartLogicStart = html.indexOf('/* ---- CART ---- */');
const delegatedStart = html.indexOf('/* ---- DELEGATED CLICKS ---- */');

if (cartLogicStart > -1 && delegatedStart > -1) {
  html = html.substring(0, cartLogicStart) + html.substring(delegatedStart);
}

// 5. Update Delegated Clicks for Add/Remove
html = html.replace(
`    if (!cart[id]) cart[id] = {...p, qty:0};
    cart[id].qty++;
    renderCart();
    showToast(\`\${p.name} added to cart\`);`, 
`    if(window.Cart) window.Cart.addToCart(id, p);`
);

html = html.replace(
`  const rmBtn = e.target.closest('[data-remove]');
  if (rmBtn) { e.preventDefault(); delete cart[rmBtn.dataset.remove]; renderCart(); return; }`,
`  const rmBtn = e.target.closest('[data-remove]');
  if (rmBtn) { e.preventDefault(); if(window.Cart) window.Cart.removeFromCart(rmBtn.dataset.remove); return; }`
);

// 6. Remove the checkout logic at the bottom we injected earlier
const checkoutBlockStart = html.indexOf('/* ---- CHECKOUT ---- */');
if (checkoutBlockStart > -1) {
  const endScript = html.indexOf('})();', checkoutBlockStart);
  html = html.substring(0, checkoutBlockStart) + html.substring(endScript);
}

fs.writeFileSync('d:\\MA WEBSITE\\index.html', html);
console.log('index.html patched successfully.');
