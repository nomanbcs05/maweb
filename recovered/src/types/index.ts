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

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  sale_price?: number;
  unit: string; // Piece, Pound, KG, Packet, Box
  image: string;
  gallery: string[];
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  available: boolean;
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
  status: 'Pending' | 'Preparing' | 'Baking' | 'Out for Delivery' | 'Ready for Pickup' | 'Delivered' | 'Cancelled';
  type: 'delivery' | 'pickup';
  address?: AddressInfo;
  branch?: string;
  delivery_fee: number;
  tax: number;
  discount: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
}
