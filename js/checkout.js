/**
 * M.A Bakers - Professional Checkout System & WhatsApp Integration
 */

let currentStep = 1;
const totalSteps = 4;
let orderData = {
  type: 'delivery',
  time: 'asap',
  payment: 'cod',
  customer: {},
  address: {},
  pickup: {}
};

// Open Checkout Modal
function openCheckout() {
  const cart = window.Cart.getCart();
  if (Object.keys(cart).length === 0) {
    if(window.showToast) window.showToast('Your cart is empty', true);
    return;
  }
  
  // Try to load saved customer info
  window.API.getSavedCustomer().then(cust => {
    if (cust) {
      document.getElementById('coName').value = cust.name || '';
      document.getElementById('coPhone').value = cust.phone || '';
      document.getElementById('coEmail').value = cust.email || '';
    }
  });
  
  updateSummarySidebar();
  document.getElementById('coModal').classList.add('show');
  document.body.style.overflow = 'hidden';
  goToStep(1);
  window.openCheckout = openCheckout;
}
window.openCheckout = openCheckout;

function closeCheckout() {
  document.getElementById('coModal').classList.remove('show');
  document.body.style.overflow = '';
}

// Navigation
function goToStep(step) {
  if (step > currentStep && !validateStep(currentStep)) return;
  
  // Hide all
  document.querySelectorAll('.co-step').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.co-step-indicator').forEach(el => {
    el.classList.remove('active');
    const stepNum = parseInt(el.dataset.step);
    if (stepNum < step) el.classList.add('done');
    else el.classList.remove('done');
  });
  
  // Show target
  currentStep = step;
  document.getElementById(`step${step}`).classList.add('active');
  document.querySelector(`.co-step-indicator[data-step="${step}"]`).classList.add('active');
  
  // Update Buttons
  document.getElementById('coPrevBtn').style.visibility = step === 1 ? 'hidden' : 'visible';
  const nextBtn = document.getElementById('coNextBtn');
  if (step === totalSteps) {
    nextBtn.innerHTML = 'Place Order <svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;margin-left:8px"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
  } else {
    nextBtn.innerHTML = 'Continue <svg viewBox="0 0 24 24" style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2;margin-left:8px"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
  }
  
  if (step === totalSteps) buildFinalReview();
}

function handleNext() {
  if (currentStep < totalSteps) {
    saveStepData(currentStep);
    goToStep(currentStep + 1);
  } else {
    submitOrder();
  }
}
function handlePrev() {
  if (currentStep > 1) goToStep(currentStep - 1);
}

// Validation
function validateStep(step) {
  let isValid = true;
  const mark = (id, valid) => {
    const fg = document.getElementById(id).parentElement;
    fg.classList.toggle('invalid', !valid);
    if (!valid) isValid = false;
  };

  if (step === 1) {
    // Info & Type
    const name = document.getElementById('coName').value.trim();
    const phone = document.getElementById('coPhone').value.trim();
    mark('coName', name.length >= 2);
    // basic pk phone regex 03xx xxxxxxx
    mark('coPhone', /^03\d{2}[-\s]?\d{7}$/.test(phone)); 
    
    if (orderData.type === 'delivery') {
      mark('coAddress', document.getElementById('coAddress').value.trim().length > 5);
      mark('coArea', document.getElementById('coArea').value.trim().length > 2);
    }
  }
  return isValid;
}

// Data Collection
function saveStepData(step) {
  if (step === 1) {
    orderData.customer = {
      name: document.getElementById('coName').value.trim(),
      phone: document.getElementById('coPhone').value.trim(),
      email: document.getElementById('coEmail').value.trim()
    };
    if (orderData.type === 'delivery') {
      orderData.address = {
        house: document.getElementById('coAddress').value.trim(),
        area: document.getElementById('coArea').value.trim(),
        instructions: document.getElementById('coInstr').value.trim()
      };
    } else {
      orderData.pickup = {
        branch: document.getElementById('coBranch').value
      };
    }
  }
  if (step === 2) {
    // Schedule
    // already bound by onClick events on cards
  }
  if (step === 3) {
    // Payment
  }
}

// Selectors interactions
function selectType(type) {
  orderData.type = type;
  document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
  document.querySelector(`.type-card[data-val="${type}"]`).classList.add('selected');
  document.getElementById('deliveryForm').style.display = type === 'delivery' ? 'grid' : 'none';
  document.getElementById('pickupForm').style.display = type === 'pickup' ? 'block' : 'none';
  updateSummarySidebar();
}

function selectTime(time) {
  orderData.time = time;
  document.querySelectorAll('.time-card').forEach(c => c.classList.remove('selected'));
  document.querySelector(`.time-card[data-val="${time}"]`).classList.add('selected');
}

function selectPayment(pmt) {
  orderData.payment = pmt;
  document.querySelectorAll('.pmt-card').forEach(c => c.classList.remove('selected'));
  document.querySelector(`.pmt-card[data-val="${pmt}"]`).classList.add('selected');
}

