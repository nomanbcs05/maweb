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
  const btn = document.querySelector('.form-group .btn');
  
  if (!input) return;
  
  btn.textContent = 'Searching...';
  btn.disabled = true;
  err.style.display = 'none';
  tl.classList.remove('show');
  
  try {
    const order = await window.API.getOrderById(input);
    if (!order) {
      err.style.display = 'block';
      err.textContent = 'Order not found. Please check your order ID.';
    } else {
      renderTimeline(order);
      tl.classList.add('show');
    }
  } catch (e) {
    err.style.display = 'block';
    err.textContent = 'An error occurred while fetching the order.';
  }
  
  btn.textContent = 'Track';
  btn.disabled = false;
}

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
