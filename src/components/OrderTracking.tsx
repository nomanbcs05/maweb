import React, { useState } from 'react';
import { Search, ArrowLeft, Package, CheckCircle, Loader, Truck, Clock, XCircle, Check } from 'lucide-react';
import type { Order } from '../types';
import { API } from '../services/api';

interface OrderTrackingProps {
  onBackToStore: () => void;
}

const STATUS_STEPS = [
  { key: 'Pending', label: 'Order Received', icon: Package, description: 'We received your order and are confirming it.' },
  { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle, description: 'Order confirmed — our team is starting preparation.' },
  { key: 'Preparing', label: 'Preparing', icon: Clock, description: 'Your order is being freshly prepared in our kitchen.' },
  { key: 'Baking', label: 'Baking', icon: Loader, description: 'In the oven! Almost ready.' },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck, description: 'Your order is on its way to you.' },
  { key: 'Delivered', label: 'Delivered', icon: CheckCircle, description: 'Delivered! Enjoy your freshly baked goods.' },
];

const PICKUP_STEPS = [
  { key: 'Pending', label: 'Order Received', icon: Package, description: 'We received your order and are confirming it.' },
  { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle, description: 'Order confirmed — preparation started.' },
  { key: 'Preparing', label: 'Preparing', icon: Clock, description: 'Your order is being freshly prepared.' },
  { key: 'Baking', label: 'Baking', icon: Loader, description: 'In the oven! Almost ready.' },
  { key: 'Ready for Pickup', label: 'Ready for Pickup', icon: CheckCircle, description: 'Your order is ready — please collect from the branch.' },
  { key: 'Delivered', label: 'Collected', icon: CheckCircle, description: 'Thank you! Your order was collected.' },
];

