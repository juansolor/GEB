import axios from 'axios';
import { Category, Customer } from '../types';

// Configure base URL for API calls
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      // Network error - backend is probably not running
      error.userMessage = 'No se puede conectar al servidor. Verifica que el backend esté ejecutándose en http://localhost:8000';
    } else if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status >= 500) {
      // Server error
      error.userMessage = 'Error del servidor. Intenta nuevamente más tarde.';
    } else if (error.response?.status === 404) {
      // Not found
      error.userMessage = 'El recurso solicitado no fue encontrado.';
    }
    return Promise.reject(error);
  }
);

// Product API functions
export const productApi = {
  // Get all products
  getProducts: async (params?: {
    search?: string;
    category?: number;
    type?: 'product' | 'service';
    is_active?: boolean;
    low_stock?: boolean;
  }) => {
    try {
      console.log('Fetching products with params:', params);
      const response = await api.get('/api/products/', { params });
      console.log('Products response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get single product
  getProduct: async (id: number) => {
    const response = await api.get(`/api/products/${id}/`);
    return response.data;
  },

  // Create product
  createProduct: async (product: any) => {
    console.log('Creating product with data:', product);
    
    const formData = new FormData();
    
    Object.entries(product).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'image' && value instanceof File) {
          formData.append(key, value);
          console.log(`Added file to FormData: ${key}`, value.name);
        } else if (key === 'sku' && value === '') {
          // Skip empty SKU to avoid unique constraint issues
          console.log('Skipping empty SKU');
        } else {
          // Convert all non-File values to string
          const stringValue = String(value);
          formData.append(key, stringValue);
          console.log(`Added to FormData: ${key} = ${stringValue}`);
        }
      }
    });

    // Log FormData contents
    console.log('FormData contents:');
    const formDataEntries: string[] = [];
    formData.forEach((value, key) => {
      formDataEntries.push(`${key}: ${value}`);
    });
    console.log(formDataEntries);

    try {
      const response = await api.post('/api/products/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Product created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating product:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Update product
  updateProduct: async (id: number, product: any) => {
    console.log('Updating product with data:', product);
    
    const formData = new FormData();
    
    Object.entries(product).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'image' && value instanceof File) {
          formData.append(key, value);
          console.log(`Added file to FormData: ${key}`, value.name);
        } else if (key === 'sku' && value === '') {
          // Skip empty SKU to avoid unique constraint issues
          console.log('Skipping empty SKU');
        } else {
          // Convert all non-File values to string
          const stringValue = String(value);
          formData.append(key, stringValue);
          console.log(`Added to FormData: ${key} = ${stringValue}`);
        }
      }
    });

    // Log FormData contents
    console.log('FormData contents for update:');
    const formDataEntries: string[] = [];
    formData.forEach((value, key) => {
      formDataEntries.push(`${key}: ${value}`);
    });
    console.log(formDataEntries);

    try {
      const response = await api.put(`/api/products/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Product updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating product:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Delete product
  deleteProduct: async (id: number) => {
    await api.delete(`/api/products/${id}/`);
  },

  // Update stock
  updateStock: async (id: number, quantity: number, operation: 'add' | 'subtract') => {
    const response = await api.post(`/api/products/${id}/update_stock/`, {
      quantity,
      operation
    });
    return response.data;
  },

  // Get low stock products
  getLowStockProducts: async () => {
    const response = await api.get('/api/products/low_stock/');
    return response.data;
  }
};

// Category API functions
export const categoryApi = {
  // Get all categories
  getCategories: async () => {
    try {
      console.log('Fetching categories...');
      const response = await api.get('/api/categories/');
      console.log('Categories response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get single category
  getCategory: async (id: number) => {
    const response = await api.get(`/api/categories/${id}/`);
    return response.data;
  },

  // Create category
  createCategory: async (category: Omit<Category, 'id' | 'created_at'>) => {
    console.log('Creating category with data:', category);
    try {
      const response = await api.post('/api/categories/', category);
      console.log('Category created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating category:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Update category
  updateCategory: async (id: number, category: Partial<Category>) => {
    const response = await api.put(`/api/categories/${id}/`, category);
    return response.data;
  },

  // Delete category
  deleteCategory: async (id: number) => {
    await api.delete(`/api/categories/${id}/`);
  }
};

// Customer API functions
export const customerApi = {
  // Get all customers
  getCustomers: async (params?: {
    search?: string;
    customer_type?: 'individual' | 'business';
    is_active?: boolean;
  }) => {
    try {
      const response = await api.get('/api/customers/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  // Get single customer
  getCustomer: async (id: number) => {
    const response = await api.get(`/api/customers/${id}/`);
    return response.data;
  },

  // Create customer
  createCustomer: async (customer: Omit<Customer, 'id' | 'total_purchases' | 'created_at' | 'updated_at'>) => {
    console.log('Creating customer with data:', customer);
    try {
      const response = await api.post('/api/customers/', customer);
      console.log('Customer created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating customer:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Update customer
  updateCustomer: async (id: number, customer: Partial<Omit<Customer, 'id' | 'total_purchases' | 'created_at' | 'updated_at'>>) => {
    const response = await api.put(`/api/customers/${id}/`, customer);
    return response.data;
  },

  // Delete customer
  deleteCustomer: async (id: number) => {
    await api.delete(`/api/customers/${id}/`);
  },

  // Toggle customer active status
  toggleCustomerActive: async (id: number) => {
    const response = await api.patch(`/api/customers/${id}/toggle_active/`);
    return response.data;
  },

  // Get customer statistics
  getCustomerStatistics: async () => {
    const response = await api.get('/api/customers/statistics/');
    return response.data;
  }
};

export default api;
