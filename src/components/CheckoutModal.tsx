import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, MapPin, Calendar, ChevronRight, Upload } from 'lucide-react';
import type { CartItem } from './CartDrawer';
import type { Order } from '../types';
import { API } from '../services/api';
import { GST_RATE, DELIVERY_FEE } from '../config/pricing';
import { branchesData, parseOrderLocation, getAreasForBranch } from '../config/branches';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderPlaced: (order: Order) => void;
}

type StepId = 'details' | 'method' | 'logistics' | 'schedule' | 'payment' | 'review';

const STEP_LABELS: Record<StepId, string> = {
  details: 'Details',
  method: 'Method',
  logistics: 'Logistics',
  schedule: 'Schedule',
  payment: 'Payment',
  review: 'Review',
};

const PAYMENT_ACCOUNTS: Record<string, string> = {
  bank_transfer: `<b>Bank Al Habib</b><br>Account Title: M.A Bakers<br>Account Number: 0123-4567890-01<br>IBAN: PK36BAHL0123456789001<br>Branch: DHA Phase 5, Karachi`,
  jazzcash: `<b>JazzCash Mobile Account</b><br>Account Title: M.A Bakers<br>Account Number: <b>0309-3660360</b><br>Send payment and upload screenshot below.`,
  easypaisa: `<b>EasyPaisa Mobile Account</b><br>Account Title: M.A Bakers<br>Account Number: <b>0300-1234567</b><br>Send payment and upload screenshot below.`
};

