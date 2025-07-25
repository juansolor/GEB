import api from './api';


// Sanitiza cualquier valor numérico, forzando a 0 si es NaN, undefined o null
function sanitizeNumber(val: any): number {
  const num = typeof val === 'number' ? val : parseFloat(val);
  return isNaN(num) || num === null || num === undefined ? 0 : num;
}

// Sanitiza los datos de los reportes
export function sanitizeReportData<T extends SalesReportData | InventoryReportData | FinancialReportData>(data: T): T {
  if ('top_products' in data && Array.isArray(data.top_products)) {
    data.top_products = data.top_products.map(prod => ({
      ...prod,
      total_quantity: sanitizeNumber(prod.total_quantity),
      total_revenue: sanitizeNumber(prod.total_revenue),
      sales_count: sanitizeNumber(prod.sales_count)
    }));
  }
  if ('top_customers' in data && Array.isArray(data.top_customers)) {
    data.top_customers = data.top_customers.map(cust => ({
      ...cust,
      total_spent: sanitizeNumber(cust.total_spent),
      purchase_count: sanitizeNumber(cust.purchase_count)
    }));
  }
  if ('daily_sales' in data && Array.isArray(data.daily_sales)) {
    data.daily_sales = data.daily_sales.map(day => ({
      ...day,
      daily_total: sanitizeNumber(day.daily_total),
      daily_count: sanitizeNumber(day.daily_count)
    }));
  }
  if ('summary' in data && typeof data.summary === 'object') {
    // Acceso seguro usando type assertion
    const summary = data.summary as Record<string, any>;
    Object.keys(summary).forEach(k => {
      if (typeof summary[k] === 'number' || typeof summary[k] === 'string') {
        summary[k] = sanitizeNumber(summary[k]);
      }
    });
    data.summary = summary as typeof data.summary;
  }
  if ('low_stock_products' in data && Array.isArray(data.low_stock_products)) {
    data.low_stock_products = data.low_stock_products.map(prod => ({
      ...prod,
      stock_quantity: sanitizeNumber(prod.stock_quantity),
      min_stock_level: sanitizeNumber(prod.min_stock_level),
      price: sanitizeNumber(prod.price),
      cost: sanitizeNumber(prod.cost)
    }));
  }
  if ('category_breakdown' in data && Array.isArray(data.category_breakdown)) {
    data.category_breakdown = data.category_breakdown.map(cat => ({
      ...cat,
      product_count: sanitizeNumber(cat.product_count),
      total_stock: sanitizeNumber(cat.total_stock),
      total_value: sanitizeNumber(cat.total_value)
    }));
  }
  if ('expense_categories' in data && Array.isArray(data.expense_categories)) {
    data.expense_categories = data.expense_categories.map(cat => ({
      ...cat,
      total_amount: sanitizeNumber(cat.total_amount),
      transaction_count: sanitizeNumber(cat.transaction_count)
    }));
  }
  if ('monthly_data' in data && Array.isArray(data.monthly_data)) {
    data.monthly_data = data.monthly_data.map(month => ({
      ...month,
      total_amount: sanitizeNumber(month.total_amount)
    }));
  }
  return data;
}



export interface ReportType {
  key: string;
  name: string;
  description: string;
  icon: string;
}

export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  format?: 'json' | 'csv' | 'excel';
}

export interface SalesReportData {
  period: {
    start_date?: string;
    end_date?: string;
  };
  summary: {
    total_amount: number;
    total_sales: number;
    average_sale: number;
  };
  top_products: Array<{
    product__name: string;
    product__sku: string;
    total_quantity: number;
    total_revenue: number;
    sales_count: number;
  }>;
  top_customers: Array<{
    customer__first_name: string;
    customer__last_name: string;
    customer__email: string;
    total_spent: number;
    purchase_count: number;
  }>;
  daily_sales: Array<{
    day: string;
    daily_total: number;
    daily_count: number;
  }>;
  generated_at: string;
}

export interface InventoryReportData {
  summary: {
    total_products: number;
    active_products: number;
    total_stock_value: number;
    low_stock_count: number;
  };
  low_stock_products: Array<{
    name: string;
    sku: string;
    stock_quantity: number;
    min_stock_level: number;
    price: number;
    cost: number;
  }>;
  category_breakdown: Array<{
    category__name: string;
    product_count: number;
    total_stock: number;
    total_value: number;
  }>;
  generated_at: string;
}

export interface FinancialReportData {
  period: {
    start_date?: string;
    end_date?: string;
  };
  summary: {
    total_income: number;
    total_expenses: number;
    net_profit: number;
    profit_margin: number;
  };
  expense_categories: Array<{
    category__name: string;
    total_amount: number;
    transaction_count: number;
  }>;
  monthly_data: Array<{
    month: string;
    type: string;
    total_amount: number;
  }>;
  generated_at: string;
}


// API Functions
export const getReportTypes = async (): Promise<ReportType[]> => {
  const response = await api.get('/api/reports/types/');
  return response.data;
};

export const generateSalesReport = async (filters: ReportFilters): Promise<SalesReportData> => {
  const response = await api.get('/api/reports/sales/', { params: filters });
  return sanitizeReportData(response.data);
};

export const generateInventoryReport = async (filters: ReportFilters): Promise<InventoryReportData> => {
  const response = await api.get('/api/reports/inventory/', { params: filters });
  return sanitizeReportData(response.data);
};

export const generateFinancialReport = async (filters: ReportFilters): Promise<FinancialReportData> => {
  const response = await api.get('/api/reports/financial/', { params: filters });
  return sanitizeReportData(response.data);
};

export const downloadReport = async (
  reportType: string,
  filters: ReportFilters,
  format: 'csv' | 'excel',
  generatedAt?: string
): Promise<void> => {
  const params = { ...filters, format };

  let endpoint = '';
  switch (reportType) {
    case 'sales':
      endpoint = '/api/reports/sales/';
      break;
    case 'inventory':
      endpoint = '/api/reports/inventory/';
      break;
    case 'financial':
      endpoint = '/api/reports/financial/';
      break;
    default:
      throw new Error('Tipo de reporte no válido');
  }

  const response = await api.get(endpoint, {
    params,
    responseType: 'blob'
  });

  // Crear enlace de descarga
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  // Usar generatedAt si está disponible, sino usar la fecha actual
  let dateStr = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  if (generatedAt) {
    // Formato seguro para nombre de archivo
    dateStr = generatedAt.replace(/[:.]/g, '-').replace('T', '_').split('+')[0];
  }
  const filename = `reporte_${reportType}_${dateStr}.${format === 'excel' ? 'xlsx' : 'csv'}`;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
