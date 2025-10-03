import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  BarElement 
} from 'chart.js/auto';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Interfaces para el sistema de matriz dinámica
export interface CostMatrix {
  id: number;
  name: string;
  matrix_type: 'standard' | 'premium' | 'economy' | 'enterprise' | 'government' | 'custom';
  base_margin: number;
  administrative_overhead: number;
  complexity_multipliers: Record<string, number>;
  volume_tiers: Record<string, { min: number; max: number; discount: number }>;
  seasonal_adjustments: Record<string, number>;
  location_multipliers: Record<string, number>;
  risk_premiums: Record<string, number>;
  is_default: boolean;
  effective_date: string;
  expiry_date?: string;
}

export interface Company {
  id: number;
  name: string;
  trade_name?: string;
  tax_id: string;
  industry: string;
  company_size: string;
  risk_level: 'low' | 'medium' | 'high' | 'premium';
  volume_discount: number;
  loyalty_discount: number;
  risk_premium: number;
  payment_terms: number;
  total_projects_value: number;
  average_project_margin: number;
}

export interface PricingRecommendation {
  type: string;
  title: string;
  description: string;
  recommended_margin: number;
  confidence_level: number;
  success_rate?: number;
  volume_discount?: number;
  factors: string[];
}

export interface DynamicPricingResult {
  base_cost: number;
  complexity_adjusted_cost: number;
  administrative_cost: number;
  location_adjusted_cost: number;
  margin_percentage: number;
  margin_amount: number;
  subtotal: number;
  volume_discount_percentage: number;
  volume_discount_amount: number;
  final_price: number;
  effective_margin: number;
}

export interface PricingScenario {
  id: number;
  name: string;
  description: string;
  scenario_params: Record<string, any>;
  total_cost?: number;
  total_price?: number;
  effective_margin?: number;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor: string | string[];
  }>;
}

export interface ChartDataState {
  marginComparison: ChartData | null;
  volumeAnalysis: ChartData | null;
  seasonalTrends: ChartData | null;
}

