import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import * as XLSX from 'xlsx';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export interface Asset {
  id: number;
  name: string;
  category: string;
  asset_code: string;
  purchase_date: string;
  purchase_cost: number;
  useful_life_years: number;
  salvage_value: number;
  depreciation_method: 'straight_line' | 'declining_balance' | 'units_of_production' | 'sum_of_years';
  current_value: number;
  accumulated_depreciation: number;
  annual_depreciation: number;
  location: string;
  status: 'active' | 'fully_depreciated' | 'disposed' | 'impaired';
  last_maintenance?: string;
  notes?: string;
}

export interface DepreciationSchedule {
  year: number;
  opening_value: number;
  depreciation_expense: number;
  accumulated_depreciation: number;
  closing_value: number;
}

export interface DepreciationStats {
  total_assets: number;
  total_cost: number;
  total_current_value: number;
  total_accumulated_depreciation: number;
  annual_depreciation_expense: number;
  fully_depreciated_assets: number;
}

const Depreciations: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [schedule, setSchedule] = useState<DepreciationSchedule[]>([]);
  const [stats, setStats] = useState<DepreciationStats>({
    total_assets: 0,
    total_cost: 0,
    total_current_value: 0,
    total_accumulated_depreciation: 0,
    annual_depreciation_expense: 0,
    fully_depreciated_assets: 0
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'fully_depreciated' | 'disposed'>('all');

  useEffect(() => {
    loadDepreciationData();
  }, []);

  const loadDepreciationData = async () => {
    setLoading(true);
    try {
      // Simulated data - replace with real API calls
      const mockAssets: Asset[] = [
        {
          id: 1,
          name: 'Excavadora CAT 320D',
          category: 'Maquinaria Pesada',
          asset_code: 'EQP-001',
          purchase_date: '2022-01-15',
          purchase_cost: 120000,
          useful_life_years: 10,
          salvage_value: 12000,
          depreciation_method: 'straight_line',
          current_value: 88800,
          accumulated_depreciation: 31200,
          annual_depreciation: 10800,
          location: 'Obra Miraflores',
          status: 'active',
          last_maintenance: '2025-09-15',
          notes: 'Equipo en excelente estado'
        },
        {
          id: 2,
          name: 'Camión Volvo FH16',
          category: 'Transporte',
          asset_code: 'TRK-002',
          purchase_date: '2020-06-20',
          purchase_cost: 85000,
          useful_life_years: 8,
          salvage_value: 8500,
          depreciation_method: 'straight_line',
          current_value: 42075,
          accumulated_depreciation: 42925,
          annual_depreciation: 9562.50,
          location: 'Base Central',
          status: 'active',
          last_maintenance: '2025-08-10'
        },
        {
          id: 3,
          name: 'Compresora Atlas Copco',
          category: 'Equipos Neumáticos',
          asset_code: 'CMP-003',
          purchase_date: '2018-03-10',
          purchase_cost: 25000,
          useful_life_years: 7,
          salvage_value: 2500,
          depreciation_method: 'straight_line',
          current_value: 0,
          accumulated_depreciation: 25000,
          annual_depreciation: 0,
          location: 'Almacén',
          status: 'fully_depreciated'
        },
        {
          id: 4,
          name: 'Grúa Torre Liebherr 85EC',
          category: 'Equipos de Izaje',
          asset_code: 'GRU-004',
          purchase_date: '2023-05-12',
          purchase_cost: 180000,
          useful_life_years: 15,
          salvage_value: 18000,
          depreciation_method: 'straight_line',
          current_value: 164200,
          accumulated_depreciation: 15800,
          annual_depreciation: 10800,
          location: 'Proyecto Torre del Sol',
          status: 'active'
        }
      ];

      setAssets(mockAssets);
      
      // Calculate stats
      const totalCost = mockAssets.reduce((sum, asset) => sum + asset.purchase_cost, 0);
      const totalCurrentValue = mockAssets.reduce((sum, asset) => sum + asset.current_value, 0);
      const totalAccumulatedDep = mockAssets.reduce((sum, asset) => sum + asset.accumulated_depreciation, 0);
      const annualDepExpense = mockAssets.reduce((sum, asset) => sum + asset.annual_depreciation, 0);
      const fullyDepreciated = mockAssets.filter(asset => asset.status === 'fully_depreciated').length;

      setStats({
        total_assets: mockAssets.length,
        total_cost: totalCost,
        total_current_value: totalCurrentValue,
        total_accumulated_depreciation: totalAccumulatedDep,
        annual_depreciation_expense: annualDepExpense,
        fully_depreciated_assets: fullyDepreciated
      });

    } catch (error) {
      console.error('Error loading depreciation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDepreciationSchedule = (asset: Asset): DepreciationSchedule[] => {
    const schedule: DepreciationSchedule[] = [];
    // const yearsElapsed = new Date().getFullYear() - new Date(asset.purchase_date).getFullYear();
    let openingValue = asset.purchase_cost;
    let accumulatedDep = 0;

    for (let year = 1; year <= asset.useful_life_years; year++) {
      let depreciationExpense = 0;
      
      switch (asset.depreciation_method) {
        case 'straight_line':
          depreciationExpense = (asset.purchase_cost - asset.salvage_value) / asset.useful_life_years;
          break;
        case 'declining_balance':
          const rate = 2 / asset.useful_life_years;
          depreciationExpense = Math.max(openingValue * rate, 0);
          break;
        case 'sum_of_years':
          const sumOfYears = (asset.useful_life_years * (asset.useful_life_years + 1)) / 2;
          const remainingYears = asset.useful_life_years - year + 1;
          depreciationExpense = ((asset.purchase_cost - asset.salvage_value) * remainingYears) / sumOfYears;
          break;
        default:
          depreciationExpense = (asset.purchase_cost - asset.salvage_value) / asset.useful_life_years;
      }

      // Ensure we don't depreciate below salvage value
      const maxDepreciation = openingValue - asset.salvage_value;
      depreciationExpense = Math.min(depreciationExpense, maxDepreciation);
      
      accumulatedDep += depreciationExpense;
      const closingValue = Math.max(openingValue - depreciationExpense, asset.salvage_value);

      schedule.push({
        year: year,
        opening_value: openingValue,
        depreciation_expense: depreciationExpense,
        accumulated_depreciation: accumulatedDep,
        closing_value: closingValue
      });

      openingValue = closingValue;
    }

    return schedule;
  };

  const viewDepreciationSchedule = (asset: Asset) => {
    const assetSchedule = calculateDepreciationSchedule(asset);
    setSelectedAsset(asset);
    setSchedule(assetSchedule);
    setShowSchedule(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'fully_depreciated': return 'text-gray-600 bg-gray-100';
      case 'disposed': return 'text-red-600 bg-red-100';
      case 'impaired': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'fully_depreciated': return 'Depreciado Totalmente';
      case 'disposed': return 'Dado de Baja';
      case 'impaired': return 'Deteriorado';
      default: return 'Desconocido';
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case 'straight_line': return 'Línea Recta';
      case 'declining_balance': return 'Saldo Decreciente';
      case 'units_of_production': return 'Unidades de Producción';
      case 'sum_of_years': return 'Suma de Dígitos';
      default: return 'Línea Recta';
    }
  };

  const filteredAssets = assets.filter(asset => {
    if (filter === 'all') return true;
    return asset.status === filter;
  });

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Assets Sheet
    const assetsData = assets.map(asset => ({
      'Código': asset.asset_code,
      'Nombre': asset.name,
      'Categoría': asset.category,
      'Fecha Compra': asset.purchase_date,
      'Costo Compra': asset.purchase_cost,
      'Vida Útil (años)': asset.useful_life_years,
      'Valor Residual': asset.salvage_value,
      'Método Depreciación': getMethodText(asset.depreciation_method),
      'Valor Actual': asset.current_value,
      'Depreciación Acumulada': asset.accumulated_depreciation,
      'Depreciación Anual': asset.annual_depreciation,
      'Ubicación': asset.location,
      'Estado': getStatusText(asset.status)
    }));
    
    const ws1 = XLSX.utils.json_to_sheet(assetsData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Activos');
    
    XLSX.writeFile(wb, `Depreciaciones_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Chart data for depreciation trends
  const chartData = {
    labels: assets.map(asset => asset.name.length > 15 ? asset.name.substring(0, 15) + '...' : asset.name),
    datasets: [
      {
        label: 'Valor Actual',
        data: assets.map(asset => asset.current_value),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      },
      {
        label: 'Depreciación Acumulada',
        data: assets.map(asset => asset.accumulated_depreciation),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1
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
        text: 'Valor Actual vs Depreciación Acumulada'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return 'S/ ' + value.toLocaleString();
          }
        }
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📉 Gestión de Depreciaciones</h2>
            <p className="text-gray-600">Control de activos fijos y cálculo automático de depreciaciones</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              📊 Exportar Excel
            </button>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
            >
              ➕ Nuevo Activo
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-gray-900">{stats.total_assets}</div>
          <div className="text-sm text-gray-600">Total Activos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-blue-600">S/ {stats.total_cost.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Costo Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-green-600">S/ {stats.total_current_value.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Valor Actual</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-red-600">S/ {stats.total_accumulated_depreciation.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Depreciación Acumulada</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-orange-600">S/ {stats.annual_depreciation_expense.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Depreciación Anual</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-2xl font-bold text-gray-600">{stats.fully_depreciated_assets}</div>
          <div className="text-sm text-gray-600">Totalmente Depreciados</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex space-x-4 mb-4">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Todos ({assets.length})
          </button>
          <button 
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg ${filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Activos ({assets.filter(a => a.status === 'active').length})
          </button>
          <button 
            onClick={() => setFilter('fully_depreciated')}
            className={`px-4 py-2 rounded-lg ${filter === 'fully_depreciated' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Depreciados ({assets.filter(a => a.status === 'fully_depreciated').length})
          </button>
        </div>

        {/* Assets Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Compra</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Original</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Actual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dep. Anual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                    <div className="text-sm text-gray-500">{asset.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {asset.asset_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {asset.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {asset.purchase_date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    S/ {asset.purchase_cost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">S/ {asset.current_value.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">
                      Depreciado: {((asset.accumulated_depreciation / asset.purchase_cost) * 100).toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    S/ {asset.annual_depreciation.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                      {getStatusText(asset.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => viewDepreciationSchedule(asset)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver cronograma"
                      >
                        📅
                      </button>
                      <button 
                        className="text-green-600 hover:text-green-900"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Depreciation Schedule Modal */}
      {showSchedule && selectedAsset && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                📅 Cronograma de Depreciación - {selectedAsset.name}
              </h3>
              <button 
                onClick={() => setShowSchedule(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Método:</span> {getMethodText(selectedAsset.depreciation_method)}
                </div>
                <div>
                  <span className="font-medium">Vida Útil:</span> {selectedAsset.useful_life_years} años
                </div>
                <div>
                  <span className="font-medium">Valor Residual:</span> S/ {selectedAsset.salvage_value.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Costo Original:</span> S/ {selectedAsset.purchase_cost.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Año</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor Inicial</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Depreciación</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dep. Acumulada</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor Final</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedule.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">{item.year}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">S/ {item.opening_value.toLocaleString()}</td>
                      <td className="px-4 py-2 text-sm text-red-600">S/ {item.depreciation_expense.toLocaleString()}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">S/ {item.accumulated_depreciation.toLocaleString()}</td>
                      <td className="px-4 py-2 text-sm font-medium text-green-600">S/ {item.closing_value.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Depreciations;