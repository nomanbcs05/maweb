/**
 * M.A Bakers - Admin Dashboard Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  loadOrders();
});

async function loadOrders() {
  const tbody = document.getElementById('ordersTableBody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;">Loading orders...</td></tr>';
  
  try {
    const orders = await window.API.getOrders();
    updateStats(orders);
    renderTable(orders);
    initChart(orders);
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--red);">Error loading orders</td></tr>';
  }
}

function updateStats(orders) {
  // Simple today stats (mock logic)
  const today = new Date().toISOString().split('T')[0];
  const todaysOrders = orders.filter(o => o.createdAt.startsWith(today));
  
  const sales = todaysOrders.reduce((sum, o) => sum + o.totals.total, 0);
  const pending = orders.filter(o => o.status === 'Pending').length;
  
  document.getElementById('statSales').textContent = `$${sales.toFixed(2)}`;
  document.getElementById('statOrders').textContent = todaysOrders.length;
  document.getElementById('statPending').textContent = pending;
  
  const aov = todaysOrders.length > 0 ? sales / todaysOrders.length : 0;
  document.getElementById('statAOV').textContent = `$${aov.toFixed(2)}`;
}

function renderTable(orders) {
  const tbody = document.getElementById('ordersTableBody');
  
  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;">No orders found.</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map(o => {
    const d = new Date(o.createdAt);
    const dateStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    
    // Items sum string
    const itemsKeys = Object.keys(o.items);
    let itemsStr = itemsKeys.length > 0 ? `${o.items[itemsKeys[0]].qty}x ${o.items[itemsKeys[0]].name}` : '';
    if (itemsKeys.length > 1) itemsStr += ` + ${itemsKeys.length - 1} more`;

    // Status class
    const sClass = o.status.toLowerCase();

    return `
      <tr>
        <td><b>${o.id}</b></td>
        <td>${dateStr}</td>
        <td>
          <b>${o.customer.name}</b>
          <div class="cell-sub">${o.customer.phone}</div>
        </td>
        <td>
          ${itemsStr}
          <div class="cell-sub">${o.type.toUpperCase()}</div>
        </td>
        <td><b>$${o.totals.total.toFixed(2)}</b></td>
        <td>
          <select class="status-select ${sClass}" onchange="changeStatus('${o.id}', this.value, this)">
            <option value="Pending" ${o.status==='Pending'?'selected':''}>Pending</option>
            <option value="Preparing" ${o.status==='Preparing'?'selected':''}>Preparing</option>
            <option value="Baking" ${o.status==='Baking'?'selected':''}>Baking</option>
            <option value="Out for Delivery" ${o.status==='Out for Delivery'?'selected':''}>Out for Delivery</option>
            <option value="Ready for Pickup" ${o.status==='Ready for Pickup'?'selected':''}>Ready for Pickup</option>
            <option value="Delivered" ${o.status==='Delivered'?'selected':''}>Delivered</option>
            <option value="Cancelled" ${o.status==='Cancelled'?'selected':''}>Cancelled</option>
          </select>
        </td>
        <td>
          <div class="action-btns">
            <button class="act-btn" title="View Details"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/></svg></button>
            <button class="act-btn wa" title="WhatsApp Customer" onclick="window.open('https://wa.me/92${o.customer.phone.replace(/^0/,'')}','_blank')"><svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function changeStatus(id, newStatus, selectEl) {
  selectEl.disabled = true;
  try {
    await window.API.updateOrderStatus(id, newStatus);
    selectEl.className = `status-select ${newStatus.toLowerCase()}`;
  } catch (e) {
    alert('Failed to update status');
    // Revert logic could go here
  }
  selectEl.disabled = false;
}

function initChart(orders) {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;
  
  // Mock data generation for 7 days
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data = [1200, 1900, 1500, 2200, 1800, 3200, 2800];
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Revenue ($)',
        data: data,
        borderColor: '#C99A3E',
        backgroundColor: 'rgba(201, 154, 62, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#8A8278' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#8A8278' }
        }
      }
    }
  });
}
