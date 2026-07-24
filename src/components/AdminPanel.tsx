import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, TrendingUp, Package, Truck, DollarSign, Clock, X, MessageCircle, Printer, Eye } from 'lucide-react';
import type { Order } from '../types';
import { API } from '../services/api';

interface AdminPanelProps {
  onBackToStore: () => void;
}

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Preparing', 'Baking', 'Out for Delivery', 'Ready for Pickup', 'Delivered', 'Cancelled'];

const STATUS_COLORS: Record<string, string> = {
  'Pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Confirmed': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Preparing': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  'Baking': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Out for Delivery': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  'Ready for Pickup': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  'Delivered': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Cancelled': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

// Simple SVG mini bar chart
const MiniBarChart: React.FC<{ data: number[]; labels: string[]; color: string }> = ({ data, labels, color }) => {
  const max = Math.max(...data, 1);
  const width = 400;
  const height = 120;
  const barWidth = width / data.length - 6;

  return (
    <svg viewBox={`0 0 ${width} ${height + 24}`} className="w-full">
      {data.map((val, i) => {
        const barH = Math.max(4, (val / max) * height);
        const x = i * (width / data.length) + 3;
        const y = height - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barH} rx="3" fill={color} opacity={val === 0 ? 0.2 : 0.85} />
            <text x={x + barWidth / 2} y={height + 16} textAnchor="middle" fontSize="9" fill="#aaa">
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToStore }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await API.getOrders();
      setOrders(data);
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await API.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus as Order['status'] } : null);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const sendWhatsApp = (order: Order) => {
    const items = (order.items || []).map(i => `${i.quantity}x ${i.product_name}`).join(', ') || '(details)';
    const msg = `🍰 *M.A Bakers — Order Update*\n\nHi ${order.customer_name}!\n\nYour order *#${order.id}* is now: *${order.status}*\n\nItems: ${items}\nTotal: Rs. ${order.total_amount.toFixed(0)}\n\nThank you for ordering! 💛`;
    const phone = order.customer_phone.replace(/\D/g, '');
    const waPhone = phone.startsWith('0') ? `92${phone.slice(1)}` : phone;
    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const printKOT = (order: Order) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const itemsHtml = (order.items || []).map(i =>
      `<div class="item"><span class="qty">${i.quantity}x</span><span class="name">${i.product_name}</span>${i.notes ? `<div class="note">Note: ${i.notes}</div>` : ''}</div>`
    ).join('');

    win.document.write(`
      <!DOCTYPE html><html><head>
        <title>KOT — ${order.id}</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family: 'Courier New', monospace; padding: 16px; width: 300px; font-size: 13px; }
          h1 { font-size: 18px; text-align: center; margin-bottom: 4px; }
          .sub { text-align: center; font-size: 11px; color: #555; margin-bottom: 12px; }
          hr { border-top: 1px dashed #ccc; margin: 10px 0; }
          .item { margin-bottom: 8px; }
          .qty { font-weight: bold; font-size: 15px; margin-right: 8px; }
          .name { font-size: 14px; }
          .note { font-size: 11px; color: #666; margin-left: 24px; margin-top: 2px; }
          .footer { text-align: center; font-size: 11px; margin-top: 12px; color: #888; }
          .meta { font-size: 11px; color: #555; margin-bottom: 4px; }
        </style>
      </head><body>
        <h1>M.A BAKERS</h1>
        <div class="sub">Kitchen Order Ticket</div>
        <hr />
        <div class="meta"><b>Order:</b> ${order.id}</div>
        <div class="meta"><b>Type:</b> ${order.type.toUpperCase()}</div>
        <div class="meta"><b>Time:</b> ${new Date(order.created_at || '').toLocaleTimeString()}</div>
        ${order.type === 'delivery' && order.address ? `<div class="meta"><b>Delivery To:</b> ${order.address.area}</div>` : ''}
        <hr />
        ${itemsHtml}
        <hr />
        <div class="footer">Please prepare order urgently.<br />M.A Bakers Kitchen</div>
        <script>window.onload = () => window.print();</script>
      </body></html>
    `);
    win.document.close();
  };

  // Stats
  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.created_at || '').toDateString() === today);
  const pendingOrders = orders.filter(o => o.status === 'Pending');
  const totalRevenue = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.total_amount, 0);
  const deliveryOrders = orders.filter(o => o.type === 'delivery');

  // Chart — last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const chartData = last7Days.map(d =>
    orders.filter(o => new Date(o.created_at || '').toDateString() === d.toDateString()).length
  );
  const chartLabels = last7Days.map(d => d.toLocaleDateString('en-PK', { weekday: 'short' }));

  // Revenue chart
  const revenueData = last7Days.map(d =>
    orders
      .filter(o => new Date(o.created_at || '').toDateString() === d.toDateString() && o.status === 'Delivered')
      .reduce((s, o) => s + o.total_amount, 0)
  );

  const filtered = statusFilter === 'All' ? orders : orders.filter(o => o.status === statusFilter);

  const statCards = [
    { label: "Today's Orders", value: todayOrders.length, icon: Package, color: '#C99A3E', bg: 'bg-amber-50 dark:bg-amber-950/20' },
    { label: "Pending Orders", value: pendingOrders.length, icon: Clock, color: '#f97316', bg: 'bg-orange-50 dark:bg-orange-950/20' },
    { label: "Total Revenue", value: `Rs. ${Math.round(totalRevenue / 1000)}K`, icon: DollarSign, color: '#16a34a', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
    { label: "Delivery Orders", value: deliveryOrders.length, icon: Truck, color: '#7c3aed', bg: 'bg-violet-50 dark:bg-violet-950/20' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-stone-200/50 dark:border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-900 text-stone-500 cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-family-fraunces text-xl font-bold">Admin Dashboard</h1>
              <p className="text-[10px] text-stone-400 uppercase tracking-wider">M.A Bakers Management Portal</p>
            </div>
          </div>
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-zinc-800 hover:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all active:scale-95 disabled:opacity-40"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`${card.bg} border border-stone-200/50 dark:border-zinc-800/80 rounded-2xl p-5`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: card.color + '20' }}>
                    <Icon size={20} style={{ color: card.color }} />
                  </div>
                  <TrendingUp size={14} className="text-stone-300 dark:text-zinc-700" />
                </div>
                <p className="text-2xl font-bold text-stone-900 dark:text-white">{card.value}</p>
                <p className="text-xs text-stone-400 mt-1">{card.label}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-stone-200/50 dark:border-zinc-800/80 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-family-fraunces font-bold text-stone-900 dark:text-white">Orders (Last 7 Days)</h3>
              <span className="text-xs text-stone-400">{orders.length} total</span>
            </div>
            <MiniBarChart data={chartData} labels={chartLabels} color="#C99A3E" />
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-stone-200/50 dark:border-zinc-800/80 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-family-fraunces font-bold text-stone-900 dark:text-white">Revenue (Last 7 Days)</h3>
              <span className="text-xs text-stone-400">Delivered only</span>
            </div>
            <MiniBarChart data={revenueData} labels={chartLabels} color="#16a34a" />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-zinc-900 border border-stone-200/50 dark:border-zinc-800/80 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-stone-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-family-fraunces font-bold text-stone-900 dark:text-white">Order Management</h3>
            <div className="flex gap-2 flex-wrap">
              {['All', 'Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    statusFilter === s ? 'bg-stone-900 dark:bg-amber-600 text-white' : 'bg-stone-100 dark:bg-zinc-800 text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-stone-400">
              <RefreshCw size={24} className="animate-spin mx-auto mb-3" />
              <p className="text-sm">Loading orders...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-stone-400">
              <Package size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No {statusFilter !== 'All' ? statusFilter.toLowerCase() : ''} orders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-stone-50 dark:bg-zinc-950/50">
                  <tr>
                    {['Order', 'Customer', 'Type', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-bold uppercase tracking-wider text-stone-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-zinc-800/60">
                  {filtered.map(order => (
                    <tr key={order.id} className="hover:bg-stone-50 dark:hover:bg-zinc-950/40 transition-colors">
                      <td className="px-4 py-3 font-family-fraunces font-bold text-stone-900 dark:text-white">{order.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-stone-900 dark:text-white">{order.customer_name}</p>
                        <p className="text-stone-400">{order.customer_phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold">{order.type === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-stone-900 dark:text-white">Rs. {order.total_amount.toFixed(0)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border-0 cursor-pointer outline-none ${STATUS_COLORS[order.status] || 'bg-stone-100 text-stone-600'}`}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-stone-400">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => sendWhatsApp(order)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-[#25D366] hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer"
                            title="WhatsApp Customer"
                          >
                            <MessageCircle size={14} />
                          </button>
                          <button
                            onClick={() => printKOT(order)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Print KOT"
                          >
                            <Printer size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white dark:bg-zinc-950 w-full max-w-sm shadow-2xl overflow-y-auto">
            <div className="p-6 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-family-fraunces text-lg font-bold">{selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-900 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5 text-sm">
              <div>
                <p className="text-xs font-bold uppercase text-stone-400 mb-2">Customer Info</p>
                <p className="font-semibold">{selectedOrder.customer_name}</p>
                <p className="text-stone-500">{selectedOrder.customer_phone}</p>
                {selectedOrder.customer_email && <p className="text-stone-500">{selectedOrder.customer_email}</p>}
              </div>

              {selectedOrder.type === 'delivery' && selectedOrder.address && (
                <div>
                  <p className="text-xs font-bold uppercase text-stone-400 mb-2">Delivery Address</p>
                  <p className="font-semibold">{selectedOrder.address.house}</p>
                  <p className="text-stone-500">{selectedOrder.address.area}</p>
                  {selectedOrder.address.instructions && <p className="text-stone-400 text-xs italic mt-1">{selectedOrder.address.instructions}</p>}
                </div>
              )}

              <div>
                <p className="text-xs font-bold uppercase text-stone-400 mb-2">Order Items</p>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((it, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-stone-700 dark:text-stone-300">{it.quantity}x {it.product_name}</span>
                      <span className="font-semibold">Rs. {(it.price * it.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                  {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                    <p className="text-stone-400 text-xs">No item details available.</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between text-stone-500"><span>Delivery Fee</span><span>Rs. {selectedOrder.delivery_fee.toFixed(0)}</span></div>
                <div className="flex justify-between text-stone-500"><span>Tax</span><span>Rs. {selectedOrder.tax.toFixed(0)}</span></div>
                {selectedOrder.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>-Rs. {selectedOrder.discount.toFixed(0)}</span></div>}
                <div className="flex justify-between font-bold text-sm text-stone-900 dark:text-white pt-2 border-t border-stone-100 dark:border-zinc-800">
                  <span>Grand Total</span>
                  <span>Rs. {selectedOrder.total_amount.toFixed(0)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold uppercase text-stone-400 mb-2">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selectedOrder.id, s)}
                      disabled={updatingId === selectedOrder.id}
                      className={`text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg transition-all cursor-pointer ${
                        selectedOrder.status === s
                          ? 'bg-stone-900 dark:bg-amber-600 text-white'
                          : 'bg-stone-100 dark:bg-zinc-800 text-stone-500 hover:bg-stone-200'
                      }`}
                    >
                      {updatingId === selectedOrder.id && selectedOrder.status !== s ? '...' : s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => sendWhatsApp(selectedOrder)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all hover:opacity-90"
                >
                  <MessageCircle size={15} /> WhatsApp Customer
                </button>
                <button
                  onClick={() => printKOT(selectedOrder)}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-stone-200 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all hover:bg-stone-50"
                >
                  <Printer size={15} /> Print KOT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};