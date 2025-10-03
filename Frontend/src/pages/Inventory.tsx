import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';
import * as XLSX from 'xlsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  sku: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  unit_cost: number;
  total_value: number;
  last_updated: string;
  location: string;
  supplier: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock';
}

export interface InventoryMovement {
  id: number;
  item_id: number;
  item_name: string;
  movement_type: 'entry' | 'exit' | 'adjustment' | 'transfer';
  quantity: number;
  unit_cost: number;
  reference: string;
  date: string;
  user: string;
  notes?: string;
}

export interface InventoryStats {
  total_items: number;
  total_value: number;
  low_stock_items: number;
  out_of_stock_items: number;
  overstock_items: number;
  categories_count: number;
}

const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    total_items: 0,
    total_value: 0,
    low_stock_items: 0,
    out_of_stock_items: 0,
    overstock_items: 0,
    categories_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'low_stock' | 'out_of_stock' | 'overstock'>('all');

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    setLoading(true);
    try {
      // Simulated data - replace with real API calls
      const mockItems: InventoryItem[] = [
        {
          id: 1,
          name: 'Cemento Portland Tipo I',
          category: 'Materiales de Construcción',
          sku: 'CEM-001',
          current_stock: 50,
          min_stock: 20,
          max_stock: 200,
          unit_cost: 25.50,
          total_value: 1275.00,
          last_updated: '2025-10-01',
          location: 'Almacén A-1',
          supplier: 'Cementos Lima',
          status: 'in_stock'
        },
        {
          id: 2,
          name: 'Fierro de Construcción 3/8"',
          category: 'Materiales Metálicos',
          sku: 'FIE-002',
          current_stock: 15,
          min_stock: 25,
          max_stock: 100,
          unit_cost: 45.80,
          total_value: 687.00,
          last_updated: '2025-09-28',
          location: 'Almacén B-2',
          supplier: 'Aceros Arequipa',
          status: 'low_stock'
        },
        {
          id: 3,
          name: 'Pintura Látex Blanco',
          category: 'Pinturas y Acabados',
          sku: 'PIN-003',
          current_stock: 0,
          min_stock: 10,
          max_stock: 50,
          unit_cost: 85.00,
          total_value: 0.00,
          last_updated: '2025-09-25',
          location: 'Almacén C-1',
          supplier: 'Pinturas Tekno',
          status: 'out_of_stock'
        },
        {
          id: 4,
          name: 'Tuberías PVC 4"',
          category: 'Instalaciones Sanitarias',
          sku: 'TUB-004',
          current_stock: 180,
          min_stock: 30,
          max_stock: 150,
          unit_cost: 28.90,
          total_value: 5202.00,
          last_updated: '2025-10-02',
          location: 'Almacén D-1',
          supplier: 'Tubos del Perú',
          status: 'overstock'
        }
      ];

      const mockMovements: InventoryMovement[] = [
        {
          id: 1,
          item_id: 1,
          item_name: 'Cemento Portland Tipo I',
          movement_type: 'entry',
          quantity: 100,
          unit_cost: 25.50,
          reference: 'PO-2025-001',
          date: '2025-09-28',
          user: 'Admin Usuario',
          notes: 'Compra mensual de cemento'
        },
        {
          id: 2,
          item_id: 2,
          item_name: 'Fierro de Construcción 3/8"',
          movement_type: 'exit',
          quantity: -10,
          unit_cost: 45.80,
          reference: 'PRO-2025-015',
          date: '2025-09-30',
          user: 'Juan Pérez',
          notes: 'Salida para proyecto residencial'
        }
      ];

      setItems(mockItems);
      setMovements(mockMovements);
      
      // Calculate stats
      const totalValue = mockItems.reduce((sum, item) => sum + item.total_value, 0);
      setStats({
        total_items: mockItems.length,
        total_value: totalValue,
        low_stock_items: mockItems.filter(item => item.status === 'low_stock').length,
        out_of_stock_items: mockItems.filter(item => item.status === 'out_of_stock').length,
        overstock_items: mockItems.filter(item => item.status === 'overstock').length,
        categories_count: Array.from(new Set(mockItems.map(item => item.category))).length
      });

    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'text-green-600 bg-green-100';
      case 'low_stock': return 'text-yellow-600 bg-yellow-100';
      case 'out_of_stock': return 'text-red-600 bg-red-100';
      case 'overstock': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_stock': return 'En Stock';
      case 'low_stock': return 'Stock Bajo';
      case 'out_of_stock': return 'Sin Stock';
      case 'overstock': return 'Sobre Stock';
      default: return 'Desconocido';
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Inventory Items Sheet
    const itemsData = items.map(item => ({
      'SKU': item.sku,
      'Nombre': item.name,
      'Categoría': item.category,
      'Stock Actual': item.current_stock,
      'Stock Mínimo': item.min_stock,
      'Stock Máximo': item.max_stock,
      'Costo Unitario': item.unit_cost,
      'Valor Total': item.total_value,
      'Estado': getStatusText(item.status),
      'Ubicación': item.location,
      'Proveedor': item.supplier,
      'Última Actualización': item.last_updated
    }));
    
    const ws1 = XLSX.utils.json_to_sheet(itemsData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Inventario');
    
    // Movements Sheet
    const movementsData = movements.map(movement => ({
      'Fecha': movement.date,
      'Artículo': movement.item_name,
      'Tipo': movement.movement_type === 'entry' ? 'Entrada' : 
             movement.movement_type === 'exit' ? 'Salida' : 
             movement.movement_type === 'adjustment' ? 'Ajuste' : 'Transferencia',
      'Cantidad': movement.quantity,
      'Costo Unitario': movement.unit_cost,
      'Referencia': movement.reference,
      'Usuario': movement.user,
      'Notas': movement.notes || ''
    }));
    
    const ws2 = XLSX.utils.json_to_sheet(movementsData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Movimientos');
    
    XLSX.writeFile(wb, `Inventario_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Chart data for inventory levels
  const chartData = {
    labels: items.map(item => item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name),
    datasets: [
      {
        label: 'Stock Actual',
        data: items.map(item => item.current_stock),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Stock Mínimo',
        data: items.map(item => item.min_stock),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Niveles de Inventario'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-container p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-primary">📦 Gestión de Inventario</h2>
            <p className="text-secondary">Control integral de stock, movimientos y valorización</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={exportToExcel}
              className="btn btn-success-enhanced px-4 py-2"
            >
              📊 Exportar Excel
            </button>
            <button 
              onClick={() => setShowMovementForm(true)}
              className="btn btn-primary px-4 py-2"
            >
              📋 Nuevo Movimiento
            </button>
            <button 
              onClick={() => setShowForm(true)}
              className="btn btn-primary px-4 py-2"
            >
              ➕ Nuevo Artículo
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="metric-card p-4">
          <div className="metric-value text-2xl">{stats.total_items}</div>
          <div className="metric-label">Total Artículos</div>
        </div>
        <div className="metric-card p-4">
          <div className="metric-value text-2xl text-success">S/ {stats.total_value.toLocaleString()}</div>
          <div className="metric-label">Valor Total</div>
        </div>
        <div className="metric-card p-4">
          <div className="metric-value text-2xl text-warning">{stats.low_stock_items}</div>
          <div className="metric-label">Stock Bajo</div>
        </div>
        <div className="metric-card p-4">
          <div className="metric-value text-2xl text-error">{stats.out_of_stock_items}</div>
          <div className="metric-label">Sin Stock</div>
        </div>
        <div className="metric-card p-4">
          <div className="metric-value text-2xl text-primary">{stats.overstock_items}</div>
          <div className="metric-label">Sobre Stock</div>
        </div>
        <div className="metric-card p-4">
          <div className="metric-value text-2xl" style={{color: '#8b5cf6'}}>{stats.categories_count}</div>
          <div className="metric-label">Categorías</div>
        </div>
      </div>

      {/* Chart */}
      <div className="card-container p-6">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Filters */}
      <div className="card-container p-6">
        <div className="flex space-x-4 mb-4">
          <button 
            onClick={() => setFilter('all')}
            className={`filter-btn ${filter === 'all' ? 'filter-btn-active' : 'filter-btn-inactive'}`}
          >
            Todos ({items.length})
          </button>
          <button 
            onClick={() => setFilter('low_stock')}
            className={`filter-btn ${filter === 'low_stock' ? 'filter-btn-active' : 'filter-btn-inactive'}`}
          >
            Stock Bajo ({stats.low_stock_items})
          </button>
          <button 
            onClick={() => setFilter('out_of_stock')}
            className={`filter-btn ${filter === 'out_of_stock' ? 'filter-btn-active' : 'filter-btn-inactive'}`}
          >
            Sin Stock ({stats.out_of_stock_items})
          </button>
          <button 
            onClick={() => setFilter('overstock')}
            className={`filter-btn ${filter === 'overstock' ? 'filter-btn-active' : 'filter-btn-inactive'}`}
          >
            Sobre Stock ({stats.overstock_items})
          </button>
        </div>

        {/* Items Table */}
        <div className="table-container">
          <table className="min-w-full table-auto">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Artículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Costo Unit.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Valor Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Ubicación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="table-row">
                  <td className="table-cell px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-primary">{item.name}</div>
                    <div className="text-sm text-secondary">{item.supplier}</div>
                  </td>
                  <td className="table-cell px-6 py-4 whitespace-nowrap text-sm">
                    {item.sku}
                  </td>
                  <td className="table-cell px-6 py-4 whitespace-nowrap text-sm">
                    {item.category}
                  </td>
                  <td className="table-cell px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-primary">{item.current_stock}</div>
                    <div className="text-xs text-gray-500">Min: {item.min_stock} | Max: {item.max_stock}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    S/ {item.unit_cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    S/ {item.total_value.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setSelectedItem(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        👁️
                      </button>
                      <button className="text-green-600 hover:text-green-900">✏️</button>
                      <button className="text-red-600 hover:text-red-900">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Movements */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Movimientos Recientes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movements.slice(0, 10).map((movement) => (
                <tr key={movement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {movement.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {movement.item_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      movement.movement_type === 'entry' ? 'text-green-800 bg-green-100' :
                      movement.movement_type === 'exit' ? 'text-red-800 bg-red-100' :
                      'text-blue-800 bg-blue-100'
                    }`}>
                      {movement.movement_type === 'entry' ? 'Entrada' :
                       movement.movement_type === 'exit' ? 'Salida' :
                       movement.movement_type === 'adjustment' ? 'Ajuste' : 'Transferencia'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                      {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {movement.reference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {movement.user}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;