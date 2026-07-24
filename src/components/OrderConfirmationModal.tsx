import React from 'react';
import { Check, MessageCircle, FileText, Home } from 'lucide-react';
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

  const sendCustomerWhatsApp = () => {
    const msg = [
      `*Assalamu Alaikum ${order.customer_name}!* 🍰`,
      ``,
      `Thank you for ordering from *M.A Bakers*.`,
      ``,
      `Your order *#${order.id}* has been received and is being processed.`,
      ``,
      `💰 Total: Rs. ${order.total_amount.toFixed(0)}`,
      `🚚 Type: ${order.type === 'delivery' ? 'Delivery' : 'Store Pickup'}`,
      ``,
      `We'll notify you as soon as your order is ready!`,
      ``,
      `Track your order: https://mabakers.com/track?id=${order.id}`,
    ].join('\n');

    const customerPhone = order.customer_phone.replace(/\D/g, '');
    const waPhone = customerPhone.startsWith('0') ? `92${customerPhone.slice(1)}` : customerPhone;
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${waPhone}?text=${encoded}`, '_blank');
  };

  const printInvoice = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    const itemsHtml = (order.items || []).map(i =>
      `<tr>
        <td style="padding:8px 0; border-bottom:1px solid #f0ede8;">${i.product_name}</td>
        <td style="padding:8px 0; border-bottom:1px solid #f0ede8; text-align:center;">${i.quantity}</td>
        <td style="padding:8px 0; border-bottom:1px solid #f0ede8; text-align:right;">Rs. ${i.price.toFixed(0)}</td>
        <td style="padding:8px 0; border-bottom:1px solid #f0ede8; text-align:right;">Rs. ${(i.price * i.quantity).toFixed(0)}</td>
      </tr>`
    ).join('');

    win.document.write(`
      <!DOCTYPE html><html><head>
        <title>Invoice — ${order.id}</title>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Inter', sans-serif; color: #111; background: #fff; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { font-family: 'Fraunces', serif; font-size: 28px; }
          .gold { color: #C99A3E; }
          .row { display: flex; justify-content: space-between; margin-bottom: 6px; }
          .section { margin: 24px 0; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; padding-bottom: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #7A746B; }
          th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: center; }
          th:last-child { text-align: right; }
          .grand { font-size: 16px; font-weight: 700; }
          hr { border: none; border-top: 1px solid #e7e2d8; margin: 16px 0; }
          .badge { display: inline-block; padding: 4px 10px; background: #f0ede8; border-radius: 4px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        </style>
      </head><body>
        <div class="row">
          <div>
            <h1>M.A <span class="gold">BAKERS</span></h1>
            <p style="color:#7A746B; font-size:13px; margin-top:4px;">Premium Artisan Bakery Since 1998</p>
          </div>
          <div style="text-align:right;">
            <p style="font-size:12px; color:#7A746B;">Invoice Date</p>
            <b>${new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</b>
          </div>
        </div>
        <hr />
        <div class="row section" style="align-items:flex-start;">
          <div>
            <p style="font-size:11px; font-weight:700; text-transform:uppercase; color:#7A746B; margin-bottom:6px;">Bill To</p>
            <b>${order.customer_name}</b>
            <p style="font-size:13px; color:#555;">${order.customer_phone}</p>
            ${order.customer_email ? `<p style="font-size:13px; color:#555;">${order.customer_email}</p>` : ''}
            ${order.type === 'delivery' && order.address ? `<p style="font-size:13px; color:#555;">${order.address.house}, ${order.address.area}</p>` : ''}
          </div>
          <div style="text-align:right;">
            <p style="font-size:11px; font-weight:700; text-transform:uppercase; color:#7A746B; margin-bottom:6px;">Invoice No.</p>
            <b style="font-size:18px;">#${order.id}</b>
            <br /><span class="badge">${order.status}</span>
          </div>
        </div>
        <table>
          <thead><tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="text-align:right; margin-top:16px; space-y:8px;">
          <div class="row" style="justify-content:flex-end; gap:60px; font-size:13px; margin-bottom:4px;">
            <span>Subtotal</span>
            <span>Rs. ${(order.total_amount - order.tax - order.delivery_fee + order.discount).toFixed(0)}</span>
          </div>
          <div class="row" style="justify-content:flex-end; gap:60px; font-size:13px; margin-bottom:4px;">
            <span>GST Tax (0%)</span>
            <span>Rs. ${order.tax.toFixed(0)}</span>
          </div>
          <div class="row" style="justify-content:flex-end; gap:60px; font-size:13px; margin-bottom:4px;">
            <span>Delivery</span>
            <span>${order.delivery_fee === 0 ? 'Free' : 'Rs. ' + order.delivery_fee.toFixed(0)}</span>
          </div>
          ${order.discount > 0 ? `<div class="row" style="justify-content:flex-end; gap:60px; font-size:13px; margin-bottom:4px; color:#16a34a;">
            <span>Discount</span>
            <span>-Rs. ${order.discount.toFixed(0)}</span>
          </div>` : ''}
          <hr style="margin-left:auto; width:200px;" />
          <div class="row grand" style="justify-content:flex-end; gap:60px;">
            <span>Grand Total</span>
            <span>Rs. ${order.total_amount.toFixed(0)}</span>
          </div>
        </div>
        <hr style="margin-top:40px;" />
        <p style="font-size:11px; color:#aaa; text-align:center; margin-top:12px;">
          Thank you for choosing M.A Bakers. For queries contact us on WhatsApp: +92 309 3660360
        </p>
        <script>window.onload = () => window.print();</script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-950 border border-stone-200/50 dark:border-zinc-800/80 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
        {/* Success Header */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-white" strokeWidth={3} />
          </div>
          <h2 className="font-family-fraunces text-2xl font-bold text-white mb-1">Order Placed!</h2>
          <p className="text-emerald-100 text-sm">Your order is being prepared with love 🍰</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Order Number */}
          <div className="bg-stone-50 dark:bg-zinc-900 border border-stone-200/50 dark:border-zinc-800/80 rounded-xl p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Order Number</p>
            <p className="font-family-fraunces text-2xl font-bold text-stone-900 dark:text-white">{order.id}</p>
            <p className="text-xs text-stone-400 mt-1">
              {order.type === 'delivery' ? '🚚 Delivery (35-45 mins)' : '🏪 Ready for Pickup'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={sendOwnerWhatsApp}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95"
            >
              <MessageCircle size={18} />
              Notify Owner via WhatsApp
            </button>

            <button
              onClick={sendCustomerWhatsApp}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-stone-900 dark:bg-zinc-800 hover:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95"
            >
              <MessageCircle size={18} />
              Send Customer Confirmation
            </button>

            <button
              onClick={printInvoice}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 border border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-stone-300 hover:border-stone-400 font-bold text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95"
            >
              <FileText size={18} />
              Print / Download Invoice
            </button>

            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 font-semibold text-sm transition-colors cursor-pointer"
            >
              <Home size={14} />
              Back to Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};