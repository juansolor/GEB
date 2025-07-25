import React, { useState, useEffect } from 'react';
import { TransactionCreateData, ExpenseCategory, categoryApi } from '../utils/financesApi';

interface TransactionFormProps {
  type: 'income' | 'expense';
  onSubmit: (data: TransactionCreateData) => void;
  onClose: () => void;
  initialData?: Partial<TransactionCreateData>;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  type,
  onSubmit,
  onClose,
  initialData
}) => {
  const [formData, setFormData] = useState<Partial<TransactionCreateData>>({
    transaction_type: type,
    description: '',
    amount: 0,
    payment_method: 'cash',
    transaction_date: new Date().toISOString().split('T')[0],
    receipt_number: '',
    notes: '',
    ...initialData
  });

  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (type === 'expense') {
      loadCategories();
    }
  }, [type]);

  const loadCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]); // Set empty array on error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || formData.amount <= 0) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData as TransactionCreateData);
      onClose();
    } catch (error) {
      console.error('Error submitting transaction:', error);
      alert('Error al guardar la transacción');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        attachment: file
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {type === 'income' ? '💵 Registrar Ingreso' : '💳 Registrar Gasto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción de la transacción"
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Monto *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
              min="0.01"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-1">
              Método de Pago
            </label>
            <select
              id="payment_method"
              name="payment_method"
              value={formData.payment_method}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="transfer">Transferencia</option>
              <option value="check">Cheque</option>
            </select>
          </div>

          {type === 'expense' && (
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                id="category"
                name="category"
                value={formData.category || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar categoría...</option>
                {Array.isArray(categories) && categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="transaction_date" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Transacción
            </label>
            <input
              type="date"
              id="transaction_date"
              name="transaction_date"
              value={formData.transaction_date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="receipt_number" className="block text-sm font-medium text-gray-700 mb-1">
              Número de Recibo
            </label>
            <input
              type="text"
              id="receipt_number"
              name="receipt_number"
              value={formData.receipt_number}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Número de recibo (opcional)"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notas adicionales (opcional)"
            />
          </div>

          <div>
            <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">
              Adjuntar Archivo
            </label>
            <input
              type="file"
              id="attachment"
              name="attachment"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formatos soportados: imágenes, PDF, DOC, DOCX
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2 px-4 rounded-md text-white font-medium ${
                type === 'income' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