export const OrderTracking: React.FC<OrderTrackingProps> = ({ onBackToStore }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [multipleOrders, setMultipleOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter an order number or phone number.');
      return;
    }
    setLoading(true);
    setError('');
    setSelectedOrder(null);
    setMultipleOrders([]);

    try {
      const trimmed = query.trim().toUpperCase();
      // Direct order ID lookup
      if (trimmed.startsWith('MAB-')) {
        const order = await API.getOrderById(trimmed);
        if (order) {
          setSelectedOrder(order);
        } else {
          setError(`No order found for ID "${trimmed}".`);
        }
      } else {
        // Phone number search — fetch all orders and filter by phone
        const allOrders = await API.getOrders();
        const cleaned = query.replace(/\D/g, '');
        const matched = allOrders.filter(o =>
          o.customer_phone.replace(/\D/g, '').includes(cleaned)
        );
        if (matched.length === 0) {
          setError('No orders found for this phone number.');
        } else if (matched.length === 1) {
          setSelectedOrder(matched[0]);
        } else {
          setMultipleOrders(matched.slice(0, 10));
        }
      }
    } catch (e) {
      setError('Failed to fetch order details. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (order: Order) => {
    const steps = order.type === 'pickup' ? PICKUP_STEPS : STATUS_STEPS;
    if (order.status === 'Cancelled') return -1;
    const idx = steps.findIndex(s => s.key === order.status);
    return idx === -1 ? 0 : idx;
  };

  const currentStepIdx = selectedOrder ? getStepIndex(selectedOrder) : -1;
  const steps = selectedOrder?.type === 'pickup' ? PICKUP_STEPS : STATUS_STEPS;
  const isCancelled = selectedOrder?.status === 'Cancelled';

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-stone-200/50 dark:border-zinc-800/60">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
          <button
            onClick={onBackToStore}
            className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-900 text-stone-500 cursor-pointer transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-family-fraunces text-xl font-bold">Track Your Order</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        {/* Search Panel */}
        <div className="bg-white dark:bg-zinc-900 border border-stone-200/50 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
          <h2 className="font-family-fraunces text-lg font-bold mb-2">Find Your Order</h2>
          <p className="text-xs text-stone-400 mb-5">Enter your order number (e.g. MAB-123456) or registered phone number.</p>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="MAB-XXXXXX or 03XXXXXXXXX"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 text-sm border border-stone-200 dark:border-zinc-800 rounded-xl bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-white outline-none focus:border-amber-600 dark:focus:border-amber-500 transition-colors"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-5 py-3 bg-stone-900 dark:bg-amber-600 hover:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-40 active:scale-95"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-xs font-semibold text-rose-500 flex items-center gap-1.5">
              <XCircle size={13} /> {error}
            </p>
          )}
        </div>

        {/* Multiple Orders List */}
        {multipleOrders.length > 0 && !selectedOrder && (
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-stone-500 uppercase tracking-wider">
              {multipleOrders.length} orders found — select one to track:
            </h3>
            {multipleOrders.map(o => (
              <button
                key={o.id}
                onClick={() => setSelectedOrder(o)}
                className="w-full bg-white dark:bg-zinc-900 border border-stone-200/50 dark:border-zinc-800/80 rounded-xl p-4 text-left hover:border-amber-600/60 dark:hover:border-amber-500/60 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-family-fraunces font-bold text-stone-900 dark:text-white">{o.id}</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {new Date(o.created_at || '').toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}Rs. {o.total_amount.toFixed(0)}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                    o.status === 'Cancelled' ? 'bg-rose-100 text-rose-600' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {o.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Order Timeline */}
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Card Header */}
            <div className="bg-white dark:bg-zinc-900 border border-stone-200/50 dark:border-zinc-800/80 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Order Number</p>
                  <p className="font-family-fraunces text-xl font-bold text-stone-900 dark:text-white">{selectedOrder.id}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${
                  selectedOrder.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                  selectedOrder.status === 'Cancelled' ? 'bg-rose-100 text-rose-600' :
                  selectedOrder.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {selectedOrder.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-stone-400 mb-0.5">Customer</p>
                  <p className="font-semibold text-stone-900 dark:text-white">{selectedOrder.customer_name}</p>
                  <p className="text-stone-500">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <p className="text-stone-400 mb-0.5">Order Type</p>
                  <p className="font-semibold text-stone-900 dark:text-white">
                    {selectedOrder.type === 'delivery' ? '🚚 Delivery' : '🏪 Store Pickup'}
                  </p>
                  <p className="text-stone-500">Rs. {selectedOrder.total_amount.toFixed(0)}</p>
                </div>
              </div>
            </div>

            {/* Cancelled State */}
            {isCancelled && (
              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-800/60 rounded-2xl p-6 text-center">
                <XCircle size={40} className="text-rose-400 mx-auto mb-3" />
                <h3 className="font-family-fraunces text-lg font-bold text-rose-700 dark:text-rose-400 mb-1">Order Cancelled</h3>
                <p className="text-xs text-rose-500">This order was cancelled. Contact us on WhatsApp for support.</p>
                <button
                  onClick={() => window.open('https://wa.me/923093660360', '_blank')}
                  className="mt-4 px-5 py-2.5 bg-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer hover:bg-rose-700 transition-colors"
                >
                  Contact Support
                </button>
              </div>
            )}

            {/* Progress Timeline */}
            {!isCancelled && (
              <div className="bg-white dark:bg-zinc-900 border border-stone-200/50 dark:border-zinc-800/80 rounded-2xl p-6">
                <h3 className="font-family-fraunces text-base font-bold text-stone-900 dark:text-white mb-6">Live Order Status</h3>

                <div className="relative pl-8">
                  {/* Vertical Line */}
                  <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-stone-100 dark:bg-zinc-800" />
                  
                  <div className="space-y-6">
                    {steps.map((s, idx) => {
                      const Icon = s.icon;
                      const isDone = idx <= currentStepIdx;
                      const isActive = idx === currentStepIdx;

                      return (
                        <div key={s.key} className="relative flex items-start gap-4">
                          {/* Circle Indicator */}
                          <div className={`absolute -left-8 w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            isActive ? 'bg-amber-600 border-amber-600 shadow-md shadow-amber-200' :
                            isDone ? 'bg-emerald-600 border-emerald-600' :
                            'bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-700'
                          }`}>
                            {isDone ? <Check size={12} className="text-white" strokeWidth={3} /> : <Icon size={11} className={isDone || isActive ? 'text-white' : 'text-stone-400'} />}
                          </div>

                          <div className={`flex-1 pb-2 ${!isDone ? 'opacity-40' : ''}`}>
                            <p className={`text-sm font-bold ${isActive ? 'text-amber-600 dark:text-amber-500' : isDone ? 'text-stone-900 dark:text-white' : 'text-stone-400'}`}>
                              {s.label}
                              {isActive && <span className="ml-2 text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Current</span>}
                            </p>
                            {isDone && (
                              <p className="text-xs text-stone-400 mt-0.5">{s.description}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Back search button */}
            <button
              onClick={() => { setSelectedOrder(null); setMultipleOrders([]); setQuery(''); }}
              className="flex items-center gap-2 text-sm text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} /> Search Another Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};