// Sidebar updates
function updateSummarySidebar() {
  const totals = window.Cart.calculateTotals();
  const cart = window.Cart.getCart();
  const container = document.getElementById('sumItems');
  
  container.innerHTML = Object.keys(cart).map(id => {
    return `<div class="sum-item">
      <span>${cart[id].qty}x ${cart[id].name}</span>
      <b>Rs. ${(cart[id].qty * cart[id].price).toFixed(0)}</b>
    </div>`;
  }).join('');
  
  document.getElementById('sumSub').textContent = `Rs. ${totals.subtotal.toFixed(0)}`;
  document.getElementById('sumTax').textContent = `Rs. ${totals.tax.toFixed(0)}`;
  
  // Adjust delivery fee based on order type
  const delFee = orderData.type === 'delivery' ? totals.delivery : 0;
  document.getElementById('sumDel').textContent = orderData.type === 'delivery' ? `Rs. ${delFee.toFixed(0)}` : 'Free (Pickup)';
  
  const grand = totals.subtotal + totals.tax + delFee - totals.discountAmount;
  document.getElementById('sumGrand').textContent = `Rs. ${grand.toFixed(0)}`;
}

// Step 4 Review
function buildFinalReview() {
  const c = orderData.customer;
  document.getElementById('revCust').innerHTML = `${c.name}<br>${c.phone}<br>${c.email}`;
  
  if (orderData.type === 'delivery') {
    const a = orderData.address;
    document.getElementById('revType').innerHTML = `<b>Delivery to:</b><br>${a.house}, ${a.area}<br><i>${a.instructions}</i>`;
  } else {
    document.getElementById('revType').innerHTML = `<b>Pickup from:</b><br>${orderData.pickup.branch}`;
  }
  
  const pmap = { 'cod':'Cash on Delivery', 'card':'Credit/Debit Card', 'transfer':'Bank Transfer' };
  document.getElementById('revPmt').innerHTML = pmap[orderData.payment];
}

// Submit Order
async function submitOrder() {
  const btn = document.getElementById('coNextBtn');
  btn.textContent = 'Processing...';
  btn.disabled = true;
  
  const totals = window.Cart.calculateTotals();
  const delFee = orderData.type === 'delivery' ? totals.delivery : 0;
  const grand = totals.subtotal + totals.tax + delFee - totals.discountAmount;
  
  const finalOrder = {
    ...orderData,
    items: window.Cart.getCart(),
    totals: { ...totals, delivery: delFee, total: grand }
  };
  
  try {
    const savedOrder = await window.API.saveOrder(finalOrder);
    window.Cart.clearCart();
    closeCheckout();
    showConfirmation(savedOrder);
  } catch (e) {
    if(window.showToast) window.showToast('Error placing order', true);
    btn.innerHTML = 'Place Order';
    btn.disabled = false;
  }
}

// Confirmation
let lastOrder = null;
function showConfirmation(order) {
  lastOrder = order;
  document.getElementById('confOrderNo').textContent = order.id;
  document.getElementById('confModal').classList.add('show');
}

function closeConf() {
  document.getElementById('confModal').classList.remove('show');
}

// WhatsApp Integration
function sendToWhatsApp() {
  if (!lastOrder) return;
  const o = lastOrder;
  const c = o.customer;
  const itemsText = Object.values(o.items).map(i => `${i.qty} x ${i.name} ${i.notes ? `(${i.notes})` : ''}`).join('%0A');
  
  const pmap = { 'cod':'Cash on Delivery', 'card':'Credit/Debit Card', 'transfer':'Bank Transfer' };
  
  let addr = 'Pickup';
  if (o.type === 'delivery') {
    addr = `${o.address.house}, ${o.address.area}`;
  }
  
  const msg = `🛒 *NEW ORDER RECEIVED*
  
*Order #:* ${o.id}

*Customer:*
Name: ${c.name}
Phone: ${c.phone}

*Order Type:* ${o.type.toUpperCase()}
${o.type === 'delivery' ? `*Address:*\n${addr}` : `*Branch:*\n${o.pickup.branch}`}

*Items:*
${itemsText}

*Subtotal:* Rs. ${o.totals.subtotal.toFixed(0)}
*Delivery:* Rs. ${o.totals.delivery.toFixed(0)}
*Total:* Rs. ${o.totals.total.toFixed(0)}

*Payment Method:* ${pmap[o.payment]}
${o.type==='delivery' && o.address.instructions ? `\n*Instructions:* ${o.address.instructions}` : ''}
`;

  // Use requested number
  const waNum = '923358273725'; // Stripped leading 0, added 92 for Pakistan
  window.open(`https://wa.me/${waNum}?text=${msg}`, '_blank');
}

function downloadInvoice() {
  // Simple print for now
  window.print();
}

// Initialization bindings
document.addEventListener('DOMContentLoaded', () => {
  // We will inject the HTML for checkout in index.html, then these will bind.
  // Wait for HTML to be ready
});
