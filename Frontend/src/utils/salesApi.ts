import axios from 'axios';
import { Sale, SaleItem, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export interface SaleCreateData {
  customer?: number;
  payment_method: 'cash' | 'card' | 'transfer' | 'credit';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes?: string;
  items: {
    product: number;
    quantity: number;
    unit_price: number;
  }[];
}

export interface SaleFilters {
  status?: 'pending' | 'completed' | 'cancelled';
  customer?: number;
  start_date?: string;
  end_date?: string;
}

export interface SaleStatistics {
  total_sales: number;
  total_revenue: number;
  pending_sales: number;
  completed_sales: number;
  monthly_sales: number;
  monthly_revenue: number;
}

export const salesApi = {
  // Get all sales with optional filters
  getSales: async (filters?: SaleFilters): Promise<ApiResponse<Sale>> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.customer) params.append('customer', filters.customer.toString());
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    
    const response = await api.get(`/sales/?${params.toString()}`);
    return response.data;
  },

  // Get single sale by ID
  getSale: async (id: number): Promise<Sale> => {
    const response = await api.get(`/sales/${id}/`);
    return response.data;
  },

  // Create new sale
  createSale: async (saleData: SaleCreateData): Promise<Sale> => {
    const response = await api.post('/sales/', saleData);
    return response.data;
  },

  // Update sale
  updateSale: async (id: number, saleData: Partial<SaleCreateData>): Promise<Sale> => {
    const response = await api.put(`/sales/${id}/`, saleData);
    return response.data;
  },

  // Delete sale
  deleteSale: async (id: number): Promise<void> => {
    await api.delete(`/sales/${id}/`);
  },

  // Complete sale
  completeSale: async (id: number): Promise<{ message: string }> => {
    const response = await api.post(`/sales/${id}/complete/`);
    return response.data;
  },

  // Cancel sale
  cancelSale: async (id: number): Promise<{ message: string }> => {
    const response = await api.post(`/sales/${id}/cancel/`);
    return response.data;
  },

  // Get sales statistics
  getStatistics: async (): Promise<SaleStatistics> => {
    const response = await api.get('/sales/statistics/');
    return response.data;
  },
};

export default salesApi;
