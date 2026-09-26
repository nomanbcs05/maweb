import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  LayoutDashboard, ShoppingBag, Package, Tag, Warehouse, Users,
  Ticket, BarChart2, Settings, LogOut, Bell, RefreshCw, Search,
  Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Eye, X, Check,
  AlertTriangle, Printer, MessageCircle, TrendingUp, TrendingDown,
  Filter, ChevronRight, Clock, Truck, CheckCircle, XCircle, Info,
  Save
} from 'lucide-react';
import type { Order, Product, Category } from '../types';
import { API } from '../services/api';
import { useAdminAuth } from './admin/AdminLogin';
import {
  STATUS_OPTIONS, STATUS_STYLES,
  formatCurrency, formatDate, formatShortDate
} from './admin/adminUtils';

// ─────────────────────────────────────────────────────
// NAV ITEMS
// ─────────────────────────────────────────────────────
type NavSection = 'dashboard' | 'orders' | 'products' | 'categories' | 'inventory' | 'customers' | 'coupons' | 'analytics' | 'settings';

const NAV_ITEMS: { id: NavSection; label: string; Icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'dashboard',  label: 'Dashboard',  Icon: LayoutDashboard },
  { id: 'orders',     label: 'Orders',     Icon: ShoppingBag },
  { id: 'products',   label: 'Products',   Icon: Package },
  { id: 'categories', label: 'Categories', Icon: Tag },
  { id: 'inventory',  label: 'Inventory',  Icon: Warehouse },
  { id: 'customers',  label: 'Customers',  Icon: Users },
  { id: 'coupons',    label: 'Discounts',  Icon: Ticket },
  { id: 'analytics',  label: 'Analytics',  Icon: BarChart2 },
  { id: 'settings',   label: 'Settings',   Icon: Settings },
];

// ─────────────────────────────────────────────────────
// REUSABLE UI ATOMS
// ─────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  const style = STATUS_STYLES[status] || { bg: 'bg-zinc-100', text: 'text-zinc-600', dot: 'bg-zinc-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${style.bg} ${style.text} ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; sub?: string; Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; color: string; trend?: number }> = ({ label, value, sub, Icon, color, trend }) => (
  <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + '18' }}>
        <Icon size={18} style={{ color }} />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-semibold flex items-center gap-0.5 ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-zinc-900 mb-0.5">{value}</p>
    <p className="text-xs text-zinc-500 font-medium">{label}</p>
    {sub && <p className="text-[10px] text-zinc-400 mt-1">{sub}</p>}
  </div>
);

const ConfirmDialog: React.FC<{ title: string; message: string; onConfirm: () => void; onCancel: () => void; danger?: boolean }> = ({ title, message, onConfirm, onCancel, danger = true }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onCancel} />
    <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${danger ? 'bg-red-50' : 'bg-amber-50'}`}>
        <AlertTriangle size={22} className={danger ? 'text-red-500' : 'text-amber-500'} />
      </div>
      <h3 className="font-bold text-zinc-900 mb-1">{title}</h3>
      <p className="text-sm text-zinc-500 mb-5">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 px-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors">Cancel</button>
        <button onClick={onConfirm} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'}`}>
          Confirm
        </button>
      </div>
    </div>
  </div>
);

const Toast: React.FC<{ message: string; type?: 'success' | 'error' | 'info' }> = ({ message, type = 'success' }) => (
  <div className={`fixed top-4 right-4 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all ${
    type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  }`}>
    {type === 'success' ? <Check size={15} /> : type === 'error' ? <X size={15} /> : <Info size={15} />}
    {message}
  </div>
);