function getActiveSteps(deliveryType: 'delivery' | 'pickup', skipMethod: boolean): StepId[] {
  const steps: StepId[] = ['details'];
  if (!skipMethod) steps.push('method');
  if (deliveryType === 'delivery') steps.push('logistics');
  steps.push('schedule', 'payment', 'review');
  return steps;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderPlaced,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [skipMethodStep, setSkipMethodStep] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');

  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [city, setCity] = useState('Nawabshah');
  const [landmark, setLandmark] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');

  const [pickupBranch, setPickupBranch] = useState('');

  const [deliveryTimeType, setDeliveryTimeType] = useState<'asap' | 'scheduled'>('asap');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('12:00');

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer' | 'jazzcash' | 'easypaisa' | 'card'>('cod');
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableAreas = useMemo(
    () => getAreasForBranch(selectedBranchId),
    [selectedBranchId]
  );

  const activeSteps = useMemo(
    () => getActiveSteps(deliveryType, skipMethodStep),
    [deliveryType, skipMethodStep]
  );

  const currentStepId = activeSteps[currentStepIndex] ?? 'details';

  useEffect(() => {
    if (!isOpen) return;

    setCurrentStepIndex(0);
    setErrors({});

    const savedType = localStorage.getItem('order_type') as 'delivery' | 'pickup' | null;
    const savedLocation = localStorage.getItem('order_location') || '';

    if (savedType) {
      setDeliveryType(savedType);
      setSkipMethodStep(true);
    } else {
      setSkipMethodStep(false);
    }

    if (savedType === 'delivery' && savedLocation) {
      const parsed = parseOrderLocation(savedLocation);
      setSelectedBranchId(parsed.branchId);
      setArea(parsed.area);
      setCity('Nawabshah');
    } else if (savedType === 'pickup' && savedLocation) {
      setPickupBranch(savedLocation);
    }

    API.getSavedCustomer().then(c => {
      if (c) {
        setName(c.name || '');
        setPhone(c.phone || '');
        setEmail(c.email || '');
        setDeliveryPhone(c.phone || '');
      }
    });

    const today = new Date().toISOString().split('T')[0];
    setScheduledDate(today);
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const tax = subtotal * GST_RATE;

  let deliveryCharges = 0;
  if (deliveryType === 'delivery') {
    deliveryCharges = DELIVERY_FEE;
  }

  const couponCode = localStorage.getItem('mab_coupon_code') || '';
  const couponType = localStorage.getItem('mab_coupon_type') || '';
  const couponValue = Number(localStorage.getItem('mab_coupon_value') || '0');

  if (couponCode === 'FREEDEL') {
    deliveryCharges = 0;
  }

  let discountAmount = 0;
  if (couponValue > 0) {
    if (couponType === 'percentage') {
      discountAmount = subtotal * (couponValue / 100);
    } else {
      discountAmount = couponValue;
    }
  }

  const grandTotal = Math.max(0, subtotal + tax + deliveryCharges - discountAmount);

  const validatePakPhone = (num: string) => {
    const cleaned = num.replace(/\D/g, '');
    return cleaned.length === 11 && cleaned.startsWith('03');
  };

  const handleNext = () => {
    const nextErrors: Record<string, string> = {};

    if (currentStepId === 'details') {
      if (name.trim().length < 2) nextErrors.name = 'Full name is required (min 2 chars).';
      if (!validatePakPhone(phone)) nextErrors.phone = 'Valid Pakistani phone is required (e.g. 03001234567).';
      if (email && !/^[^@]+@[^@]+\.[^@]+$/.test(email)) nextErrors.email = 'Please enter a valid email address.';
    }

    if (currentStepId === 'logistics') {
      if (!address.trim()) nextErrors.address = 'House/Flat details are required.';
      if (!area.trim()) nextErrors.area = 'Area/Sector details are required.';
      if (!validatePakPhone(deliveryPhone)) nextErrors.deliveryPhone = 'Valid delivery phone is required (e.g. 03001234567).';
    }

    if (currentStepId === 'schedule' && deliveryTimeType === 'scheduled') {
      if (!scheduledDate) nextErrors.date = 'Date is required.';
      if (!scheduledTime) nextErrors.time = 'Time slot is required.';
    }

    if (currentStepId === 'payment') {
      const needsScreenshot = ['bank_transfer', 'jazzcash', 'easypaisa'].includes(paymentMethod);
      if (needsScreenshot && !screenshot) {
        nextErrors.screenshot = 'Please upload your receipt screenshot.';
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setCurrentStepIndex(i => Math.min(i + 1, activeSteps.length - 1));
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStepIndex(i => Math.max(i - 1, 0));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setScreenshot(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const formattedPhone = phone.replace(/\D/g, '');
    const formattedDeliveryPhone = deliveryPhone.replace(/\D/g, '');
    const orderData = {
      type: deliveryType,
      deliveryTimeType,
      payment: paymentMethod,
      customer: {
        name,
        phone: formattedPhone,
        whatsapp: formattedPhone,
        email
      },
      address: deliveryType === 'delivery' ? {
        house: address,
        street: '',
        area,
        city,
        landmark,
        mapLink: formattedDeliveryPhone
      } : undefined,
      pickup: deliveryType === 'pickup' ? {
        branch: pickupBranch
      } : undefined,
      scheduledDate,
      scheduledTime,
      totals: {
        subtotal,
        tax,
        delivery: deliveryCharges,
        discountAmount,
        total: grandTotal
      },
      couponCode: couponCode || null,
      paymentScreenshot: screenshot,
      items: cartItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        qty: item.quantity,
        price: item.product.price,
        notes: item.notes
      }))
    };

    try {
      const order = await API.saveOrder(orderData);
      onOrderPlaced(order);
    } catch (e) {
      alert('Failed to place order. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedBranchName = branchesData.find(b => b.id === selectedBranchId)?.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-zinc-950 border border-stone-200/50 dark:border-zinc-800/80 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">

        <div className="flex-1 p-6 md:p-8 flex flex-col overflow-y-auto min-h-0">

          <div className="flex justify-between items-center mb-6">
            <h2 className="font-family-fraunces text-2xl font-bold text-stone-900 dark:text-white">Checkout</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-900 text-stone-500 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
            {activeSteps.map((stepId, idx) => {
              const isActive = currentStepIndex === idx;
              const isDone = currentStepIndex > idx;

              return (
                <React.Fragment key={stepId}>
                  <div className={`flex items-center gap-1.5 text-xs font-semibold ${
                    isActive ? 'text-amber-600 dark:text-amber-500' : isDone ? 'text-emerald-600' : 'text-stone-400'
                  }`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border-2 font-bold ${
                      isActive ? 'border-amber-600 text-amber-600 bg-amber-50/50' : isDone ? 'border-emerald-600 text-white bg-emerald-600' : 'border-stone-300'
                    }`}>
                      {isDone ? <Check size={10} strokeWidth={3} /> : idx + 1}
                    </span>
                    <span className="hidden sm:inline">{STEP_LABELS[stepId]}</span>
                  </div>
                  {idx < activeSteps.length - 1 && (
                    <span className="h-0.5 w-4 bg-stone-200 dark:bg-zinc-800" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="flex-1 min-h-0">
            {currentStepId === 'details' && (
              <div className="space-y-4">
                <h3 className="font-family-fraunces text-lg font-bold text-stone-900 dark:text-white">Customer Information</h3>
                <p className="text-xs text-stone-400">Please provide contact details for updates and billing.</p>

                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Ahmed Ali"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className={`p-3 text-sm border rounded-xl bg-stone-50 dark:bg-zinc-900 outline-none text-stone-900 dark:text-white ${
                        errors.name ? 'border-rose-500' : 'border-stone-200 dark:border-zinc-800'
                      }`}
                    />
                    {errors.name && <span className="text-[10px] font-bold text-rose-500">{errors.name}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="e.g. 03001234567"
                      value={phone}
                      onChange={e => {
                        setPhone(e.target.value);
                        if (!deliveryPhone || deliveryPhone === phone) {
                          setDeliveryPhone(e.target.value);
                        }
                      }}
                      className={`p-3 text-sm border rounded-xl bg-stone-50 dark:bg-zinc-900 outline-none text-stone-900 dark:text-white ${
                        errors.phone ? 'border-rose-500' : 'border-stone-200 dark:border-zinc-800'
                      }`}
                    />
                    {errors.phone && <span className="text-[10px] font-bold text-rose-500">{errors.phone}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. ahmed@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className={`p-3 text-sm border rounded-xl bg-stone-50 dark:bg-zinc-900 outline-none text-stone-900 dark:text-white ${
                        errors.email ? 'border-rose-500' : 'border-stone-200 dark:border-zinc-800'
                      }`}
                    />
                    {errors.email && <span className="text-[10px] font-bold text-rose-500">{errors.email}</span>}
                  </div>
                </div>
              </div>
            )}

            {currentStepId === 'method' && (
              <div className="space-y-4">
                <h3 className="font-family-fraunces text-lg font-bold text-stone-900 dark:text-white">Delivery Method</h3>
                <p className="text-xs text-stone-400">Select how you want to receive your order.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setDeliveryType('delivery')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer flex flex-col gap-2 transition-all hover:scale-[1.01] ${
                      deliveryType === 'delivery' ? 'border-amber-600 bg-amber-50/50' : 'border-stone-200 dark:border-zinc-800'
                    }`}
                  >
                    <MapPin size={24} className="text-amber-600" />
                    <b className="text-stone-900 dark:text-white text-sm">🚚 Standard Delivery</b>
                    <span className="text-xs text-stone-400">Delivered directly to your doorstep.</span>
                  </div>

                  <div
                    onClick={() => setDeliveryType('pickup')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer flex flex-col gap-2 transition-all hover:scale-[1.01] ${
                      deliveryType === 'pickup' ? 'border-amber-600 bg-amber-50/50' : 'border-stone-200 dark:border-zinc-800'
                    }`}
                  >
                    <Calendar size={24} className="text-amber-600" />
                    <b className="text-stone-900 dark:text-white text-sm">🏪 Store Pickup</b>
                    <span className="text-xs text-stone-400">Collect fresh from your selected branch.</span>
                  </div>
                </div>
              </div>
            )}

            {currentStepId === 'logistics' && deliveryType === 'delivery' && (
              <div className="space-y-4">
                <h3 className="font-family-fraunces text-lg font-bold text-stone-900 dark:text-white">Delivery Address</h3>
                <p className="text-xs text-stone-400">Confirm your delivery details for your selected branch area.</p>

                {selectedBranchName && (
                  <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/50 text-xs text-stone-600">
                    <span className="font-bold text-stone-800">Branch: </span>{selectedBranchName}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">City</label>
                      <input
                        type="text"
                        value={city}
                        readOnly
                        className="p-3 text-sm border border-stone-200 dark:border-zinc-800 rounded-xl bg-stone-100 dark:bg-zinc-800 text-stone-900 dark:text-white outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 col-span-2 sm:col-span-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">Area / Sector *</label>
                      <select
                        value={area}
                        onChange={e => setArea(e.target.value)}
                        className={`p-3 text-sm border rounded-xl bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-white outline-none ${
                          errors.area ? 'border-rose-500' : 'border-stone-200 dark:border-zinc-800'
                        }`}
                      >
                        {availableAreas.length === 0 ? (
                          <option value={area}>{area || 'Select area'}</option>
                        ) : (
                          availableAreas.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))
                        )}
                      </select>
                      {errors.area && <span className="text-[10px] font-bold text-rose-500">{errors.area}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">House / Flat / Street *</label>
                    <input
                      type="text"
                      placeholder="e.g. Villa 15-C, Street 4"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className={`p-3 text-sm border rounded-xl bg-stone-50 dark:bg-zinc-900 outline-none text-stone-900 dark:text-white ${
                        errors.address ? 'border-rose-500' : 'border-stone-200 dark:border-zinc-800'
                      }`}
                    />
                    {errors.address && <span className="text-[10px] font-bold text-rose-500">{errors.address}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">Landmark</label>
                    <input
                      type="text"
                      placeholder="e.g. Near Standard Chartered Bank"
                      value={landmark}
                      onChange={e => setLandmark(e.target.value)}
                      className="p-3 text-sm border border-stone-200 dark:border-zinc-800 rounded-xl bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">Delivery Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="e.g. 03001234567"
                      value={deliveryPhone}
                      onChange={e => setDeliveryPhone(e.target.value)}
                      className={`p-3 text-sm border rounded-xl bg-stone-50 dark:bg-zinc-900 outline-none text-stone-900 dark:text-white ${
                        errors.deliveryPhone ? 'border-rose-500' : 'border-stone-200 dark:border-zinc-800'
                      }`}
                    />
                    {errors.deliveryPhone && <span className="text-[10px] font-bold text-rose-500">{errors.deliveryPhone}</span>}
                  </div>
                </div>
              </div>
            )}

            {currentStepId === 'schedule' && (
              <div className="space-y-4">
                <h3 className="font-family-fraunces text-lg font-bold text-stone-900 dark:text-white">Delivery Schedule</h3>
                <p className="text-xs text-stone-400">Choose when you would like to receive the items.</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => setDeliveryTimeType('asap')}
                    className={`py-3 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                      deliveryTimeType === 'asap' ? 'border-amber-600 bg-amber-50/50 text-amber-600' : 'border-stone-200 dark:border-zinc-800 text-stone-600'
                    }`}
                  >
                    ⚡ ASAP (45 mins)
                  </button>
                  <button
                    onClick={() => setDeliveryTimeType('scheduled')}
                    className={`py-3 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                      deliveryTimeType === 'scheduled' ? 'border-amber-600 bg-amber-50/50 text-amber-600' : 'border-stone-200 dark:border-zinc-800 text-stone-600'
                    }`}
                  >
                    📅 Schedule Later
                  </button>
                </div>

                {deliveryTimeType === 'scheduled' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">Date *</label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={e => setScheduledDate(e.target.value)}
                        className="p-3 text-sm border border-stone-200 dark:border-zinc-800 rounded-xl bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-white outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">Time Slot *</label>
                      <select
                        value={scheduledTime}
                        onChange={e => setScheduledTime(e.target.value)}
                        className="p-3 text-sm border border-stone-200 dark:border-zinc-800 rounded-xl bg-stone-50 dark:bg-zinc-900 text-stone-900 dark:text-white outline-none"
                      >
                        <option value="09:00">09:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="13:00">01:00 PM</option>
                        <option value="15:00">03:00 PM</option>
                        <option value="17:00">05:00 PM</option>
                        <option value="19:00">07:00 PM</option>
                        <option value="21:00">09:00 PM</option>
                      </select>
                    </div>
                  </div>
                )}

                {deliveryType === 'pickup' && (
                  <div className="flex flex-col gap-1.5 pt-4 border-t border-stone-100 dark:border-zinc-850">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">Pickup Branch Location</label>
                    <input
                      type="text"
                      value={pickupBranch}
                      readOnly
                      className="p-3 text-sm border border-stone-200 dark:border-zinc-800 rounded-xl bg-stone-100 dark:bg-zinc-800 text-stone-900 dark:text-white outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            {currentStepId === 'payment' && (
              <div className="space-y-4">
                <h3 className="font-family-fraunces text-lg font-bold text-stone-900 dark:text-white">Payment Method</h3>
                <p className="text-xs text-stone-400">Select payment channel. Receipts are validated manually by the backend team.</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { id: 'cod', name: 'Cash on Delivery' },
                    { id: 'bank_transfer', name: 'Bank Transfer' },
                    { id: 'jazzcash', name: 'JazzCash Mobile' },
                    { id: 'easypaisa', name: 'EasyPaisa Account' },
                    { id: 'card', name: 'Credit/Debit Card' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPaymentMethod(p.id as typeof paymentMethod)}
                      className={`py-3 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer text-center ${
                        paymentMethod === p.id ? 'border-amber-600 bg-amber-50/50 text-amber-600' : 'border-stone-200 dark:border-zinc-800 text-stone-600'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                {['bank_transfer', 'jazzcash', 'easypaisa'].includes(paymentMethod) && (
                  <div className="p-4 bg-stone-50 dark:bg-zinc-900 border border-stone-200/50 dark:border-zinc-800/80 rounded-xl text-xs space-y-4">
                    <div
                      dangerouslySetInnerHTML={{ __html: PAYMENT_ACCOUNTS[paymentMethod] }}
                      className="text-stone-700 dark:text-stone-300 leading-relaxed"
                    />

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-850 dark:text-stone-200">
                        Upload Transfer Receipt Screenshot *
                      </label>
                      <div className="relative border-2 border-dashed border-stone-200 dark:border-zinc-850 rounded-xl p-6 text-center cursor-pointer hover:bg-stone-100/50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Upload size={24} className="text-stone-400" />
                          <span className="text-xs text-stone-500 font-medium">
                            {screenshot ? 'Screenshot Loaded ✓' : 'Click or Drag & Drop to Upload'}
                          </span>
                        </div>
                      </div>
                      {screenshot && (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-stone-200 mt-2">
                          <img src={screenshot} className="w-full h-full object-cover" alt="Receipt preview" />
                          <button
                            onClick={() => setScreenshot(null)}
                            className="absolute inset-0 bg-black/50 text-white text-[10px] font-bold opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      {errors.screenshot && (
                        <span className="text-[10px] font-bold text-rose-500">{errors.screenshot}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStepId === 'review' && (
              <div className="space-y-4">
                <h3 className="font-family-fraunces text-lg font-bold text-stone-900 dark:text-white">Review & Confirm</h3>
                <p className="text-xs text-stone-400 font-medium">Verify your details before placing the order.</p>

                <div className="bg-stone-50 dark:bg-zinc-900/50 border border-stone-200/50 dark:border-zinc-800/80 rounded-2xl p-5 text-xs space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-stone-400 block mb-1">Customer Info</span>
                      <span className="font-bold text-stone-900 dark:text-white block">{name}</span>
                      <span className="text-stone-500 block">{phone}</span>
                    </div>

                    <div>
                      <span className="text-stone-400 block mb-1">Delivery Logistics</span>
                      <span className="font-bold text-stone-900 dark:text-white block">
                        {deliveryType === 'delivery'
                          ? `🚚 Address: ${address}, ${area}`
                          : `🏪 Pickup: ${pickupBranch}`}
                      </span>
                      {deliveryType === 'delivery' && deliveryPhone && (
                        <span className="text-stone-500 block">Delivery Phone: {deliveryPhone}</span>
                      )}
                      <span className="text-stone-500 block">
                        Timing: {deliveryTimeType === 'asap' ? '⚡ ASAP (35-45 mins)' : `📅 ${scheduledDate} @ ${scheduledTime}`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-stone-200/50 dark:border-zinc-800/80">
                    <span className="text-stone-400 block mb-1.5">Payment Method</span>
                    <span className="font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                      {paymentMethod.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-stone-100 dark:border-zinc-800/80 flex items-center justify-between mt-6">
            <button
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              Back
            </button>

            <button
              onClick={currentStepId === 'review' ? handleSubmit : handleNext}
              disabled={loading}
              className="px-6 py-3 bg-stone-900 dark:bg-amber-600 hover:bg-amber-600 dark:hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95 disabled:opacity-40"
            >
              {loading ? 'Processing...' : currentStepId === 'review' ? 'Place Order' : 'Continue'}
              {currentStepId !== 'review' && <ChevronRight size={14} />}
            </button>
          </div>
        </div>

        <div className="w-full md:w-[320px] bg-stone-50 dark:bg-zinc-900/60 p-6 md:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-stone-200/50 dark:border-zinc-800/80">
          <div>
            <h3 className="font-family-fraunces text-base font-bold text-stone-900 dark:text-white mb-4">
              Order Summary
            </h3>

            <div className="space-y-3 max-h-[220px] overflow-y-auto mb-6 pr-1">
              {cartItems.map(it => (
                <div key={it.product.id} className="flex justify-between items-start text-xs">
                  <div className="text-stone-500 max-w-[180px]">
                    <span className="font-bold text-stone-900 dark:text-white mr-1.5">{it.quantity}x</span>
                    {it.product.name}
                  </div>
                  <span className="font-bold text-stone-900 dark:text-white">
                    Rs. {(it.product.price * it.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-stone-200/50 dark:border-zinc-850 text-xs text-stone-500 dark:text-stone-400">
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
                {deliveryCharges === 0 ? 'Free' : `Rs. ${deliveryCharges.toFixed(0)}`}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-500 font-semibold">
                <span>Discount</span>
                <span>-Rs. {discountAmount.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-stone-200 dark:border-zinc-800 text-sm font-bold text-stone-900 dark:text-white">
              <span>Grand Total</span>
              <span>Rs. {grandTotal.toFixed(0)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
