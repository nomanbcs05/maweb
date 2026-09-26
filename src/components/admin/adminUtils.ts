// Shared types and constants for admin components
export const STATUS_OPTIONS = [
  'Pending', 'Confirmed', 'Preparing', 'Baking',
  'Out for Delivery', 'Ready for Pickup', 'Delivered', 'Cancelled'
] as const;

export type OrderStatus = typeof STATUS_OPTIONS[number];

export const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'Pending':          { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400' },
  'Confirmed':        { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400' },
  'Preparing':        { bg: 'bg-indigo-50',  text: 'text-indigo-700',  dot: 'bg-indigo-400' },
  'Baking':           { bg: 'bg-orange-50',  text: 'text-orange-700',  dot: 'bg-orange-400' },
  'Out for Delivery': { bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-400' },
  'Ready for Pickup': { bg: 'bg-cyan-50',    text: 'text-cyan-700',    dot: 'bg-cyan-400' },
  'Delivered':        { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  'Cancelled':        { bg: 'bg-red-50',     text: 'text-red-600',     dot: 'bg-red-400' },
};

export const formatCurrency = (amount: number) =>
  `Rs. ${amount.toLocaleString('en-PK', { minimumFractionDigits: 0 })}`;

export const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

export const formatShortDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PK', {
    day: 'numeric', month: 'short',
  });
};
