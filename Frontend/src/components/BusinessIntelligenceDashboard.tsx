import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js/auto';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Interfaces para Business Intelligence
export interface KPIMetric {
  id: number;
  name: string;
  code: string;
  current_value: number;
  target_value: number;
  trend: 'up' | 'down' | 'stable';
  trend_percentage: number;
  unit: string;
  category: string;
}

export interface BusinessInsight {
  id: number;
  title: string;
  description: string;
  type: 'opportunity' | 'risk' | 'anomaly' | 'pattern' | 'forecast' | 'recommendation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  estimated_impact: string;
  recommended_actions: string[];
}

export interface ImprovementPlan {
  id: number;
  name: string;
  description: string;
  category: string;
  status: 'draft' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  progress_percentage: number;
  estimated_roi: number;
  estimated_investment: number;
  target_completion_date: string;
  actions_count: number;
  completed_actions: number;
}

export interface SmartSuggestion {
  id: number;
  title: string;
  description: string;
  type: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  confidence_score: number;
  potential_savings: number;
  potential_revenue: number;
  implementation_steps: string[];
  is_reviewed: boolean;
  is_accepted: boolean;
}

const BusinessIntelligenceDashboard: React.FC = () => {
  // Estados principales
  const [kpis, setKpis] = useState<KPIMetric[]>([]);
  const [insights, setInsights] = useState<BusinessInsight[]>([]);
  const [improvementPlans, setImprovementPlans] = useState<ImprovementPlan[]>([]);
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // Estados para análisis de tendencias
  const [trendData, setTrendData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [benchmarkData, setBenchmarkData] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simular carga de datos del BI
      await loadKPIs();
      await loadInsights();
      await loadImprovementPlans();
      await loadSuggestions();
      await loadTrendAnalysis();
      await loadForecastData();
      await loadBenchmarkData();
    } catch (error) {
      console.error('Error loading BI dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadKPIs = async () => {
    // Simulación de KPIs principales
    const mockKPIs: KPIMetric[] = [
      {
        id: 1,
        name: 'Margen de Ganancia',
        code: 'PROFIT_MARGIN',
        current_value: 23.5,
        target_value: 25.0,
        trend: 'up',
        trend_percentage: 5.2,
        unit: '%',
        category: 'financial'
      },
      {
        id: 2,
        name: 'Eficiencia Operacional',
        code: 'OPERATIONAL_EFF',
        current_value: 87.3,
        target_value: 90.0,
        trend: 'up',
        trend_percentage: 2.1,
        unit: '%',
        category: 'operational'
      },
      {
        id: 3,
        name: 'Tiempo Promedio Cotización',
        code: 'AVG_QUOTE_TIME',
        current_value: 4.2,
        target_value: 3.0,
        trend: 'down',
        trend_percentage: -12.5,
        unit: 'horas',
        category: 'efficiency'
      },
      {
        id: 4,
        name: 'Tasa Conversión Propuestas',
        code: 'CONVERSION_RATE',
        current_value: 68.5,
        target_value: 75.0,
        trend: 'up',
        trend_percentage: 8.3,
        unit: '%',
        category: 'sales'
      },
      {
        id: 5,
        name: 'Satisfacción del Cliente',
        code: 'CUSTOMER_SAT',
        current_value: 4.6,
        target_value: 4.8,
        trend: 'stable',
        trend_percentage: 0.5,
        unit: '/5',
        category: 'quality'
      },
      {
        id: 6,
        name: 'Valor Promedio Proyecto',
        code: 'AVG_PROJECT_VALUE',
        current_value: 125000,
        target_value: 150000,
        trend: 'up',
        trend_percentage: 15.2,
        unit: 'S/',
        category: 'financial'
      }
    ];
    
    setKpis(mockKPIs);
  };

  const loadInsights = async () => {
    const mockInsights: BusinessInsight[] = [
      {
        id: 1,
        title: 'Oportunidad de Optimización de Márgenes',
        description: 'Los proyectos de infraestructura muestran márgenes 15% superiores al promedio. Se recomienda enfocar recursos comerciales en este segmento.',
        type: 'opportunity',
        priority: 'high',
        confidence: 87.5,
        estimated_impact: 'Incremento del 12-18% en rentabilidad general',
        recommended_actions: [
          'Asignar 2 comerciales adicionales al segmento infraestructura',
          'Desarrollar propuesta especializada para este mercado',
          'Crear alianza estratégica con proveedores especializados'
        ]
      },
      {
        id: 2,
        title: 'Riesgo: Incremento en Costos de Materiales',
        description: 'Detectado incremento del 8% en costos de materiales en los últimos 30 días. Impacto directo en márgenes de proyectos futuros.',
        type: 'risk',
        priority: 'critical',
        confidence: 92.3,
        estimated_impact: 'Reducción de 3-5% en márgenes si no se toman acciones',
        recommended_actions: [
          'Revisar y actualizar matriz de costos inmediatamente',
          'Negociar contratos a mediano plazo con proveedores clave',
          'Implementar cláusulas de escalación en nuevas propuestas'
        ]
      },
      {
        id: 3,
        title: 'Patrón: Estacionalidad en Demanda',
        description: 'Identificado patrón estacional con picos de demanda en Q2 y Q4. Oportunidad de optimizar recursos y pricing.',
        type: 'pattern',
        priority: 'medium',
        confidence: 78.9,
        estimated_impact: 'Optimización de utilización de recursos del 20%',
        recommended_actions: [
          'Ajustar estrategia de contratación temporal',
          'Implementar pricing estacional dinámico',
          'Planificar campañas comerciales específicas'
        ]
      }
    ];
    
    setInsights(mockInsights);
  };

  const loadImprovementPlans = async () => {
    const mockPlans: ImprovementPlan[] = [
      {
        id: 1,
        name: 'Implementación de Pricing Dinámico',
        description: 'Sistema automatizado de ajuste de precios basado en múltiples factores de mercado y operacionales.',
        category: 'technology',
        status: 'in_progress',
        progress_percentage: 65.0,
        estimated_roi: 340.0,
        estimated_investment: 35000,
        target_completion_date: '2025-12-15',
        actions_count: 8,
        completed_actions: 5
      },
      {
        id: 2,
        name: 'Optimización de Procesos de Cotización',
        description: 'Automatización y mejora de los procesos de generación de cotizaciones para reducir tiempos de respuesta.',
        category: 'process',
        status: 'approved',
        progress_percentage: 25.0,
        estimated_roi: 180.0,
        estimated_investment: 18000,
        target_completion_date: '2025-11-30',
        actions_count: 6,
        completed_actions: 2
      },
      {
        id: 3,
        name: 'Sistema de Inteligencia de Mercado',
        description: 'Implementación de herramientas de análisis competitivo y seguimiento de tendencias de mercado.',
        category: 'market',
        status: 'draft',
        progress_percentage: 0.0,
        estimated_roi: 250.0,
        estimated_investment: 25000,
        target_completion_date: '2026-02-28',
        actions_count: 10,
        completed_actions: 0
      }
    ];
    
    setImprovementPlans(mockPlans);
  };

  const loadSuggestions = async () => {
    const mockSuggestions: SmartSuggestion[] = [
      {
        id: 1,
        title: 'Implementar Descuentos por Volumen Automáticos',
        description: 'Sistema que aplique automáticamente descuentos progresivos basados en el volumen total de proyectos del cliente.',
        type: 'revenue_increase',
        urgency: 'high',
        confidence_score: 85.5,
        potential_savings: 0,
        potential_revenue: 45000,
        implementation_steps: [
          'Definir escalas de descuento por volumen',
          'Programar lógica de cálculo automático',
          'Integrar con sistema de CRM',
          'Crear dashboard de seguimiento'
        ],
        is_reviewed: false,
        is_accepted: false
      },
      {
        id: 2,
        title: 'Optimizar Inventario de Recursos Críticos',
        description: 'Análisis predictivo para optimizar niveles de inventario de recursos críticos y reducir costos de almacenamiento.',
        type: 'cost_optimization',
        urgency: 'medium',
        confidence_score: 78.2,
        potential_savings: 28000,
        potential_revenue: 0,
        implementation_steps: [
          'Análisis de patrones de consumo históricos',
          'Implementar modelo predictivo de demanda',
          'Establecer puntos de reorden automáticos',
          'Integrar con proveedores clave'
        ],
        is_reviewed: true,
        is_accepted: false
      }
    ];
    
    setSuggestions(mockSuggestions);
  };

  const loadTrendAnalysis = async () => {
    // Datos de tendencias para los últimos 6 meses
    const trendChartData = {
      labels: ['Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      datasets: [
        {
          label: 'Margen de Ganancia (%)',
          data: [20.5, 21.8, 22.1, 22.9, 23.2, 23.5],
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Eficiencia Operacional (%)',
          data: [82.1, 83.5, 85.2, 86.1, 86.8, 87.3],
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
    
    setTrendData(trendChartData);
  };

  const loadForecastData = async () => {
    // Datos de pronóstico para los próximos 3 meses
    const forecastChartData = {
      labels: ['Enero 2026', 'Febrero 2026', 'Marzo 2026'],
      datasets: [
        {
          label: 'Ingresos Proyectados',
          data: [180000, 195000, 210000],
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2
        },
        {
          label: 'Costos Proyectados',
          data: [140000, 148000, 158000],
          backgroundColor: 'rgba(255, 205, 86, 0.5)',
          borderColor: 'rgba(255, 205, 86, 1)',
          borderWidth: 2
        }
      ]
    };
    
    setForecastData(forecastChartData);
  };

  const loadBenchmarkData = async () => {
    // Datos de benchmarking vs industria
    const benchmarkChartData = {
      labels: ['Margen', 'Eficiencia', 'Calidad', 'Velocidad', 'Satisfacción'],
      datasets: [
        {
          label: 'GEB',
          data: [23.5, 87.3, 92.1, 85.7, 91.2],
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2
        },
        {
          label: 'Promedio Industria',
          data: [18.2, 78.5, 85.3, 72.1, 84.6],
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2
        }
      ]
    };
    
    setBenchmarkData(benchmarkChartData);
  };

  const getKPIIcon = (category: string) => {
    const icons = {
      financial: '💰',
      operational: '⚙️',
      efficiency: '⚡',
      sales: '📈',
      quality: '⭐',
      market: '🎯'
    };
    return icons[category as keyof typeof icons] || '📊';
  };

  const getTrendIcon = (trend: string) => {
    const icons = {
      up: '📈',
      down: '📉',
      stable: '➡️'
    };
    return icons[trend as keyof typeof icons] || '➡️';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
      urgent: 'bg-red-200 text-red-900'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      approved: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🧠 Business Intelligence Dashboard</h1>
        <p className="text-blue-100">
          Análisis inteligente de datos empresariales con insights automáticos y recomendaciones de mejora
        </p>
        
        <div className="mt-4 flex space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input-field px-4 py-2"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="1y">Último año</option>
          </select>
          
          <button className="btn btn-secondary-enhanced px-4 py-2">
            🔄 Actualizar Datos
          </button>
          
          <button className="btn btn-primary px-4 py-2">
            📊 Generar Reporte
          </button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="metric-card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getKPIIcon(kpi.category)}</span>
                <h3 className="font-semibold text-primary">{kpi.name}</h3>
              </div>
              <span className="text-2xl">{getTrendIcon(kpi.trend)}</span>
            </div>
            
            <div className="mb-4">
              <div className="metric-value text-3xl">
                {kpi.unit === 'S/' ? 'S/ ' : ''}{kpi.current_value.toLocaleString()}{kpi.unit !== 'S/' ? ' ' + kpi.unit : ''}
              </div>
              <div className="metric-label text-sm">
                Objetivo: {kpi.unit === 'S/' ? 'S/ ' : ''}{kpi.target_value.toLocaleString()}{kpi.unit !== 'S/' ? ' ' + kpi.unit : ''}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className={`text-sm font-medium ${
                kpi.trend === 'up' ? 'text-green-600' : 
                kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {kpi.trend_percentage > 0 ? '+' : ''}{kpi.trend_percentage.toFixed(1)}% vs período anterior
              </div>
              
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    (kpi.current_value / kpi.target_value) >= 1 ? 'bg-green-500' :
                    (kpi.current_value / kpi.target_value) >= 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min((kpi.current_value / kpi.target_value) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Análisis de Tendencias y Pronósticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Tendencias */}
        {trendData && (
          <div className="card-container p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">📈 Análisis de Tendencias</h2>
            <Line 
              data={trendData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Evolución de KPIs Principales'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: false
                  }
                }
              }}
            />
          </div>
        )}

        {/* Gráfico de Pronósticos */}
        {forecastData && (
          <div className="card-container p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">🔮 Pronósticos</h2>
            <Bar 
              data={forecastData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Proyecciones Financieras'
                  }
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Business Insights */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">💡 Business Insights</h2>
        
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {insight.type === 'opportunity' ? '🎯' : 
                     insight.type === 'risk' ? '⚠️' : 
                     insight.type === 'pattern' ? '🔍' : '💡'}
                  </span>
                  <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                </div>
                
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                    {insight.priority.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {insight.confidence.toFixed(1)}% confianza
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-3">{insight.description}</p>
              
              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                <div className="text-sm font-medium text-gray-900 mb-1">Impacto Estimado:</div>
                <div className="text-sm text-gray-700">{insight.estimated_impact}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-900 mb-2">Acciones Recomendadas:</div>
                <ul className="space-y-1">
                  {insight.recommended_actions.map((action, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-4 flex space-x-3">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  📋 Crear Plan de Acción
                </button>
                <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                  📊 Ver Detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Planes de Mejora y Sugerencias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Planes de Mejora */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">🚀 Planes de Mejora</h2>
          
          <div className="space-y-4">
            {improvementPlans.map((plan) => (
              <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                    {plan.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <p className="text-gray-700 text-sm mb-3">{plan.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-500">ROI Estimado</div>
                    <div className="font-semibold text-green-600">{plan.estimated_roi.toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Inversión</div>
                    <div className="font-semibold">S/ {plan.estimated_investment.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progreso</span>
                    <span>{plan.progress_percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${plan.progress_percentage}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Acciones: {plan.completed_actions}/{plan.actions_count}</span>
                  <span>Fecha objetivo: {plan.target_completion_date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sugerencias Inteligentes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">🤖 Sugerencias Inteligentes</h2>
          
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{suggestion.title}</h3>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(suggestion.urgency)}`}>
                      {suggestion.urgency.toUpperCase()}
                    </span>
                    {suggestion.is_accepted && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        ✓ ACEPTADA
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-700 text-sm mb-3">{suggestion.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  {suggestion.potential_savings > 0 && (
                    <div>
                      <div className="text-xs text-gray-500">Ahorros Potenciales</div>
                      <div className="font-semibold text-green-600">S/ {suggestion.potential_savings.toLocaleString()}</div>
                    </div>
                  )}
                  {suggestion.potential_revenue > 0 && (
                    <div>
                      <div className="text-xs text-gray-500">Ingresos Potenciales</div>
                      <div className="font-semibold text-blue-600">S/ {suggestion.potential_revenue.toLocaleString()}</div>
                    </div>
                  )}
                </div>
                
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">Confianza: {suggestion.confidence_score.toFixed(1)}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-green-500 h-1 rounded-full"
                      style={{ width: `${suggestion.confidence_score}%` }}
                    />
                  </div>
                </div>
                
                {!suggestion.is_reviewed && (
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded text-sm hover:bg-green-700">
                      ✓ Aceptar
                    </button>
                    <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded text-sm hover:bg-gray-700">
                      ✗ Rechazar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benchmarking vs Industria */}
      {benchmarkData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🏆 Benchmarking vs Industria</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Bar 
                data={benchmarkData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'Comparativo de Rendimiento'
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100
                    }
                  }
                }}
              />
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Análisis de Posicionamiento:</h3>
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="font-medium text-green-800">🏅 Fortalezas Destacadas</div>
                  <ul className="text-sm text-green-700 mt-1 space-y-1">
                    <li>• Margen de ganancia 29% superior al promedio</li>
                    <li>• Eficiencia operacional en el top 10%</li>
                    <li>• Satisfacción del cliente por encima del benchmark</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="font-medium text-yellow-800">⚠️ Áreas de Oportunidad</div>
                  <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                    <li>• Velocidad de cotización: 19% bajo el líder del sector</li>
                    <li>• Oportunidad de mejora en procesos digitales</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessIntelligenceDashboard;