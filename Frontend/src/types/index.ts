export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'admin' | 'manager' | 'employee';
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  type: 'product' | 'service';
  category: number;
  category_name: string;
  sku: string;
  price: number;
  cost: number;
  stock_quantity: number;
  min_stock_level: number;
  is_active: boolean;
  image?: string;
  is_low_stock: boolean;
  profit_margin: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Customer {
  id: number;
  name: string;
  customer_type: 'individual' | 'business';
  document_number: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  notes: string;
  is_active: boolean;
  total_purchases: number;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: number;
  sale_number: string;
  customer: number;
  customer_name: string;
  sale_date: string;
  payment_method: 'cash' | 'card' | 'transfer' | 'credit';
  status: 'pending' | 'completed' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes: string;
  items: SaleItem[];
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: number;
  product: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Transaction {
  id: number;
  transaction_type: 'income' | 'expense';
  description: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'transfer' | 'check';
  category: number;
  category_name: string;
  transaction_date: string;
  receipt_number: string;
  notes: string;
  attachment?: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
