export interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  created_at?: string;
}

export interface CustomizationOption {
  name: string;
  type: 'select' | 'text' | 'checkbox';
  required: boolean;
  choices?: { name: string; price: number }[];
}

// FIX: Bug 1 & Bug 2: Enhanced QuantityOption with variantId, stock, and frozen flags
export interface QuantityOption {
  id?: string;
  label: string;
  value: string;
  price: number;
  stock?: number;
  out_of_stock?: boolean;
  isFrozen?: boolean;
  allowSidebarOrder?: boolean;
}

// FIX BUG 1: Cart item structure with composite key `${productId}-${variantId}`
export interface CartItem {
  id: string; // `${productId}-${variantId}`
  productId: string;
  variantId: string;
  variantName: string;
  price: number;
  qty: number;
  image: string;
  name: string;
  product: Product;
  quantity: number;
  notes: string;
  selectedOption?: QuantityOption;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  sale_price?: number;
  unit: string; // Piece, Pound, KG, Packet, Box
  quantityOptions: QuantityOption[];
  image: string;
  gallery: string[];
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  available: boolean;
  // FIX: Bug 1: Status and stock flags for global availability
  status?: string; // 'active' | 'inactive'
  stock?: number;
  out_of_stock?: boolean;
  isFrozen?: boolean;
  allowSidebarOrder?: boolean;
  stock_quantity: number; // -1 for unlimited
  minimum_order: number;
  preparation_time?: string;
  display_order?: number;
  tags: string[];
  ingredients?: string[];
  allergens?: string[];
  nutritional_info?: string;
  customizations?: CustomizationOption[];
  created_at?: string;
  updated_at?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
}

export interface AddressInfo {
  house: string;
  area: string;
  instructions?: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string; // MAB-XXXXXX
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  total_amount: number;
  status: 'Pending' | 'Confirmed' | 'Preparing' | 'Baking' | 'Out for Delivery' | 'Ready for Pickup' | 'Delivered' | 'Cancelled';
  type: 'delivery' | 'pickup';
  address?: AddressInfo;
  branch?: string;
  delivery_fee: number;
  tax: number;
  discount: number;
  payment_method?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
}
