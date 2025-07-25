import React, { useState, useEffect } from 'react';
import { Product, Customer, SaleItem } from '../types';
import { SaleCreateData } from '../utils/salesApi';
import { productApi, customerApi } from '../utils/api';

interface SaleFormProps {
  onSubmit: (saleData: SaleCreateData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

interface SaleFormData {
  customer: number | '';
  payment_method: 'cash' | 'card' | 'transfer' | 'credit';
  notes: string;
  discount_amount: number;
  tax_rate: number;
}

interface SaleItemForm {
  product: number | '';
  quantity: number;
  unit_price: number;
}

const SaleForm: React.FC<SaleFormProps> = ({ onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState<SaleFormData>({
    customer: '',
    payment_method: 'cash',
    notes: '',
    discount_amount: 0,
    tax_rate: 0
  });

  const [items, setItems] = useState<SaleItemForm[]>([
    { product: '', quantity: 1, unit_price: 0 }
  ]);

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [productsResponse, customersResponse] = await Promise.all([
        productApi.getProducts(),
        customerApi.getCustomers()
      ]);
      
      setProducts(productsResponse.results.filter((p: Product) => p.is_active));
      setCustomers(customersResponse.results.filter((c: Customer) => c.is_active));
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error al cargar datos iniciales');
    } finally {
      setLoadingData(false);
    }
  };

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'customer' ? (value === '' ? '' : parseInt(value)) :
              name === 'discount_amount' || name === 'tax_rate' ? parseFloat(value) || 0 :
              value
    }));
  };

  const handleItemChange = (index: number, field: keyof SaleItemForm, value: string | number) => {
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto-fill price when product is selected
        if (field === 'product' && value !== '') {
          const selectedProduct = products.find(p => p.id === Number(value));
          if (selectedProduct) {
            updatedItem.unit_price = selectedProduct.price;
          }
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const addItem = () => {
    setItems(prev => [...prev, { product: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      if (item.product && item.quantity && item.unit_price) {
        return sum + (item.quantity * item.unit_price);
      }
      return sum;
    }, 0);

    const tax_amount = subtotal * (formData.tax_rate / 100);
    const total_amount = subtotal + tax_amount - formData.discount_amount;

    return { subtotal, tax_amount, total_amount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate items
    const validItems = items.filter(item => 
      item.product !== '' && item.quantity > 0 && item.unit_price > 0
    );
    
    if (validItems.length === 0) {
      alert('Debe agregar al menos un producto');
      return;
    }

    // Check stock for products
    const stockErrors: string[] = [];
    for (const item of validItems) {
      const product = products.find(p => p.id === Number(item.product));
      if (product && product.type === 'product' && product.stock_quantity < item.quantity) {
        stockErrors.push(`${product.name}: Stock disponible ${product.stock_quantity}, solicitado ${item.quantity}`);
      }
    }

    if (stockErrors.length > 0) {
      alert('Stock insuficiente:\n' + stockErrors.join('\n'));
      return;
    }

    const { subtotal, tax_amount, total_amount } = calculateTotals();

    const saleData: SaleCreateData = {
      customer: formData.customer === '' ? undefined : formData.customer,
      payment_method: formData.payment_method,
      subtotal,
      tax_amount,
      discount_amount: formData.discount_amount,
      total_amount,
      notes: formData.notes,
      items: validItems.map(item => ({
        product: Number(item.product),
        quantity: item.quantity,
        unit_price: item.unit_price
      }))
    };

    await onSubmit(saleData);
  };

  const { subtotal, tax_amount, total_amount } = calculateTotals();

  if (loadingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="text-center">Cargando datos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-90vh overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Nueva Venta</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer and Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente (Opcional)
              </label>
              <select
                name="customer"
                value={formData.customer}
                onChange={handleFormDataChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Venta sin cliente</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago *
              </label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleFormDataChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
                <option value="credit">Crédito</option>
              </select>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Productos/Servicios</h3>
              <button
                type="button"
                onClick={addItem}
                className="bg-green-600 text-black px-3 py-1 rounded-lg hover:bg-green-700 text-sm"
              >
                + Agregar Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Producto/Servicio *
                    </label>
                    <select
                      value={item.product}
                      onChange={(e) => handleItemChange(index, 'product', e.target.value === '' ? '' : parseInt(e.target.value))}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar...</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - ${product.price.toLocaleString('es-CO')}
                          {product.type === 'product' && ` (Stock: ${product.stock_quantity})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      min="1"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Unitario *
                    </label>
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total
                    </label>
                    <div className="text-sm font-medium text-gray-900 py-2">
                      ${(item.quantity * item.unit_price).toLocaleString('es-CO')}
                    </div>
                  </div>

                  <div className="col-span-1">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Eliminar item"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descuento
              </label>
              <input
                type="number"
                name="discount_amount"
                value={formData.discount_amount}
                onChange={handleFormDataChange}
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Impuesto (%)
              </label>
              <input
                type="number"
                name="tax_rate"
                value={formData.tax_rate}
                onChange={handleFormDataChange}
                min="0"
                max="100"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${subtotal.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Impuesto:</span>
                  <span>${tax_amount.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Descuento:</span>
                  <span>-${formData.discount_amount.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${total_amount.toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleFormDataChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notas adicionales sobre la venta..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : 'Crear Venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleForm;
