import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus, FileText, Gift } from 'lucide-react';
import type { Product } from '../types';
import { API } from '../services/api';
import { GST_RATE, DELIVERY_FEE } from '../config/pricing';
import { AnimatePresence, motion } from 'framer-motion';

import type { QuantityOption } from '../types';

export interface CartItem {
  product: Product;
  quantity: number;
  notes: string;
  selectedOption?: QuantityOption;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (productId: string, delta: number, optionValue?: string) => void;
  onUpdateNotes: (productId: string, notes: string, optionValue?: string) => void;
  onRemove: (productId: string, optionValue?: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onUpdateNotes,
  onRemove,
  onProceedToCheckout,
}) => {
  const [couponCode, setCouponCode] = useState(localStorage.getItem('mab_coupon_code') || '');
  const [couponType, setCouponType] = useState<'percentage' | 'fixed'>(
    (localStorage.getItem('mab_coupon_type') as any) || 'percentage'
  );
  const [couponValue, setCouponValue] = useState(Number(localStorage.getItem('mab_coupon_value') || '0'));
  
  const [couponStatus, setCouponStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [couponMsg, setCouponMsg] = useState('');

  const subtotal = items.reduce((s, i) => s + (i.selectedOption?.price || i.product.price) * i.quantity, 0);
  const tax = subtotal * GST_RATE;

  let delivery = subtotal > 0 ? DELIVERY_FEE : 0;
  if (couponCode === 'FREEDEL') {
    delivery = 0;
  }

  let discountAmount = 0;
  if (couponValue > 0) {
    if (couponType === 'percentage') {
      discountAmount = subtotal * (couponValue / 100);
    } else {
      discountAmount = couponValue;
    }
  }

  const grandTotal = Math.max(0, subtotal + tax + delivery - discountAmount);

  // Restore coupon validation state on load
  useEffect(() => {
    if (couponCode && couponValue > 0) {
      setCouponStatus('success');
      setCouponMsg(`Promo applied! Saved ${couponType === 'percentage' ? couponValue + '%' : 'Rs. ' + couponValue}`);
    }
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      // Clear coupon
      setCouponValue(0);
      setCouponStatus('idle');
      setCouponMsg('');
      localStorage.removeItem('mab_coupon_code');
      localStorage.removeItem('mab_coupon_type');
      localStorage.removeItem('mab_coupon_value');
      return;
    }

    setCouponStatus('loading');
    try {
      const res = await API.validateCoupon(couponCode, subtotal);
      if (res.valid) {
        setCouponType(res.type);
        setCouponValue(res.value);
        setCouponStatus('success');
        setCouponMsg(`Promo applied! Saved ${res.type === 'percentage' ? res.value + '%' : 'Rs. ' + res.value}`);
        localStorage.setItem('mab_coupon_code', res.code);
        localStorage.setItem('mab_coupon_type', res.type);
        localStorage.setItem('mab_coupon_value', String(res.value));
      } else {
        setCouponStatus('error');
        setCouponMsg(res.message || 'Invalid code.');
        localStorage.removeItem('mab_coupon_code');
        localStorage.removeItem('mab_coupon_type');
        localStorage.removeItem('mab_coupon_value');
      }
    } catch (e) {
      setCouponStatus('error');
      setCouponMsg('Network validation error. Try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-xs cursor-pointer"
          />

          {/* Cart Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
            className="fixed top-0 right-0 bottom-0 z-50 bg-white dark:bg-zinc-950 border-l border-stone-200/50 dark:border-zinc-800/80 w-full sm:w-[420px] md:w-[480px] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-stone-100 dark:border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-family-fraunces text-2xl font-bold text-stone-900 dark:text-white">Your Cart</h3>
                <span className="bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 text-xs font-bold px-2 py-0.5 rounded-full">
                  {items.reduce((s, i) => s + i.quantity, 0)}
                </span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-900 text-stone-500 dark:text-stone-400 cursor-pointer transition-colors"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-stone-400 dark:text-stone-500 text-center space-y-4">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    <X size={48} className="opacity-40" />
                  </motion.div>
                  <p className="text-sm">Your cart is empty.<br />Select from our freshly baked products!</p>
                </div>
              ) : (
                items.map((item, index) => {
                  const itemPrice = item.selectedOption?.price || item.product.price;
                  const itTotal = itemPrice * item.quantity;
                  return (
                    <div 
                      key={`${item.product.id}-${item.selectedOption?.value || 'default'}-${index}`}
                      className="flex gap-4 pb-6 border-b border-stone-100 dark:border-zinc-800/60 last:border-b-0 last:pb-0"
                    >
                      {/* Product Image */}
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="w-20 h-20 object-contain rounded-xl bg-stone-50 border border-stone-200/40 dark:border-zinc-800/50 flex-shrink-0"
                        loading="lazy"
                      />
                      
                      {/* Details */}
                      <div className="flex-1 flex flex-col space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
                              {item.product.category}
                            </span>
                            <h4 className="font-family-fraunces text-base font-bold text-stone-900 dark:text-white line-clamp-1">
                              {item.product.name}
                            </h4>
                            {item.selectedOption && (
                              <span className="text-[10px] text-stone-500">
                                {item.selectedOption.label}
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={() => onRemove(item.product.id, item.selectedOption?.value)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-stone-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {/* Price & Stepper row */}
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-stone-900 dark:text-white">
                            Rs. {itemPrice.toFixed(0)}
                          </span>

                          <div className="flex items-center border border-stone-200 dark:border-zinc-800 rounded-lg bg-stone-50 dark:bg-zinc-900 p-0.5">
                            <button 
                              onClick={() => onUpdateQty(item.product.id, -1, item.selectedOption?.value)}
                              disabled={item.quantity <= 1}
                              className="w-6 h-6 rounded-md flex items-center justify-center text-stone-600 dark:text-stone-400 disabled:opacity-40 transition-colors cursor-pointer active:scale-95"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-stone-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => onUpdateQty(item.product.id, 1, item.selectedOption?.value)}
                              className="w-6 h-6 rounded-md flex items-center justify-center text-stone-600 dark:text-stone-400 transition-colors cursor-pointer active:scale-95"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Special Instructions */}
                        <div className="relative">
                          <FileText size={11} className="absolute left-2.5 top-2.5 text-stone-400" />
                          <input 
                            type="text"
                            placeholder="Special instructions..."
                            value={item.notes}
                            onChange={e => onUpdateNotes(item.product.id, e.target.value, item.selectedOption?.value)}
                            className="w-full pl-7 pr-3 py-1.5 text-[11px] border border-stone-100 dark:border-zinc-850 bg-stone-50/50 dark:bg-zinc-900/50 text-stone-800 dark:text-stone-300 rounded-lg outline-none focus:border-amber-600/50 dark:focus:border-amber-500/50 transition-colors"
                          />
                        </div>

                        {/* Item total price */}
                        <div className="text-right text-xs text-stone-400 dark:text-stone-500">
                          Total: <span className="font-bold text-stone-900 dark:text-white">Rs. {itTotal.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Cart Summary Panel */}
            {items.length > 0 && (
              <div className="p-6 border-t border-stone-100 dark:border-zinc-800/80 bg-stone-50/50 dark:bg-zinc-900/30 space-y-4">
                {/* Coupon input */}
                <div className="border-b border-stone-200/50 dark:border-zinc-800/60 pb-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Gift size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" />
                      <input 
                        type="text"
                        placeholder="PROMO CODE"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full pl-9 pr-3 py-2 text-xs font-bold border border-stone-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-stone-900 dark:text-white outline-none focus:border-amber-600 dark:focus:border-amber-500 transition-colors tracking-wider placeholder:font-normal placeholder:tracking-normal"
                      />
                    </div>
                    <button 
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-stone-900 dark:bg-zinc-800 hover:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      {couponStatus === 'loading' ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                  {couponMsg && (
                    <div className={`text-[11px] font-semibold mt-1.5 ${
                      couponStatus === 'success' ? 'text-emerald-600' : 'text-rose-500'
                    }`}>
                      {couponMsg}
                    </div>
                  )}
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-2 text-xs text-stone-500 dark:text-stone-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-stone-900 dark:text-white">Rs. {subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST Tax (0%)</span>
                    <span className="font-semibold text-stone-900 dark:text-white">Rs. {tax.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span className="font-semibold text-stone-900 dark:text-white">
                      {delivery === 0 ? 'Free' : `Rs. ${delivery.toFixed(0)}`}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-500 font-semibold">
                      <span>Discount</span>
                      <span>-Rs. {discountAmount.toFixed(0)}</span>
                    </div>
                  )}
                  
                  {/* Grand total */}
                  <div className="flex justify-between pt-3 border-t border-stone-200 dark:border-zinc-800 text-sm font-bold text-stone-900 dark:text-white">
                    <span>Grand Total</span>
                    <span>Rs. {grandTotal.toFixed(0)}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button 
                  onClick={onProceedToCheckout}
                  className="w-full py-4 bg-stone-900 dark:bg-amber-600 hover:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.99] mt-2"
                >
                  Proceed to Checkout
                  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none stroke-[2.5]">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};