const EmptyState: React.FC<{ Icon: React.ComponentType<{ size?: number; className?: string }>; title: string; description?: string; action?: React.ReactNode }> = ({ Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
      <Icon size={28} className="text-zinc-400" />
    </div>
    <h3 className="font-semibold text-zinc-700 mb-1">{title}</h3>
    {description && <p className="text-sm text-zinc-400 mb-4">{description}</p>}
    {action}
  </div>
);

// Simple inline bar chart
const MiniChart: React.FC<{ data: number[]; labels: string[]; color?: string }> = ({ data, labels, color = '#f59e0b' }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((val: number, i: number) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t transition-all duration-300"
            style={{ height: `${Math.max(4, (val / max) * 56)}px`, backgroundColor: val > 0 ? color : '#e5e7eb' }}
          />
          <span className="text-[8px] text-zinc-400">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────
// SECTION: DASHBOARD
// ─────────────────────────────────────────────────────
const DashboardSection: React.FC<{ orders: Order[]; stats: any }> = ({ orders, stats }) => {
  const [chartData, setChartData] = useState<{ date: string; revenue: number; orders: number }[]>([]);

  useEffect(() => {
    API.getRevenueByDay(7).then(setChartData);
  }, []);

  const last7Labels = chartData.map((d: { date: string }) => {
    const date = new Date(d.date);
    return date.toLocaleDateString('en-PK', { weekday: 'short' });
  });

  const recentOrders = orders.slice(0, 5);
  const pendingOrders = orders.filter(o => o.status === 'Pending').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={stats.totalOrders} Icon={ShoppingBag} color="#f59e0b" sub={`${stats.todayOrders} today`} />
        <StatCard label="Pending" value={stats.pendingOrders} Icon={Clock} color="#ef4444" sub="Need attention" />
        <StatCard label="Revenue (Delivered)" value={formatCurrency(stats.totalRevenue)} Icon={TrendingUp} color="#10b981" sub={formatCurrency(stats.todayRevenue) + ' today'} />
        <StatCard label="Customers" value={stats.totalCustomers} Icon={Users} color="#6366f1" sub="Registered" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Orders — Last 7 Days</h3>
              <p className="text-xs text-zinc-400 mt-0.5">{stats.totalOrders} total</p>
            </div>
          </div>
          <MiniChart
            data={chartData.map((d: { orders: number }) => d.orders)}
            labels={last7Labels}
            color="#f59e0b"
          />
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Revenue — Last 7 Days</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Delivered orders only</p>
            </div>
          </div>
          <MiniChart
            data={chartData.map((d: { revenue: number }) => d.revenue)}
            labels={last7Labels}
            color="#10b981"
          />
        </div>
      </div>

      {/* Recent + Pending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="font-bold text-zinc-900 text-sm">Recent Orders</h3>
            <span className="text-xs text-zinc-400">{orders.length} total</span>
          </div>
          <div className="divide-y divide-zinc-50">
            {recentOrders.length === 0 ? (
              <div className="py-10 text-center text-zinc-400 text-sm">No orders yet</div>
            ) : recentOrders.map(o => (
              <div key={o.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-bold text-zinc-900">{o.id}</p>
                  <p className="text-xs text-zinc-500">{o.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-zinc-900">{formatCurrency(o.total_amount)}</p>
                  <StatusBadge status={o.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="font-bold text-zinc-900 text-sm">Needs Attention</h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pendingOrders.length > 0 ? 'bg-red-50 text-red-600' : 'bg-zinc-100 text-zinc-400'}`}>
              {pendingOrders.length} pending
            </span>
          </div>
          <div className="divide-y divide-zinc-50">
            {pendingOrders.length === 0 ? (
              <div className="py-10 text-center text-zinc-400 text-sm flex flex-col items-center gap-2">
                <CheckCircle size={24} className="text-emerald-400" />
                All caught up!
              </div>
            ) : pendingOrders.map(o => (
              <div key={o.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-bold text-zinc-900">{o.id}</p>
                  <p className="text-xs text-zinc-500">{formatShortDate(o.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(o.total_amount)}</p>
                  <p className="text-xs text-zinc-400">{o.type === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────
// SECTION: ORDERS
// ─────────────────────────────────────────────────────
const OrdersSection: React.FC<{
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
  newOrderIds: Set<string>;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}> = ({ orders, loading, onRefresh, newOrderIds, onToast }) => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const ok = await API.updateOrderStatus(orderId, newStatus);
    if (ok) {
      onToast(`Order ${orderId} → ${newStatus}`);
    } else {
      onToast('Failed to update status', 'error');
    }
    setUpdatingId(null);
    onRefresh();
  };

  const sendWhatsApp = (order: Order) => {
    const items = (order.items || []).map(i => `${i.quantity}x ${i.product_name}`).join(', ') || '(see details)';
    const msg = `🍰 *M.A Bakers — Order Update*\n\nHi ${order.customer_name}!\n\nYour order *#${order.id}* is now: *${order.status}*\n\nItems: ${items}\nTotal: ${formatCurrency(order.total_amount)}\n\nThank you for ordering! 💛`;
    const phone = order.customer_phone.replace(/\D/g, '');
    const waPhone = phone.startsWith('0') ? `92${phone.slice(1)}` : phone;
    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const printKOT = (order: Order) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const itemsHtml = (order.items || []).map(i =>
      `<div class="item"><span class="qty">${i.quantity}x</span> <span class="name">${i.product_name}</span>${i.notes ? `<div class="note">Note: ${i.notes}</div>` : ''}</div>`
    ).join('');
    win.document.write(`<!DOCTYPE html><html><head><title>KOT — ${order.id}</title>
      <style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Courier New',monospace;padding:16px;width:300px;font-size:13px;}h1{font-size:18px;text-align:center;margin-bottom:4px;}.sub{text-align:center;font-size:11px;color:#555;margin-bottom:12px;}hr{border-top:1px dashed #ccc;margin:10px 0;}.item{margin-bottom:8px;}.qty{font-weight:bold;font-size:15px;margin-right:8px;}.name{font-size:14px;}.note{font-size:11px;color:#666;margin-left:24px;margin-top:2px;}.footer{text-align:center;font-size:11px;margin-top:12px;color:#888;}.meta{font-size:11px;color:#555;margin-bottom:4px;}</style>
    </head><body>
      <h1>M.A BAKERS</h1><div class="sub">Kitchen Order Ticket</div><hr/>
      <div class="meta"><b>Order:</b> ${order.id}</div>
      <div class="meta"><b>Type:</b> ${order.type.toUpperCase()}</div>
      <div class="meta"><b>Time:</b> ${new Date(order.created_at || '').toLocaleTimeString()}</div>
      ${order.type === 'delivery' && order.address ? `<div class="meta"><b>Delivery To:</b> ${order.address.area}</div>` : ''}
      <hr/>${itemsHtml}<hr/>
      <div class="footer">Please prepare urgently.<br/>M.A Bakers Kitchen</div>
      <script>window.onload=()=>window.print();</script>
    </body></html>`);
    win.document.close();
  };

  const filtered = orders.filter(o => {
    if (statusFilter !== 'All' && o.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return o.id.toLowerCase().includes(s) || o.customer_name.toLowerCase().includes(s) || o.customer_phone.includes(s);
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header + Controls */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs">
        <div className="p-4 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-zinc-900">Order Management</h2>
            <span className="text-xs font-semibold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">{filtered.length}</span>
            {newOrderIds.size > 0 && (
              <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                {newOrderIds.size} NEW
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:border-amber-400 transition-colors w-48"
              />
            </div>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 border border-zinc-200 rounded-lg text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="px-4 py-2 flex gap-1.5 overflow-x-auto border-b border-zinc-100 scrollbar-none">
          {['All', ...STATUS_OPTIONS].map((s: string) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`shrink-0 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide rounded-lg transition-all cursor-pointer ${
                statusFilter === s
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-500 hover:bg-zinc-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-16 text-center text-zinc-400">
            <RefreshCw size={20} className="animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading orders...</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState Icon={ShoppingBag} title="No orders found" description={search ? 'Try a different search term' : 'Orders will appear here when placed'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50/80">
                <tr>
                  {['Order', 'Customer', 'Type', 'Items', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filtered.map(order => (
                  <tr
                    key={order.id}
                    className={`hover:bg-zinc-50/60 transition-colors ${newOrderIds.has(order.id) ? 'bg-amber-50/50 border-l-2 border-amber-400' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-bold text-zinc-900 text-xs">{order.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-zinc-900 text-xs">{order.customer_name}</p>
                      <p className="text-zinc-400 text-[11px]">{order.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-600">
                      {order.type === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {order.items && order.items.length > 0
                        ? `${order.items.length} item${order.items.length > 1 ? 's' : ''}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 font-bold text-zinc-900 text-xs">{formatCurrency(order.total_amount)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className="text-[10px] font-bold uppercase rounded-lg px-2 py-1 border border-zinc-200 outline-none cursor-pointer bg-white"
                        >
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-zinc-400">{formatShortDate(order.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelectedOrder(order)} className="p-1.5 rounded-lg hover:bg-amber-50 text-zinc-400 hover:text-amber-600 transition-colors cursor-pointer" title="View Details">
                          <Eye size={13} />
                        </button>
                        <button onClick={() => sendWhatsApp(order)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-zinc-400 hover:text-emerald-600 transition-colors cursor-pointer" title="WhatsApp">
                          <MessageCircle size={13} />
                        </button>
                        <button onClick={() => printKOT(order)} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer" title="Print KOT">
                          <Printer size={13} />
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

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white w-full max-w-md shadow-2xl overflow-y-auto flex flex-col">
            {/* Drawer Header */}
            <div className="sticky top-0 bg-white border-b border-zinc-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Order Details</p>
                <h3 className="font-bold text-zinc-900 text-lg">{selectedOrder.id}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1">
              {/* Status */}
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedOrder.status} />
                <p className="text-xs text-zinc-400">{formatDate(selectedOrder.created_at)}</p>
              </div>

              {/* Customer */}
              <div className="bg-zinc-50 rounded-xl p-4">
                <p className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider mb-2">Customer</p>
                <p className="font-semibold text-zinc-900">{selectedOrder.customer_name}</p>
                <p className="text-sm text-zinc-500">{selectedOrder.customer_phone}</p>
                {selectedOrder.customer_email && <p className="text-sm text-zinc-400">{selectedOrder.customer_email}</p>}
              </div>

              {/* Delivery/Pickup */}
              {selectedOrder.type === 'delivery' && selectedOrder.address && (
                <div className="bg-zinc-50 rounded-xl p-4">
                  <p className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider mb-2">Delivery Address</p>
                  <p className="font-semibold text-zinc-900">{selectedOrder.address.house}</p>
                  <p className="text-sm text-zinc-500">{selectedOrder.address.area}</p>
                  {selectedOrder.address.instructions && (
                    <p className="text-xs text-zinc-400 italic mt-1">{selectedOrder.address.instructions}</p>
                  )}
                </div>
              )}
              {selectedOrder.type === 'pickup' && selectedOrder.branch && (
                <div className="bg-zinc-50 rounded-xl p-4">
                  <p className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider mb-2">Pickup Branch</p>
                  <p className="font-semibold text-zinc-900">{selectedOrder.branch}</p>
                </div>
              )}

              {/* Payment */}
              <div className="bg-zinc-50 rounded-xl p-4">
                <p className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider mb-2">Payment</p>
                <p className="text-sm font-semibold text-zinc-700 capitalize">{selectedOrder.payment_method || 'Cash on Delivery / Pickup'}</p>
              </div>

              {/* Items */}
              <div>
                <p className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider mb-2">Order Items</p>
                {(selectedOrder.items || []).length === 0 ? (
                  <p className="text-sm text-zinc-400 italic">Item details not available</p>
                ) : (
                  <div className="space-y-2">
                    {(selectedOrder.items || []).map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                        <div>
                          <p className="text-sm font-semibold text-zinc-800">{item.quantity}× {item.product_name}</p>
                          {item.notes && <p className="text-xs text-zinc-400 italic">{item.notes}</p>}
                        </div>
                        <p className="text-sm font-bold text-zinc-900">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="bg-zinc-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm text-zinc-500">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(selectedOrder.delivery_fee)}</span>
                </div>
                {selectedOrder.tax > 0 && (
                  <div className="flex justify-between text-sm text-zinc-500">
                    <span>Tax</span>
                    <span>{formatCurrency(selectedOrder.tax)}</span>
                  </div>
                )}
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-zinc-900 pt-2 border-t border-zinc-200 text-base">
                  <span>Grand Total</span>
                  <span>{formatCurrency(selectedOrder.total_amount)}</span>
                </div>
              </div>

              {/* Status update buttons */}
              <div>
                <p className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider mb-2">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map((s: string) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selectedOrder.id, s)}
                      disabled={updatingId === selectedOrder.id}
                      className={`py-2 px-3 text-[10px] font-bold uppercase tracking-wide rounded-lg transition-all cursor-pointer ${
                        selectedOrder.status === s
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                      }`}
                    >
                      {updatingId === selectedOrder.id ? '...' : s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => sendWhatsApp(selectedOrder)}
                  className="flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <MessageCircle size={16} /> WhatsApp Customer
                </button>
                <button
                  onClick={() => printKOT(selectedOrder)}
                  className="flex items-center justify-center gap-2 py-3 border border-zinc-200 text-zinc-700 font-bold text-sm rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <Printer size={16} /> Print KOT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────
// SECTION: PRODUCTS
// ─────────────────────────────────────────────────────
const ProductsSection: React.FC<{
  onToast: (msg: string, type?: 'success' | 'error') => void;
}> = ({ onToast }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [p, c] = await Promise.all([API.getAllProductsRaw(), API.getCategories()]);
    setProducts(p);
    setCategories(c);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter(p => {
    if (catFilter !== 'All' && p.category !== catFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s);
    }
    return true;
  });

  const handleSave = async () => {
    if (!editProduct?.name || !editProduct?.category || editProduct?.price === undefined) {
      onToast('Please fill name, category, and price', 'error');
      return;
    }
    setSaving(true);
    try {
      let result;
      if (isCreating) {
        result = await API.createProduct(editProduct);
      } else {
        result = await API.updateProduct(editProduct.id!, editProduct);
      }
      if (result.success) {
        onToast(isCreating ? 'Product created!' : 'Product updated!');
        setEditProduct(null);
        setIsCreating(false);
        load();
      } else {
        onToast(result.error || 'Failed to save', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    const result = await API.deleteProduct(product.id);
    if (result.success) {
      onToast('Product deleted');
      load();
    } else {
      onToast(result.error || 'Failed to delete', 'error');
    }
    setConfirmDelete(null);
  };

  const handleToggle = async (product: Product) => {
    const newAvail = !product.available;
    await API.toggleProductAvailability(product.id, newAvail);
    onToast(`${product.name} ${newAvail ? 'enabled' : 'disabled'}`);
    load();
  };

  const startEdit = (p: Product) => {
    setIsCreating(false);
    setEditProduct({ ...p });
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditProduct({
      name: '', slug: '', category: categories[0]?.name || 'Cakes',
      description: '', price: 0, unit: 'Piece', image: '',
      featured: false, best_seller: false, new_arrival: false,
      available: true, status: 'active', stock_quantity: -1,
      minimum_order: 1, preparation_time: '', tags: [], gallery: [],
      quantityOptions: [],
    });
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs">
        <div className="p-4 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-zinc-900">Products</h2>
            <span className="text-xs font-semibold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">{products.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:border-amber-400 w-40"
              />
            </div>
            <select
              value={catFilter}
              onChange={e => setCatFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none bg-white text-zinc-700"
            >
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <button
              onClick={startCreate}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-lg transition-colors cursor-pointer"
            >
              <Plus size={14} /> Add Product
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-zinc-400">
            <RefreshCw size={20} className="animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState Icon={Package} title="No products found" description="Add your first product or adjust filters" action={
            <button onClick={startCreate} className="px-4 py-2 bg-amber-500 text-black font-bold text-sm rounded-lg cursor-pointer">
              Add Product
            </button>
          } />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50/80">
                <tr>
                  {['Product', 'Category', 'Price', 'Stock', 'Flags', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-zinc-100" onError={e => (e.currentTarget.style.display = 'none')} />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">
                            <Package size={14} className="text-zinc-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-zinc-900 text-xs">{p.name}</p>
                          <p className="text-zinc-400 text-[11px]">{p.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-600">{p.category}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-zinc-900">{formatCurrency(p.price)}</p>
                      {p.sale_price && <p className="text-[10px] text-emerald-600 line-through">{formatCurrency(p.sale_price)}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {p.stock_quantity === -1 ? (
                        <span className="text-zinc-400">Unlimited</span>
                      ) : p.stock_quantity === 0 ? (
                        <span className="text-red-500 font-bold">Out of Stock</span>
                      ) : (
                        <span className={`font-semibold ${p.stock_quantity <= 5 ? 'text-amber-600' : 'text-zinc-700'}`}>{p.stock_quantity}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.featured && <span className="text-[9px] font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">Featured</span>}
                        {p.best_seller && <span className="text-[9px] font-bold bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">Best Seller</span>}
                        {p.new_arrival && <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">New</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggle(p)} className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors cursor-pointer ${p.available ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                        {p.available ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                        {p.available ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(p)} className="p-1.5 rounded-lg hover:bg-amber-50 text-zinc-400 hover:text-amber-600 transition-colors cursor-pointer" title="Edit">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setConfirmDelete(p)} className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer" title="Delete">
                          <Trash2 size={13} />
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

      {/* Edit / Create Drawer */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => { setEditProduct(null); setIsCreating(false); }} />
          <div className="relative bg-white w-full max-w-lg shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-zinc-100 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-bold text-zinc-900">{isCreating ? 'Add Product' : 'Edit Product'}</h3>
              <button onClick={() => { setEditProduct(null); setIsCreating(false); }} className="p-2 rounded-full hover:bg-zinc-100 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Product Name *</label>
                <input
                  value={editProduct.name || ''}
                  onChange={e => setEditProduct((p: Partial<Product> | null) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 transition-colors"
                  placeholder="e.g. Black Forest Cake"
                />
              </div>

              {/* Category + Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Category *</label>
                  <select
                    value={editProduct.category || ''}
                    onChange={e => setEditProduct((p: Partial<Product> | null) => ({ ...p, category: e.target.value }))}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white"
                  >
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Unit *</label>
                  <select
                    value={editProduct.unit || 'Piece'}
                    onChange={e => setEditProduct((p: Partial<Product> | null) => ({ ...p, unit: e.target.value }))}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white"
                  >
                    {['Piece', 'Pound', 'Kg', 'Packet', 'Box', 'Dozen'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Price + Sale Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Price (Rs.) *</label>
                  <input
                    type="number"
                    value={editProduct.price ?? ''}
                    onChange={e => setEditProduct((p: Partial<Product> | null) => ({ ...p, price: Number(e.target.value) }))}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Sale Price (Rs.)</label>
                  <input
                    type="number"
                    value={editProduct.sale_price ?? ''}
                    onChange={e => setEditProduct((p: Partial<Product> | null) => ({ ...p, sale_price: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                    min={0}
                    placeholder="Optional"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  value={editProduct.description || ''}
                  onChange={e => setEditProduct((p: Partial<Product> | null) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 resize-none"
                  placeholder="Product description..."
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Image URL</label>
                <div className="flex gap-2">
                  <input
                    value={editProduct.image || ''}
                    onChange={e => setEditProduct((p: Partial<Product> | null) => ({ ...p, image: e.target.value }))}
                    className="flex-1 border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                    placeholder="/images/products/cakes/my-cake.png"
                  />
                  {editProduct.image && (
                    <img src={editProduct.image} alt="preview" className="w-12 h-12 rounded-lg object-cover border border-zinc-200" onError={e => (e.currentTarget.style.display = 'none')} />
                  )}
                </div>
              </div>

              {/* Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Stock Qty (-1 = unlimited)</label>
                  <input
                    type="number"
                    value={editProduct.stock_quantity ?? -1}
                    onChange={e => setEditProduct((p: Partial<Product> | null) => ({ ...p, stock_quantity: Number(e.target.value) }))}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                    min={-1}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Min Order</label>
                  <input
                    type="number"
                    value={editProduct.minimum_order ?? 1}
                    onChange={e => setEditProduct((p: Partial<Product> | null) => ({ ...p, minimum_order: Number(e.target.value) }))}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                    min={1}
                  />
                </div>
              </div>

              {/* Preparation time */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Preparation Time</label>
                <input
                  value={editProduct.preparation_time || ''}
                  onChange={e => setEditProduct((p: Partial<Product> | null) => ({ ...p, preparation_time: e.target.value }))}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                  placeholder="e.g. 30 mins"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Tags (comma separated)</label>
                <input
                  value={(editProduct.tags || []).join(', ')}
                  onChange={e => setEditProduct((p: Partial<Product> | null) => ({ ...p, tags: e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean) }))}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                  placeholder="Chocolate, Fresh, Popular"
                />
              </div>

              {/* Flags */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Product Flags</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'featured', label: '⭐ Featured' },
                    { key: 'best_seller', label: '🔥 Best Seller' },
                    { key: 'new_arrival', label: '✨ New Arrival' },
                    { key: 'available', label: '✅ Available' },
                  ].map(flag => (
                    <label key={flag.key} className="flex items-center gap-2 p-2.5 border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={Boolean((editProduct as any)[flag.key])}
                        onChange={e => setEditProduct((p: Partial<Product> | null) => ({ ...p, [flag.key]: e.target.checked }))}
                        className="accent-amber-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-zinc-700">{flag.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-zinc-100 px-6 py-4 flex gap-3">
              <button onClick={() => { setEditProduct(null); setIsCreating(false); }} className="flex-1 py-2.5 border border-zinc-200 rounded-xl font-semibold text-zinc-600 hover:bg-zinc-50 text-sm transition-colors cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save size={14} />
                {saving ? 'Saving...' : isCreating ? 'Create Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Product?"
          message={`"${confirmDelete.name}" will be permanently deleted. This cannot be undone.`}
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────
// SECTION: CATEGORIES
// ─────────────────────────────────────────────────────
const CategoriesSection: React.FC<{ onToast: (msg: string, type?: 'success' | 'error') => void }> = ({ onToast }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCat, setEditCat] = useState<Partial<Category> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => { setLoading(true); setCategories(await API.getCategories()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!editCat?.name) { onToast('Category name is required', 'error'); return; }
    setSaving(true);
    let result;
    if (isCreating) {
      result = await API.createCategory(editCat.name, editCat.display_order);
    } else {
      result = await API.updateCategory(editCat.id!, { name: editCat.name, display_order: editCat.display_order });
    }
    if (result.success) { onToast(isCreating ? 'Category created!' : 'Category updated!'); setEditCat(null); setIsCreating(false); load(); }
    else onToast(result.error || 'Failed', 'error');
    setSaving(false);
  };

  const handleDelete = async (cat: Category) => {
    const result = await API.deleteCategory(cat.id);
    if (result.success) { onToast('Category deleted'); load(); }
    else onToast(result.error || 'Failed to delete', 'error');
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-zinc-900">Categories</h2>
            <span className="text-xs font-semibold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">{categories.length}</span>
          </div>
          <button onClick={() => { setIsCreating(true); setEditCat({ name: '', display_order: categories.length + 1 }); }} className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-lg transition-colors cursor-pointer">
            <Plus size={14} /> Add Category
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-zinc-400"><RefreshCw size={18} className="animate-spin mx-auto mb-2" /><p className="text-sm">Loading...</p></div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Tag size={14} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 text-sm">{cat.name}</p>
                    <p className="text-xs text-zinc-400">Order: {cat.display_order}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setIsCreating(false); setEditCat({ ...cat }); }} className="p-1.5 rounded-lg hover:bg-amber-50 text-zinc-400 hover:text-amber-600 transition-colors cursor-pointer">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => setConfirmDelete(cat)} className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Drawer */}
      {editCat && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => { setEditCat(null); setIsCreating(false); }} />
          <div className="relative bg-white w-full max-w-sm shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-zinc-900">{isCreating ? 'Add Category' : 'Edit Category'}</h3>
              <button onClick={() => { setEditCat(null); setIsCreating(false); }} className="p-2 rounded-full hover:bg-zinc-100 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Name *</label>
                <input value={editCat.name || ''} onChange={e => setEditCat((c: Partial<Category> | null) => ({ ...c, name: e.target.value }))} className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400" placeholder="e.g. Cakes" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Display Order</label>
                <input type="number" value={editCat.display_order ?? 0} onChange={e => setEditCat((c: Partial<Category> | null) => ({ ...c, display_order: Number(e.target.value) }))} className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400" min={0} />
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-zinc-100 px-6 py-4 flex gap-3">
              <button onClick={() => { setEditCat(null); setIsCreating(false); }} className="flex-1 py-2.5 border border-zinc-200 rounded-xl font-semibold text-zinc-600 hover:bg-zinc-50 text-sm transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-colors disabled:opacity-50 cursor-pointer">
                {saving ? 'Saving...' : isCreating ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete Category?"
          message={`"${confirmDelete.name}" will be deleted. Products in this category won't be affected.`}
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────
// SECTION: INVENTORY
// ─────────────────────────────────────────────────────
const InventorySection: React.FC<{ onToast: (msg: string, type?: 'success' | 'error') => void }> = ({ onToast }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [adjustTarget, setAdjustTarget] = useState<Product | null>(null);
  const [adjType, setAdjType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [adjQty, setAdjQty] = useState(0);
  const [adjReason, setAdjReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'stock' | 'movements'>('stock');
  const LOW_STOCK_THRESHOLD = 5;

  const load = async () => {
    setLoading(true);
    const [p, m] = await Promise.all([API.getAllProductsRaw(), API.getInventoryMovements()]);
    setProducts(p);
    setMovements(m);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdjust = async () => {
    if (!adjustTarget || adjQty < 0) { onToast('Enter a valid quantity', 'error'); return; }
    setSaving(true);
    const result = await API.adjustStock(
      adjustTarget.id,
      adjustTarget.name,
      adjType,
      adjQty,
      adjReason || 'Manual adjustment',
      adjustTarget.stock_quantity === -1 ? 0 : adjustTarget.stock_quantity
    );
    if (result.success) {
      onToast('Stock adjusted!');
      setAdjustTarget(null);
      setAdjQty(0);
      setAdjReason('');
      load();
    } else {
      onToast(result.error || 'Failed', 'error');
    }
    setSaving(false);
  };

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));
  const lowStock = products.filter(p => p.stock_quantity >= 0 && p.stock_quantity <= LOW_STOCK_THRESHOLD);
  const outOfStock = products.filter(p => p.stock_quantity === 0);

  return (
    <div className="space-y-4">
      {/* Alert banners */}
      {outOfStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700 text-sm">Out of Stock Alert</p>
            <p className="text-xs text-red-600 mt-0.5">{outOfStock.map(p => p.name).join(', ')}</p>
          </div>
        </div>
      )}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-700 text-sm">Low Stock Warning (≤{LOW_STOCK_THRESHOLD} units)</p>
            <p className="text-xs text-amber-600 mt-0.5">{lowStock.map(p => `${p.name} (${p.stock_quantity})`).join(', ')}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 rounded-xl p-1 w-fit">
        {(['stock', 'movements'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all capitalize cursor-pointer ${activeTab === tab ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-700'}`}>
            {tab === 'stock' ? 'Current Stock' : 'Movement History'}
          </button>
        ))}
      </div>

      {activeTab === 'stock' && (
        <div className="bg-white border border-zinc-200 rounded-xl shadow-xs">
          <div className="p-4 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold text-zinc-900">Inventory</h2>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 pr-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:border-amber-400 w-44" />
            </div>
          </div>
          {loading ? (
            <div className="py-12 text-center text-zinc-400"><RefreshCw size={18} className="animate-spin mx-auto mb-2" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50/80">
                  <tr>
                    {['Product', 'Category', 'Stock Level', 'Status', 'Action'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {filtered.map(p => (
                    <tr key={p.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-xs text-zinc-900">{p.name}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{p.category}</td>
                      <td className="px-4 py-3">
                        {p.stock_quantity === -1 ? (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 bg-emerald-200 rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} /></div>
                            <span className="text-xs text-zinc-400">∞ Unlimited</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 bg-zinc-200 rounded-full">
                              <div
                                className={`h-full rounded-full transition-all ${p.stock_quantity === 0 ? 'bg-red-500' : p.stock_quantity <= LOW_STOCK_THRESHOLD ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(100, (p.stock_quantity / 50) * 100)}%` }}
                              />
                            </div>
                            <span className={`text-xs font-bold ${p.stock_quantity === 0 ? 'text-red-500' : p.stock_quantity <= LOW_STOCK_THRESHOLD ? 'text-amber-600' : 'text-zinc-700'}`}>{p.stock_quantity}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {p.stock_quantity === 0 ? (
                          <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full">Out of Stock</span>
                        ) : p.stock_quantity > 0 && p.stock_quantity <= LOW_STOCK_THRESHOLD ? (
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">Low Stock</span>
                        ) : (
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
                            {p.stock_quantity === -1 ? 'Unlimited' : 'In Stock'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { setAdjustTarget(p); setAdjType('in'); setAdjQty(0); setAdjReason(''); }}
                          className="text-xs font-semibold px-2.5 py-1.5 border border-zinc-200 rounded-lg hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-colors cursor-pointer"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'movements' && (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-zinc-100">
            <h2 className="font-bold text-zinc-900">Stock Movement History</h2>
          </div>
          {movements.length === 0 ? (
            <EmptyState Icon={Warehouse} title="No movements yet" description="Stock adjustments will appear here" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50/80">
                  <tr>
                    {['Product', 'Type', 'Qty', 'Before → After', 'Reason', 'Date'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {movements.map(m => (
                    <tr key={m.id} className="hover:bg-zinc-50/60">
                      <td className="px-4 py-3 text-xs font-semibold text-zinc-900">{m.product_name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.type === 'in' ? 'bg-emerald-50 text-emerald-700' : m.type === 'out' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                          {m.type === 'in' ? '+ IN' : m.type === 'out' ? '- OUT' : '⇌ ADJ'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-zinc-900">{m.quantity}</td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{m.previous_stock} → {m.new_stock}</td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{m.reason || '—'}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{formatShortDate(m.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Adjust Stock Drawer */}
      {adjustTarget && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setAdjustTarget(null)} />
          <div className="relative bg-white w-full max-w-sm shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-zinc-900">Adjust Stock</h3>
              <button onClick={() => setAdjustTarget(null)} className="p-2 rounded-full hover:bg-zinc-100 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-zinc-50 rounded-xl p-4">
                <p className="text-xs text-zinc-400 mb-1">Product</p>
                <p className="font-bold text-zinc-900">{adjustTarget.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Current stock: <span className="font-bold">{adjustTarget.stock_quantity === -1 ? '∞' : adjustTarget.stock_quantity}</span></p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Adjustment Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'in', label: '+ Stock In', color: '#10b981' },
                    { value: 'out', label: '- Stock Out', color: '#ef4444' },
                    { value: 'adjustment', label: '⇌ Set To', color: '#3b82f6' }
                  ].map(t => (
                    <button
                      key={t.value}
                      onClick={() => setAdjType(t.value as any)}
                      className="py-2 px-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                      style={adjType === t.value ? { background: t.color, color: '#ffffff' } : { background: '#f4f4f5', color: '#71717a' }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                  {adjType === 'adjustment' ? 'Set Stock To' : 'Quantity'}
                </label>
                <input
                  type="number"
                  value={adjQty}
                  onChange={e => setAdjQty(Number(e.target.value))}
                  min={0}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Reason</label>
                <input
                  value={adjReason}
                  onChange={e => setAdjReason(e.target.value)}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                  placeholder="e.g. New stock received, Damaged goods..."
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-zinc-100 px-6 py-4 flex gap-3">
              <button onClick={() => setAdjustTarget(null)} className="flex-1 py-2.5 border border-zinc-200 rounded-xl font-semibold text-zinc-600 hover:bg-zinc-50 text-sm cursor-pointer">Cancel</button>
              <button onClick={handleAdjust} disabled={saving} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm disabled:opacity-50 cursor-pointer">
                {saving ? 'Saving...' : 'Apply Adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────
// SECTION: CUSTOMERS
// ─────────────────────────────────────────────────────
const CustomersSection: React.FC<{ onToast: (msg: string, type?: 'success' | 'error') => void }> = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);

  const load = async () => { setLoading(true); setCustomers(await API.getCustomers({ limit: 200 })); setLoading(false); };
  useEffect(() => { load(); }, []);

  const viewCustomer = async (c: any) => {
    setSelected(c);
    const orders = await API.getCustomerOrders(c.id);
    setCustomerOrders(orders);
  };

  const filtered = customers.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search));

  return (
    <div className="space-y-4">
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs">
        <div className="p-4 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-zinc-900">Customers</h2>
            <span className="text-xs font-semibold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">{customers.length}</span>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 pr-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:border-amber-400 w-48" />
          </div>
        </div>
        {loading ? (
          <div className="py-12 text-center text-zinc-400"><RefreshCw size={18} className="animate-spin mx-auto mb-2" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState Icon={Users} title="No customers yet" description="Customer data appears here after orders are placed" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50/80">
                <tr>{['Name', 'Phone', 'WhatsApp', 'Email', 'Joined', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">{(c.name || '?')[0].toUpperCase()}</div>
                        <span className="font-semibold text-zinc-900 text-xs">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-600">{c.phone}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{c.whatsapp || '—'}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{c.email || '—'}</td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{formatShortDate(c.created_at)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => viewCustomer(c)} className="p-1.5 rounded-lg hover:bg-amber-50 text-zinc-400 hover:text-amber-600 transition-colors cursor-pointer" title="View Orders">
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSelected(null)} />
          <div className="relative bg-white w-full max-w-md shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-zinc-100 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-bold text-zinc-900">Customer Profile</h3>
              <button onClick={() => setSelected(null)} className="p-2 rounded-full hover:bg-zinc-100 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-xl font-bold text-amber-700">
                  {(selected.name || '?')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-zinc-900 text-lg">{selected.name}</p>
                  <p className="text-sm text-zinc-500">{selected.phone}</p>
                  {selected.email && <p className="text-xs text-zinc-400">{selected.email}</p>}
                </div>
              </div>

              <div className="flex gap-2">
                <a href={`tel:${selected.phone}`} className="flex-1 py-2 border border-zinc-200 rounded-xl text-center text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors">
                  📞 Call
                </a>
                <a
                  href={`https://wa.me/92${(selected.whatsapp || selected.phone).replace(/^0/, '').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-[#25D366] text-white rounded-xl text-center text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  💬 WhatsApp
                </a>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-3">Order History ({customerOrders.length})</p>
                {customerOrders.length === 0 ? (
                  <p className="text-sm text-zinc-400 text-center py-4">No orders found</p>
                ) : (
                  <div className="space-y-2">
                    {customerOrders.map(o => (
                      <div key={o.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                        <div>
                          <p className="font-bold text-zinc-900 text-xs">{o.id}</p>
                          <p className="text-[11px] text-zinc-400">{formatShortDate(o.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold">{formatCurrency(o.total_amount)}</p>
                          <StatusBadge status={o.status} size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────
// SECTION: COUPONS
// ─────────────────────────────────────────────────────
const CouponsSection: React.FC<{ onToast: (msg: string, type?: 'success' | 'error') => void }> = ({ onToast }) => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);
  const [form, setForm] = useState({ code: '', discount_type: 'percentage', discount_value: 10, min_order_value: 0, expiry_date: '', active: true });
  const [saving, setSaving] = useState(false);

  const load = async () => { setLoading(true); setCoupons(await API.getCoupons()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.code) { onToast('Coupon code required', 'error'); return; }
    setSaving(true);
    const result = await API.createCoupon({ ...form, discount_type: form.discount_type as 'percentage' | 'fixed' });
    if (result.success) { onToast('Coupon created!'); setShowForm(false); setForm({ code: '', discount_type: 'percentage', discount_value: 10, min_order_value: 0, expiry_date: '', active: true }); load(); }
    else onToast(result.error || 'Failed', 'error');
    setSaving(false);
  };

  const handleDelete = async (c: any) => {
    const result = await API.deleteCoupon(c.id);
    if (result.success) { onToast('Coupon deleted'); load(); }
    else onToast(result.error || 'Failed to delete', 'error');
    setConfirmDelete(null);
  };

  const toggleActive = async (c: any) => {
    await API.updateCoupon(c.id, { active: !c.active });
    onToast(`Coupon ${c.active ? 'deactivated' : 'activated'}`);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-zinc-900">Discounts & Coupons</h2>
            <span className="text-xs font-semibold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">{coupons.length}</span>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-lg transition-colors cursor-pointer">
            <Plus size={14} /> Add Coupon
          </button>
        </div>
        {loading ? (
          <div className="py-12 text-center text-zinc-400"><RefreshCw size={18} className="animate-spin mx-auto mb-2" /></div>
        ) : coupons.length === 0 ? (
          <EmptyState Icon={Ticket} title="No coupons yet" description="Create your first discount coupon" action={<button onClick={() => setShowForm(true)} className="px-4 py-2 bg-amber-500 text-black font-bold text-sm rounded-lg cursor-pointer">Add Coupon</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50/80">
                <tr>{['Code', 'Type', 'Value', 'Min Order', 'Expiry', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {coupons.map(c => (
                  <tr key={c.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-4 py-3 font-bold text-zinc-900 text-xs font-mono">{c.code}</td>
                    <td className="px-4 py-3 text-xs text-zinc-600 capitalize">{c.discount_type}</td>
                    <td className="px-4 py-3 text-xs font-bold text-zinc-900">
                      {c.discount_type === 'percentage' ? `${c.discount_value}%` : formatCurrency(c.discount_value)}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{c.min_order_value > 0 ? formatCurrency(c.min_order_value) : '—'}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {c.expiry_date ? formatShortDate(c.expiry_date) : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(c)} className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${c.active ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-500'}`}>
                        {c.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setConfirmDelete(c)} className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Form Drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowForm(false)} />
          <div className="relative bg-white w-full max-w-sm shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-zinc-900">Create Coupon</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-full hover:bg-zinc-100 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Code *</label>
                <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 font-mono" placeholder="e.g. SAVE20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Type</label>
                  <select value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value }))} className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (Rs.)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Value</label>
                  <input type="number" value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: Number(e.target.value) }))} className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400" min={0} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Min Order (Rs.)</label>
                  <input type="number" value={form.min_order_value} onChange={e => setForm(f => ({ ...f, min_order_value: Number(e.target.value) }))} className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400" min={0} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Expiry Date</label>
                  <input type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400" />
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-zinc-100 px-6 py-4 flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-zinc-200 rounded-xl font-semibold text-zinc-600 text-sm hover:bg-zinc-50 cursor-pointer">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm disabled:opacity-50 cursor-pointer">{saving ? 'Creating...' : 'Create Coupon'}</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete Coupon?"
          message={`Coupon "${confirmDelete.code}" will be permanently deleted.`}
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────
// SECTION: ANALYTICS
// ─────────────────────────────────────────────────────
const AnalyticsSection: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const totalRevenue = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.total_amount, 0);
  const avgOrderValue = orders.length > 0 ? orders.reduce((s, o) => s + o.total_amount, 0) / orders.length : 0;
  const deliveryOrders = orders.filter(o => o.type === 'delivery').length;
  const pickupOrders = orders.filter(o => o.type === 'pickup').length;
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;
  const cancelRate = orders.length > 0 ? ((cancelledOrders / orders.length) * 100).toFixed(1) : '0';

  const statusCounts = STATUS_OPTIONS.reduce((acc: Record<string, number>, s: string) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} Icon={TrendingUp} color="#10b981" sub="Delivered orders" />
        <StatCard label="Avg Order Value" value={formatCurrency(Math.round(avgOrderValue))} Icon={BarChart2} color="#6366f1" sub={`${orders.length} orders total`} />
        <StatCard label="Delivery vs Pickup" value={`${deliveryOrders}/${pickupOrders}`} Icon={Truck} color="#f59e0b" sub="Delivery/Pickup split" />
        <StatCard label="Cancellation Rate" value={`${cancelRate}%`} Icon={XCircle} color="#ef4444" sub={`${cancelledOrders} cancelled`} />
      </div>

      {/* Status breakdown */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
        <h3 className="font-bold text-zinc-900 mb-4">Order Status Breakdown</h3>
        <div className="space-y-3">
          {STATUS_OPTIONS.map((s: string) => {
            const count = statusCounts[s] || 0;
            const pct = orders.length > 0 ? (count / orders.length) * 100 : 0;
            const style = STATUS_STYLES[s] || { bg: 'bg-zinc-100', text: 'text-zinc-600', dot: 'bg-zinc-400' };
            return (
              <div key={s} className="flex items-center gap-3">
                <span className={`text-[11px] font-bold w-32 shrink-0 ${style.text}`}>{s}</span>
                <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${style.dot}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-bold text-zinc-600 w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────
// SECTION: SETTINGS
// ─────────────────────────────────────────────────────
const SettingsSection: React.FC<{ onToast: (msg: string, type?: 'success' | 'error') => void }> = ({ onToast }) => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => { setLoading(true); setSettings(await API.getSettings()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const saveSetting = async (key: string, value: string) => {
    setSaving(key);
    const result = await API.updateSetting(key, value);
    if (result.success) onToast('Setting saved!');
    else onToast(result.error || 'Failed', 'error');
    setSaving(null);
  };

  const settingFields = [
    { key: 'announcement_text', label: 'Announcement Bar Text', type: 'text', placeholder: 'Free delivery on orders above Rs. 1500!' },
    { key: 'announcement_active', label: 'Show Announcement Bar', type: 'select', options: [{ value: 'true', label: 'Yes, show it' }, { value: 'false', label: 'Hide it' }] },
    { key: 'delivery_fee', label: 'Delivery Fee (Rs.)', type: 'number', placeholder: '150' },
    { key: 'tax_rate', label: 'Tax Rate (%)', type: 'number', placeholder: '0' },
    { key: 'whatsapp_number', label: 'WhatsApp Number (with country code)', type: 'text', placeholder: '923297040402' },
    { key: 'business_phone', label: 'Business Phone', type: 'text', placeholder: '03297040402' },
    { key: 'business_name', label: 'Business Name', type: 'text', placeholder: 'M.A Bakers' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">Settings are stored in the database and some may require a page refresh to take effect on the storefront.</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs">
        <div className="p-5 border-b border-zinc-100">
          <h2 className="font-bold text-zinc-900">Website Settings</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Control website-wide content and configuration</p>
        </div>
        {loading ? (
          <div className="py-12 text-center text-zinc-400"><RefreshCw size={18} className="animate-spin mx-auto mb-2" /></div>
        ) : (
          <div className="p-5 space-y-5">
            {settingFields.map(field => (
              <div key={field.key} className="flex items-center gap-4 pb-5 border-b border-zinc-50 last:border-0 last:pb-0">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      value={settings[field.key] || ''}
                      onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
                      className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none bg-white focus:border-amber-400"
                    >
                      {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={settings[field.key] || ''}
                      onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 transition-colors"
                    />
                  )}
                </div>
                <button
                  onClick={() => saveSetting(field.key, settings[field.key] || '')}
                  disabled={saving === field.key}
                  className="px-4 py-2.5 bg-zinc-900 text-white font-bold text-sm rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {saving === field.key ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Info */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
        <h3 className="font-bold text-zinc-900 mb-3">Admin Access Info</h3>
        <div className="bg-zinc-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Admin Password</span>
            <span className="font-mono text-xs bg-zinc-200 px-2 py-0.5 rounded">Set in .env.local → VITE_ADMIN_PASSWORD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Session Type</span>
            <span className="text-zinc-700 font-semibold">Session-only (clears on browser close)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Database</span>
            <span className="text-zinc-700 font-semibold">Supabase (PostgreSQL)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Realtime</span>
            <span className="text-emerald-600 font-semibold">✅ Enabled (orders, products)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────
// MAIN ADMIN PANEL
// ─────────────────────────────────────────────────────
interface AdminPanelProps {
  onBackToStore: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToStore }) => {
  const { logout } = useAdminAuth();
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalOrders: 0, todayOrders: 0, pendingOrders: 0, totalRevenue: 0, todayRevenue: 0, totalCustomers: 0 });
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const channelRef = useRef<any>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersData, statsData] = await Promise.all([API.getOrders(), API.getDashboardStats()]);
      setOrders(ordersData);
      setStats(statsData);
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => { loadOrders(); }, [loadOrders]);

  // Supabase Realtime subscription
  useEffect(() => {
    channelRef.current = API.subscribeToOrders((newOrder: any) => {
      // Only alert on INSERT (new orders)
      if (newOrder.order_number) {
        setNewOrderIds(prev => new Set([...prev, newOrder.order_number]));
        setNewOrderCount(n => n + 1);
        showToast(`🔔 New Order: ${newOrder.order_number}!`, 'info');

        // Play notification sound if possible
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 880;
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.5);
        } catch { /* audio not available */ }

        // Reload orders after 1s
        setTimeout(() => loadOrders(), 1000);
      }
    });

    return () => {
      if (channelRef.current) API.unsubscribeFromOrders(channelRef.current);
    };
  }, [loadOrders, showToast]);

  const handleLogout = () => {
    logout();
    onBackToStore();
  };

  const pendingCount = orders.filter(o => o.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-14'} shrink-0 bg-white border-r border-zinc-200 flex flex-col transition-all duration-200 fixed top-0 left-0 h-full z-30`}>
        {/* Brand */}
        <div className={`h-14 border-b border-zinc-100 flex items-center px-4 gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
            <span className="text-black font-black text-xs">MA</span>
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="font-bold text-zinc-900 text-sm leading-none truncate">M.A Bakers</p>
              <p className="text-[10px] text-zinc-400 leading-none mt-0.5">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const isActive = activeSection === id;
            const badge = id === 'orders' && (pendingCount > 0 || newOrderCount > 0) ? pendingCount + newOrderCount : 0;
            return (
              <button
                key={id}
                onClick={() => { setActiveSection(id); if (id === 'orders') setNewOrderCount(0); }}
                title={!sidebarOpen ? label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-amber-50 text-amber-700 font-bold'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 font-semibold'
                } ${sidebarOpen ? 'mr-3' : 'justify-center mx-0 rounded-none'}`}
                style={{ width: sidebarOpen ? 'calc(100% - 8px)' : '100%' }}
              >
                <div className="relative shrink-0">
                  <Icon size={17} />
                  {badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                {sidebarOpen && (
                  <span className="text-xs truncate">{label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className={`border-t border-zinc-100 p-3 space-y-1 ${!sidebarOpen ? 'flex flex-col items-center' : ''}`}>
          <button
            onClick={() => { onBackToStore(); }}
            title={!sidebarOpen ? 'Back to Store' : undefined}
            className={`flex items-center gap-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 rounded-xl px-2 py-2 transition-colors w-full text-xs font-semibold cursor-pointer ${!sidebarOpen ? 'justify-center' : ''}`}
          >
            <ChevronRight size={14} className="rotate-180" />
            {sidebarOpen && 'Back to Store'}
          </button>
          <button
            onClick={handleLogout}
            title={!sidebarOpen ? 'Logout' : undefined}
            className={`flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl px-2 py-2 transition-colors w-full text-xs font-semibold cursor-pointer ${!sidebarOpen ? 'justify-center' : ''}`}
          >
            <LogOut size={14} />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className={`flex-1 flex flex-col min-w-0 ${sidebarOpen ? 'ml-56' : 'ml-14'} transition-all duration-200`}>
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-zinc-200 flex items-center justify-between px-5 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(v => !v)} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors cursor-pointer" title="Toggle sidebar">
              <Filter size={16} />
            </button>
            <h1 className="font-bold text-zinc-900 capitalize text-sm">
              {NAV_ITEMS.find(n => n.id === activeSection)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* New order bell */}
            {newOrderCount > 0 && (
              <button
                onClick={() => { setActiveSection('orders'); setNewOrderCount(0); }}
                className="relative p-2 rounded-lg bg-amber-50 text-amber-600 animate-pulse cursor-pointer"
              >
                <Bell size={16} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {newOrderCount}
                </span>
              </button>
            )}

            <button
              onClick={loadOrders}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-black font-black text-xs">A</div>
              {sidebarOpen && <span className="text-xs font-semibold text-zinc-600">Admin</span>}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 overflow-auto">
          {activeSection === 'dashboard' && <DashboardSection orders={orders} stats={stats} />}
          {activeSection === 'orders' && (
            <OrdersSection
              orders={orders}
              loading={loading}
              onRefresh={loadOrders}
              newOrderIds={newOrderIds}
              onToast={showToast}
            />
          )}
          {activeSection === 'products' && <ProductsSection onToast={showToast} />}
          {activeSection === 'categories' && <CategoriesSection onToast={showToast} />}
          {activeSection === 'inventory' && <InventorySection onToast={showToast} />}
          {activeSection === 'customers' && <CustomersSection onToast={showToast} />}
          {activeSection === 'coupons' && <CouponsSection onToast={showToast} />}
          {activeSection === 'analytics' && <AnalyticsSection orders={orders} />}
          {activeSection === 'settings' && <SettingsSection onToast={showToast} />}
        </main>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};