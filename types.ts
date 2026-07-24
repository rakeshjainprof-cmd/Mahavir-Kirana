export type Category = 
  | 'All'
  | 'Rice & Grains'
  | 'Dal & Pulses'
  | 'Oils & Ghee'
  | 'Spices & Masala'
  | 'Snacks & Beverages'
  | 'Daily Essentials'
  | 'Personal Care';

export interface Product {
  id: string;
  title: string;
  category: Exclude<Category, 'All'>;
  mrp: number;
  price: number;
  discountPercent: number;
  weight: string;
  inStock: boolean;
  image: string;
  description: string;
  popular?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export type DeliveryType = 'delivery' | 'pickup';

export type PaymentMethod = 'cod' | 'upi';

export interface OrderItem {
  id: string;
  title: string;
  weight: string;
  mrp: number;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalDiscount: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  formattedDate: string;
  notes?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
}

export interface AnalyticsStats {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalCustomerSavings: number;
  salesTrend: { date: string; revenue: number; orders: number }[];
  categoryBreakdown: { category: string; value: number; count: number }[];
  topProducts: { title: string; unitsSold: number; revenue: number }[];
}
