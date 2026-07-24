/**
 * M.A Bakers - Order Tracking Logic
 */

document.getElementById('orderIdInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') trackOrder();
});

async function trackOrder() {
  const input = document.getElementById('orderIdInput').value.trim();
  const err = document.getElementById('errMsg');
  const tl = document.getElementById('timeline');
  const list = document.getElementById('ordersList');
  const btn = document.querySelector('.form-group .btn');
  
  if (!input) return;
  
  btn.textContent = 'Searching...';
  btn.disabled = true;
  err.style.display = 'none';
  tl.classList.remove('show');
  list.innerHTML = '';
  
  try {
    const isOrderId = input.toUpperCase().startsWith('MAB-');
    
    if (isOrderId) {
      const order = await window.API.getOrderById(input);
      if (!order) {
        err.style.display = 'block';
        err.textContent = 'Order not found. Please check your order ID.';
      } else {
        renderTimeline(order);
        tl.classList.add('show');
      }
    } else {
      // Phone number search
      const cleanedPhone = input.replace(/\D/g, '');
      if (cleanedPhone.length < 7) {
        err.style.display = 'block';
        err.textContent = 'Please enter a valid order ID or registered phone number.';
        btn.textContent = 'Track';
        btn.disabled = false;
        return;
      }
      
      const orders = await window.API.getOrders();
      const matched = orders.filter(o => o.customer && o.customer.phone.replace(/\D/g, '').includes(cleanedPhone));
      
      if (matched.length === 0) {
        err.style.display = 'block';
        err.textContent = 'No orders found for this phone number.';
      } else if (matched.length === 1) {
        renderTimeline(matched[0]);
        tl.classList.add('show');
      } else {
        // Render multiple order cards
        list.innerHTML = matched.map(o => {
          const d = new Date(o.createdAt);
          const dateStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
          const sClass = o.status.toLowerCase().replace(/\s+/g, '');
          
          return `
            <div class="order-card" onclick="selectOrder('${o.id}')">
              <div class="order-card-info">
                <b>${o.id}</b>
                <span>${dateStr} &middot; Rs. ${o.totals.total.toFixed(0)}</span>
              </div>
              <span class="status-pill ${sClass}">${o.status}</span>
            </div>
          `;
        }).join('');
      }
    }
  } catch (e) {
    err.style.display = 'block';
    err.textContent = 'An error occurred while fetching the order.';
  }
  
  btn.textContent = 'Track';
  btn.disabled = false;
}

window.selectOrder = async function(id) {
  const err = document.getElementById('errMsg');
  const tl = document.getElementById('timeline');
  const list = document.getElementById('ordersList');
  
  try {
    const order = await window.API.getOrderById(id);
    if (order) {
      list.innerHTML = '';
      renderTimeline(order);
      tl.classList.add('show');
    }
  } catch(e) {
    err.style.display = 'block';
    err.textContent = 'Error loading the selected order.';
  }
};

function renderTimeline(order) {
  document.getElementById('tlOrderId').textContent = order.id;
  document.getElementById('tlStatusTag').textContent = order.status;
  
  // Update "Out" wording based on delivery vs pickup
  if (order.type === 'pickup') {
    document.getElementById('ts-Out').querySelector('.tl-title').textContent = 'Ready for Pickup';
    document.getElementById('ts-Out').querySelector('.tl-desc').textContent = 'Your order is waiting at the branch.';
    document.getElementById('ts-Delivered').querySelector('.tl-title').textContent = 'Picked Up';
  } else {
    document.getElementById('ts-Out').querySelector('.tl-title').textContent = 'Out for Delivery';
    document.getElementById('ts-Out').querySelector('.tl-desc').textContent = 'Your order is on the way to you.';
    document.getElementById('ts-Delivered').querySelector('.tl-title').textContent = 'Delivered';
  }

  // Reset all
  const steps = ['Pending', 'Preparing', 'Baking', 'Out', 'Delivered'];
  steps.forEach(s => {
    const el = document.getElementById(`ts-${s}`);
    if (el) {
      el.classList.remove('done', 'active');
    }
  });
  
  // Status mapping
  let currentIdx = 0;
  const statusStr = order.status.toLowerCase();
  
  if (statusStr.includes('pending')) currentIdx = 0;
  else if (statusStr.includes('preparing')) currentIdx = 1;
  else if (statusStr.includes('baking')) currentIdx = 2;
  else if (statusStr.includes('out') || statusStr.includes('ready')) currentIdx = 3;
  else if (statusStr.includes('delivered') || statusStr.includes('picked')) currentIdx = 4;
  else if (statusStr.includes('cancelled')) {
    document.getElementById('tlStatusTag').style.color = 'var(--red)';
    document.getElementById('tlStatusTag').style.background = 'rgba(239, 68, 68, 0.1)';
    return; // Leave timeline grayed out
  }
  
  document.getElementById('tlStatusTag').style.color = 'var(--gold)';
  document.getElementById('tlStatusTag').style.background = 'rgba(201,154,62,0.1)';
  
  if (currentIdx === 4) {
    document.getElementById('tlStatusTag').style.color = 'var(--green)';
    document.getElementById('tlStatusTag').style.background = 'rgba(45, 154, 82, 0.1)';
  }
  
  // Mark done/active
  for (let i = 0; i <= currentIdx; i++) {
    const el = document.getElementById(`ts-${steps[i]}`);
    if (i === currentIdx) {
      el.classList.add('active');
    } else {
      el.classList.add('done');
    }
  }
}
