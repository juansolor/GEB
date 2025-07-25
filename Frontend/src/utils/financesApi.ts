import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance with authentication
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Transaction interfaces
export interface Transaction {
  id: number;
  transaction_type: 'income' | 'expense';
  description: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'transfer' | 'check';
  category?: number;
  category_name?: string;  
  transaction_date: string;
  receipt_number?: string;
  notes?: string;
  attachment?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionCreateData {
  transaction_type: 'income' | 'expense';
  description: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'transfer' | 'check';
  category?: number;
  transaction_date: string;
  receipt_number?: string;
  notes?: string;
  attachment?: File;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface FinancialStatistics {
  current_month: {
    income: number;
    expenses: number;
    balance: number;
  };
  previous_month: {
    income: number;
    expenses: number;
    balance: number;
  };
  totals: {
    transactions: number;
    income: number;
    expenses: number;
    balance: number;
  };
}

// Transaction API functions
export const transactionApi = {
  // Get all transactions
  getAll: (params?: { type?: string; start_date?: string; end_date?: string }) => {
    return api.get<Transaction[]>('/transactions/', { params });
  },

  // Get transaction by ID
  getById: (id: number) => {
    return api.get<Transaction>(`/transactions/${id}/`);
  },

  // Create transaction
  create: (data: TransactionCreateData) => {
    const formData = new FormData();
    
    formData.append('transaction_type', data.transaction_type);
    formData.append('description', data.description);
    formData.append('amount', data.amount.toString());
    formData.append('payment_method', data.payment_method);
    formData.append('transaction_date', data.transaction_date);
    
    if (data.category) {
      formData.append('category', data.category.toString());
    }
    if (data.receipt_number) {
      formData.append('receipt_number', data.receipt_number);
    }
    if (data.notes) {
      formData.append('notes', data.notes);
    }
    if (data.attachment) {
      formData.append('attachment', data.attachment);
    }

    return api.post<Transaction>('/transactions/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update transaction
  update: (id: number, data: Partial<TransactionCreateData>) => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'attachment' && value instanceof File) {
          formData.append(key, value);
        } else if (key !== 'attachment') {
          formData.append(key, value.toString());
        }
      }
    });

    return api.patch<Transaction>(`/transactions/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete transaction
  delete: (id: number) => {
    return api.delete(`/transactions/${id}/`);
  },

  // Get statistics
  getStatistics: () => {
    return api.get<FinancialStatistics>('/transactions/statistics/');
  },

  // Get recent transactions
  getRecent: (limit: number = 10) => {
    return api.get<Transaction[]>(`/transactions/recent/?limit=${limit}`);
  },
};

// Expense categories API functions
export const categoryApi = {
  // Get all categories
  getAll: () => {
    return api.get<ExpenseCategory[]>('/expense-categories/');
  },

  // Get category by ID
  getById: (id: number) => {
    return api.get<ExpenseCategory>(`/expense-categories/${id}/`);
  },

  // Create category
  create: (data: { name: string; description?: string }) => {
    return api.post<ExpenseCategory>('/expense-categories/', data);
  },

  // Update category
  update: (id: number, data: { name?: string; description?: string }) => {
    return api.patch<ExpenseCategory>(`/expense-categories/${id}/`, data);
  },

  // Delete category
  delete: (id: number) => {
    return api.delete(`/expense-categories/${id}/`);
  },
};

export default api;
