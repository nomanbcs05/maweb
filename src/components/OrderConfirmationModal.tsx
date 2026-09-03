import React from 'react';
import { Check, MessageCircle, Home, ShoppingBag, Phone, MapPin } from 'lucide-react';
import type { Order } from '../types';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const formatItemsForWhatsApp = () => {
    if (!order.items || order.items.length === 0) return 'Items: (details unavailable)';
    return order.items.map(i => `  ${i.quantity}x ${i.product_name} — Rs. ${(i.price * i.quantity).toFixed(0)}`).join('\n');
  };

  const sendOwnerWhatsApp = () => {
    const msg = [
      `🍰 *New Order Received — M.A Bakers*`,
      ``,
      `🔢 Order #: *${order.id}*`,
      `👤 Customer: ${order.customer_name}`,
      `📞 Phone: ${order.customer_phone}`,
      ``,
      `📦 *Items:*`,
      formatItemsForWhatsApp(),
      ``,
      `💰 Grand Total: *Rs. ${order.total_amount.toFixed(0)}*`,
      `🚚 Type: ${order.type === 'delivery' ? 'Delivery' : 'Store Pickup'}`,
      order.type === 'delivery' && order.address ? `📍 Address: ${order.address.house}, ${order.address.area}` : '',
      `💳 Payment: ${order.payment_method || 'Cash on Delivery'}`,
    ].filter(Boolean).join('\n');

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/923093660360?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-zinc-950 border border-stone-200/50 dark:border-zinc-800">

        {/* Header */}
        <div className="bg-[#2f2626] relative px-5 pt-5 pb-4 text-center">
          {/* Gold ring check */}
          <div className="w-11 h-11 rounded-full border-2 border-[#D4AF37] bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-2.5">
            <Check size={20} className="text-[#D4AF37]" strokeWidth={3} />
          </div>
          <h2 className="text-lg font-bold text-white mb-0.5" style={{ fontFamily: 'Fraunces, serif' }}>
            Order Placed!
          </h2>
          <p className="text-stone-400 text-[11px]">
            Thank you, <span className="text-[#D4AF37] font-semibold">{order.customer_name}</span>! Your order is being prepared 🍰
          </p>
        </div>

        {/* Order Info */}
        <div className="p-4 space-y-3">
          {/* Order Number + Status */}
          <div className="flex items-center justify-between bg-stone-50 dark:bg-zinc-900 border border-stone-200/60 dark:border-zinc-800 rounded-xl px-3 py-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-0.5">Order Number</p>
              <p className="font-bold text-stone-900 dark:text-white text-base" style={{ fontFamily: 'Fraunces, serif' }}>
                {order.id}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              Confirmed
            </span>
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-stone-50 dark:bg-zinc-900 border border-stone-200/60 dark:border-zinc-800 rounded-xl p-2.5">
              <div className="flex items-center gap-1 mb-0.5">
                <MapPin size={10} className="text-[#D4AF37]" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Type</span>
              </div>
              <p className="text-[11px] font-bold text-stone-900 dark:text-white">
                {order.type === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
              </p>
              <p className="text-[10px] text-stone-400">
                {order.type === 'delivery' ? '35–45 mins' : 'Ready in 15 mins'}
              </p>
            </div>

            <div className="bg-stone-50 dark:bg-zinc-900 border border-stone-200/60 dark:border-zinc-800 rounded-xl p-2.5">
              <div className="flex items-center gap-1 mb-0.5">
                <ShoppingBag size={10} className="text-[#D4AF37]" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">Total</span>
              </div>
              <p className="text-[11px] font-bold text-stone-900 dark:text-white">
                Rs. {order.total_amount.toFixed(0)}
              </p>
              <p className="text-[10px] text-stone-400">
                {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method?.replace('_', ' ') || 'Cash on Delivery'}
              </p>
            </div>
          </div>

          {/* Items Summary */}
          {order.items && order.items.length > 0 && (
            <div className="bg-stone-50 dark:bg-zinc-900 border border-stone-200/60 dark:border-zinc-800 rounded-xl px-3 py-2 space-y-1 max-h-24 overflow-y-auto">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-600 dark:text-stone-300">
                    <span className="font-bold text-stone-900 dark:text-white">{item.quantity}×</span> {item.product_name}
                  </span>
                  <span className="font-semibold text-stone-900 dark:text-white">
                    Rs. {(item.price * item.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-2 pt-0.5">
            <button
              onClick={sendOwnerWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#25D366] hover:bg-[#1ebe5c] text-white font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-95 shadow-md"
            >
              <MessageCircle size={14} />
              Notify via WhatsApp
            </button>

            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-stone-400 hover:text-stone-700 dark:hover:text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              <Home size={12} />
              Back to Store
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-center text-[10px] text-stone-400 pt-1 border-t border-stone-100 dark:border-zinc-800">
            <Phone size={9} className="inline mr-1" />
            Need help? Call us: <a href="tel:+923093660360" className="text-[#D4AF37] font-semibold">+92 309 3660360</a>
          </p>
        </div>
      </div>
    </div>
  );
};