const DynamicPricingMatrix: React.FC = () => {
  const [matrices, setMatrices] = useState<CostMatrix[]>([]);
  const [selectedMatrix, setSelectedMatrix] = useState<CostMatrix | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  // const [scenarios, setScenarios] = useState<PricingScenario[]>([]);
  const [recommendations, setRecommendations] = useState<PricingRecommendation[]>([]);
  
  // Estado para el simulador de precios
  const [simulatorParams, setSimulatorParams] = useState({
    base_cost: 10000,
    complexity: 'moderate',
    location: 'lima',
    project_value: 50000,
    risk_level: 'medium',
    timeline_days: 30,
    payment_terms: 30
  });
  
  const [pricingResult, setPricingResult] = useState<DynamicPricingResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Datos para gráficos
  const [chartData, setChartData] = useState<ChartDataState>({
    marginComparison: null,
    volumeAnalysis: null,
    seasonalTrends: null
  });

  useEffect(() => {
    loadInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Cargar matrices de costo disponibles
      // En implementación real, estas serían llamadas a la API
      const mockMatrices: CostMatrix[] = [
        {
          id: 1,
          name: 'Matriz Estándar 2024',
          matrix_type: 'standard',
          base_margin: 20.0,
          administrative_overhead: 15.0,
          complexity_multipliers: {
            simple: 1.0,
            moderate: 1.2,
            complex: 1.5,
            critical: 2.0
          },
          volume_tiers: {
            tier1: { min: 0, max: 50000, discount: 0 },
            tier2: { min: 50000, max: 200000, discount: 5 },
            tier3: { min: 200000, max: 500000, discount: 10 },
            tier4: { min: 500000, max: Infinity, discount: 15 }
          },
          seasonal_adjustments: {
            '1': 1.0, '2': 0.95, '3': 0.9, '4': 0.9,
            '5': 1.0, '6': 1.05, '7': 1.1, '8': 1.1,
            '9': 1.05, '10': 1.0, '11': 0.95, '12': 1.2
          },
          location_multipliers: {
            lima: 1.0,
            provincia: 1.15,
            selva: 1.30,
            sierra: 1.20
          },
          risk_premiums: {
            low: 0.0,
            medium: 5.0,
            high: 15.0,
            critical: 25.0
          },
          is_default: true,
          effective_date: '2024-01-01'
        }
      ];
      
      setMatrices(mockMatrices);
      setSelectedMatrix(mockMatrices[0]);
      
      // Simular carga de empresas
      const mockCompanies: Company[] = [
        {
          id: 1,
          name: 'Constructora ABC S.A.C.',
          tax_id: '20123456789',
          industry: 'construction',
          company_size: 'large',
          risk_level: 'low',
          volume_discount: 5.0,
          loyalty_discount: 3.0,
          risk_premium: 0.0,
          payment_terms: 30,
          total_projects_value: 2500000,
          average_project_margin: 22.5
        }
      ];
      
      setCompanies(mockCompanies);
      
      generateChartData();
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateDynamicPricing = () => {
    if (!selectedMatrix) return;

    // Simulación del cálculo de pricing dinámico
    const baseCost = simulatorParams.base_cost;
    let workingCost = baseCost;

    // Factor de complejidad
    const complexityFactor = selectedMatrix.complexity_multipliers[simulatorParams.complexity] || 1.0;
    workingCost *= complexityFactor;

    // Gastos administrativos
    const adminCost = workingCost * (selectedMatrix.administrative_overhead / 100);
    workingCost += adminCost;

    // Factor de ubicación
    const locationFactor = selectedMatrix.location_multipliers[simulatorParams.location] || 1.0;
    workingCost *= locationFactor;

    // Prima de riesgo
    const riskPremium = selectedMatrix.risk_premiums[simulatorParams.risk_level] || 0;
    const marginPercentage = selectedMatrix.base_margin + riskPremium;

    // Margen
    const marginAmount = workingCost * (marginPercentage / 100);
    const subtotal = workingCost + marginAmount;

    // Descuento por volumen
    let volumeDiscount = 0;
    for (const tier of Object.values(selectedMatrix.volume_tiers)) {
      if (simulatorParams.project_value >= tier.min && simulatorParams.project_value < tier.max) {
        volumeDiscount = tier.discount;
        break;
      }
    }

    const volumeDiscountAmount = subtotal * (volumeDiscount / 100);
    const finalPrice = subtotal - volumeDiscountAmount;

    const result: DynamicPricingResult = {
      base_cost: baseCost,
      complexity_adjusted_cost: baseCost * complexityFactor,
      administrative_cost: adminCost,
      location_adjusted_cost: workingCost - adminCost,
      margin_percentage: marginPercentage,
      margin_amount: marginAmount,
      subtotal: subtotal,
      volume_discount_percentage: volumeDiscount,
      volume_discount_amount: volumeDiscountAmount,
      final_price: finalPrice,
      effective_margin: ((finalPrice - baseCost) / baseCost) * 100
    };

    setPricingResult(result);
    generateRecommendations();
  };

  const generateRecommendations = () => {
    // Simulación de recomendaciones inteligentes
    const mockRecommendations: PricingRecommendation[] = [
      {
        type: 'historical',
        title: 'Recomendación Histórica',
        description: 'Basado en 15 análisis similares',
        recommended_margin: 22.5,
        confidence_level: 85,
        success_rate: 78,
        factors: ['Histórico de categoría', 'Proyectos ejecutados', 'Tasa de éxito 78%']
      },
      {
        type: 'market',
        title: 'Análisis de Mercado',
        description: 'Margen típico del sector construcción',
        recommended_margin: 25.0,
        confidence_level: 75,
        factors: ['Benchmarking sectorial', 'Análisis competitivo']
      }
    ];

    if (selectedCompany) {
      mockRecommendations.push({
        type: 'company_specific',
        title: `Recomendación para ${selectedCompany.name}`,
        description: 'Basado en histórico y perfil de riesgo',
        recommended_margin: selectedCompany.average_project_margin,
        confidence_level: 90,
        volume_discount: selectedCompany.volume_discount + selectedCompany.loyalty_discount,
        factors: [
          `Margen histórico: ${selectedCompany.average_project_margin}%`,
          `Riesgo: ${selectedCompany.risk_level}`,
          `Descuento efectivo: ${selectedCompany.volume_discount + selectedCompany.loyalty_discount}%`
        ]
      });
    }

    setRecommendations(mockRecommendations);
  };

  const generateChartData = () => {
    // Datos para gráfico de comparación de márgenes
    const marginData = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
      datasets: [
        {
          label: 'Margen Objetivo',
          data: [20, 20, 20, 20, 20, 20],
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
        },
        {
          label: 'Margen Actual',
          data: [18, 22, 19, 25, 21, 23],
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
        }
      ]
    };

    // Datos para análisis de volumen
    const volumeData = {
      labels: ['0-50K', '50K-200K', '200K-500K', '500K+'],
      datasets: [
        {
          label: 'Número de Proyectos',
          data: [25, 15, 8, 3],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 205, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)'
          ],
        }
      ]
    };

    setChartData({
      marginComparison: marginData,
      volumeAnalysis: volumeData,
      seasonalTrends: null
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-container p-6">
        <h1 className="text-3xl font-bold text-primary mb-4">
          🎯 Matriz de Costos Dinámicos
        </h1>
        <p className="text-secondary">
          Sistema inteligente de pricing con recomendaciones basadas en IA y análisis de mercado.
        </p>
      </div>

      {/* Configuración de Matriz */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-container p-6">
          <h2 className="text-xl font-semibold mb-4 text-primary">⚙️ Configuración de Matriz</h2>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">
                Matriz de Costos
              </label>
              <select 
                className="input-field w-full"
                value={selectedMatrix?.id || ''}
                onChange={(e) => {
                  const matrix = matrices.find(m => m.id === parseInt(e.target.value));
                  setSelectedMatrix(matrix || null);
                }}
              >
                {matrices.map(matrix => (
                  <option key={matrix.id} value={matrix.id}>
                    {matrix.name} {matrix.is_default ? '(Por Defecto)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa/Cliente
              </label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedCompany?.id || ''}
                onChange={(e) => {
                  const company = companies.find(c => c.id === parseInt(e.target.value));
                  setSelectedCompany(company || null);
                }}
              >
                <option value="">Seleccionar empresa...</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name} - {company.risk_level}
                  </option>
                ))}
              </select>
            </div>

            {selectedMatrix && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">Configuración Actual:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Margen Base: {selectedMatrix.base_margin}%</div>
                  <div>Gastos Admin: {selectedMatrix.administrative_overhead}%</div>
                  <div>Tipo: {selectedMatrix.matrix_type}</div>
                  <div>Vigencia: {selectedMatrix.effective_date}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Simulador de Precios */}
        <div className="card-container p-6">
          <h2 className="text-xl font-semibold mb-4 text-primary">🧮 Simulador de Precios</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">
                  Costo Base (S/)
                </label>
                <input
                  type="number"
                  className="input-field w-full"
                  value={simulatorParams.base_cost}
                  onChange={(e) => setSimulatorParams(prev => ({
                    ...prev,
                    base_cost: parseFloat(e.target.value) || 0
                  }))}
                />
              </div>

              <div>
                <label className="form-label">
                  Valor del Proyecto (S/)
                </label>
                <input
                  type="number"
                  className="input-field w-full"
                  value={simulatorParams.project_value}
                  onChange={(e) => setSimulatorParams(prev => ({
                    ...prev,
                    project_value: parseFloat(e.target.value) || 0
                  }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complejidad
                </label>
                <select
                  className="input-field w-full"
                  value={simulatorParams.complexity}
                  onChange={(e) => setSimulatorParams(prev => ({
                    ...prev,
                    complexity: e.target.value
                  }))}
                >
                  <option value="simple">Simple</option>
                  <option value="moderate">Moderado</option>
                  <option value="complex">Complejo</option>
                  <option value="critical">Crítico</option>
                </select>
              </div>

              <div>
                <label className="form-label">
                  Ubicación
                </label>
                <select
                  className="input-field w-full"
                  value={simulatorParams.location}
                  onChange={(e) => setSimulatorParams(prev => ({
                    ...prev,
                    location: e.target.value
                  }))}
                >
                  <option value="lima">Lima</option>
                  <option value="provincia">Provincia</option>
                  <option value="selva">Selva</option>
                  <option value="sierra">Sierra</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">
                  Nivel de Riesgo
                </label>
                <select
                  className="input-field w-full"
                  value={simulatorParams.risk_level}
                  onChange={(e) => setSimulatorParams(prev => ({
                    ...prev,
                    risk_level: e.target.value
                  }))}
                >
                  <option value="low">Bajo</option>
                  <option value="medium">Medio</option>
                  <option value="high">Alto</option>
                  <option value="critical">Crítico</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plazo (días)
                </label>
                <input
                  type="number"
                  className="input-field w-full"
                  value={simulatorParams.timeline_days}
                  onChange={(e) => setSimulatorParams(prev => ({
                    ...prev,
                    timeline_days: parseInt(e.target.value) || 30
                  }))}
                />
              </div>
            </div>

            <button
              onClick={simulateDynamicPricing}
              className="btn btn-primary w-full py-2 px-4"
            >
              🎯 Calcular Precio Dinámico
            </button>
          </div>
        </div>
      </div>

      {/* Resultados del Simulador */}
      {pricingResult && (
        <div className="card-container p-6">
          <h2 className="text-xl font-semibold mb-4 text-primary">📊 Resultado del Pricing Dinámico</h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="metric-card bg-primary-50">
              <div className="text-sm text-muted">Costo Base</div>
              <div className="metric-value text-2xl text-primary">
                S/ {pricingResult.base_cost.toLocaleString()}
              </div>
            </div>
            
            <div className="metric-card bg-secondary-50">
              <div className="text-sm text-muted">Precio Final</div>
              <div className="metric-value text-2xl text-success">
                S/ {pricingResult.final_price.toLocaleString()}
              </div>
            </div>
            
            <div className="metric-card bg-purple-50">
              <div className="text-sm text-muted">Margen Efectivo</div>
              <div className="metric-value text-2xl" style={{color: '#8b5cf6'}}>
                {pricingResult.effective_margin.toFixed(2)}%
              </div>
            </div>
            
            <div className="metric-card bg-accent-50">
              <div className="text-sm text-muted">Descuento Volumen</div>
              <div className="metric-value text-2xl text-warning">
                {pricingResult.volume_discount_percentage.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Desglose Detallado */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Desglose de Cálculo:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Costo Base:</span>
                <span>S/ {pricingResult.base_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Ajuste por Complejidad:</span>
                <span>S/ {pricingResult.complexity_adjusted_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Gastos Administrativos:</span>
                <span>S/ {pricingResult.administrative_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Margen ({pricingResult.margin_percentage.toFixed(2)}%):</span>
                <span>S/ {pricingResult.margin_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2">
                <span>Subtotal:</span>
                <span>S/ {pricingResult.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Descuento por Volumen:</span>
                <span>- S/ {pricingResult.volume_discount_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>PRECIO FINAL:</span>
                <span>S/ {pricingResult.final_price.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recomendaciones Inteligentes */}
      {recommendations.length > 0 && (
        <div className="card-container p-6">
          <h2 className="text-xl font-semibold mb-4 text-primary">🤖 Recomendaciones Inteligentes</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="form-section">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-primary">{rec.title}</h3>
                  <div className="badge badge-primary">
                    {rec.confidence_level}% confianza
                  </div>
                </div>
                
                <p className="text-secondary text-sm mb-3">{rec.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Margen recomendado:</span>
                    <span className="font-semibold">{rec.recommended_margin}%</span>
                  </div>
                  
                  {rec.success_rate && (
                    <div className="flex justify-between">
                      <span className="text-sm">Tasa de éxito:</span>
                      <span className="font-semibold text-green-600">{rec.success_rate}%</span>
                    </div>
                  )}
                  
                  {rec.volume_discount && (
                    <div className="flex justify-between">
                      <span className="text-sm">Descuento disponible:</span>
                      <span className="font-semibold text-blue-600">{rec.volume_discount}%</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <div className="text-xs text-muted mb-1">Factores considerados:</div>
                  <ul className="text-xs space-y-1">
                    {rec.factors.map((factor, i) => (
                      <li key={i} className="text-secondary">• {factor}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard de Análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Comparación de Márgenes */}
        {chartData.marginComparison && (
          <div className="card-container p-6">
            <h3 className="text-lg font-semibold mb-4 text-primary">📈 Comparación de Márgenes</h3>
            <Line 
              data={chartData.marginComparison}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Margen Objetivo vs Actual'
                  }
                }
              }}
            />
          </div>
        )}

        {/* Análisis de Volumen */}
        {chartData.volumeAnalysis && (
          <div className="card-container p-6">
            <h3 className="text-lg font-semibold mb-4 text-primary">📊 Distribución por Volumen</h3>
            <Bar 
              data={chartData.volumeAnalysis}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Proyectos por Rango de Valor'
                  }
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicPricingMatrix;