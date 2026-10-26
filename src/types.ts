export type ItemType = 'book' | 'toy' | 'gift';

export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  digitalPrice?: number;
  printedPrice?: number;
  cover: string;
  emoji?: string;
  category: 'fiction' | 'learning' | 'children' | 'gifts' | 'toys';
  blurb?: string;
  description: string;
  tags?: string[];
  ageGroup?: string;
  minAge?: number;
  maxAge?: number;
  type?: ItemType;
  pairNote?: string;
}

export interface CartItem {
  id: string;
  title: string;
  author: string;
  price: number;
  cover: string;
  category: string;
  type: ItemType;
  qty: number;
  format?: 'printed' | 'digital';
}

export interface WishlistItem {
  id: string;
  title: string;
  author: string;
  price: number;
  cover: string;
  category: string;
  type?: ItemType;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postal: string;
  country: string;
}

export interface OrderItem {
  id: string;
  title: string;
  author: string;
  priceINR: number;
  qty: number;
  lineTotalINR: number;
  type?: ItemType;
}

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  fee: number;
  feePct: number;
  international: boolean;
  tax: number;
  total: number;
}

export interface Order {
  orderId: string;
  createdAt: string;
  status: string;
  customer: CustomerDetails;
  items: OrderItem[];
  totalsINR: OrderTotals;
  currency: string;
  exchangeRate: number;
  convertedTotal: number;
  exchangeRateUpdatedAt?: string | null;
  exchangeRateSource?: string;
  exchangeRateWasLive?: boolean;
  paymentMethod: string;
  paymentId?: string;
}

export interface User {
  email: string;
  name?: string;
  isAdmin?: boolean;
}

export interface StageInfo {
  name: string;
  minAge: number;
  maxAge: number;
  color: string;
  hex: string;
  description: string;
  image: string;
}
