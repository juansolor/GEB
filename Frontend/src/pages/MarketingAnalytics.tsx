import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import * as XLSX from 'xlsx';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface MarketingPlatform {
  id: number;
  name: string;
  platform_type: 'google_ads' | 'instagram' | 'facebook_ads' | 'linkedin_ads' | 'tiktok_ads' | 'youtube_ads';
  account_id: string;
  is_active: boolean;
  last_sync: string | null;
  status: 'active' | 'inactive' | 'sync_needed';
  campaigns_count: number;
}

interface MarketingCampaign {
  id: number;
  name: string;
  platform_name: string;
  platform_type: string;
  status: 'active' | 'paused' | 'ended' | 'draft';
  daily_budget: number;
  total_spend: number;
  total_conversions: number;
  avg_ctr: number;
  avg_conversion_rate: number;
  roas: number;
  performance_status: 'excellent' | 'good' | 'average' | 'poor';
}

interface MarketingMetrics {
  date: string;
  spend: number;
  revenue: number;
  clicks: number;
  conversions: number;
  impressions: number;
  roas: number;
  ctr: number;
}

interface MarketingInsight {
  id: number;
  title: string;
  description: string;
  insight_type: 'performance' | 'audience' | 'creative' | 'budget' | 'optimization' | 'trend';
  priority: 'low' | 'medium' | 'high' | 'critical';
  recommended_actions: string[];
  confidence_score: number;
  acknowledged: boolean;
  created_at: string;
}

interface DashboardData {
  total_spend: number;
  total_revenue: number;
  total_conversions: number;
  total_impressions: number;
  total_clicks: number;
  overall_roas: number;
  overall_ctr: number;
  overall_conversion_rate: number;
  platform_performance: Array<{
    platform: string;
    name: string;
    spend: number;
    revenue: number;
    conversions: number;
    roas: number;
  }>;
  recent_insights: MarketingInsight[];
}

const MarketingAnalytics: React.FC = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState<'dashboard' | 'platforms' | 'campaigns' | 'insights' | 'audience'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de datos
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [platforms, setPlatforms] = useState<MarketingPlatform[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [insights, setInsights] = useState<MarketingInsight[]>([]);
  const [trendsData, setTrendsData] = useState<MarketingMetrics[]>([]);
  
  // Estados de filtros
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  
  // Estados de modales
  const [showPlatformConfig, setShowPlatformConfig] = useState(false);
  const [showInsightDetails, setShowInsightDetails] = useState<MarketingInsight | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadDashboardData();
    loadPlatforms();
    loadInsights();
    loadTrendsData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, selectedPlatform]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        start_date: dateRange.start,
        end_date: dateRange.end
      });
      
      const response = await fetch(`/api/marketing-analytics/dashboard/overview/?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        throw new Error('Error al cargar datos del dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const loadPlatforms = async () => {
    try {
      const response = await fetch('/api/marketing-analytics/platforms/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlatforms(data.results || data);
      }
    } catch (err) {
      console.error('Error loading platforms:', err);
    }
  };

  const loadCampaigns = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedPlatform !== 'all') {
        params.append('platform', selectedPlatform);
      }
      
      const response = await fetch(`/api/marketing-analytics/campaigns/?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.results || data);
      }
    } catch (err) {
      console.error('Error loading campaigns:', err);
    }
  };

  const loadInsights = async () => {
    try {
      const response = await fetch('/api/marketing-analytics/insights/?active_only=true', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setInsights(data.results || data);
      }
    } catch (err) {
      console.error('Error loading insights:', err);
    }
  };

  const loadTrendsData = async () => {
    try {
      const days = Math.ceil((new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) / (1000 * 60 * 60 * 24));
      const response = await fetch(`/api/marketing-analytics/dashboard/performance-trends/?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTrendsData(data.daily_trends || []);
      }
    } catch (err) {
      console.error('Error loading trends:', err);
    }
  };

  const syncPlatformData = async (platformId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/marketing-analytics/platforms/${platformId}/sync_data/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days_back: 7 })
      });
      
      if (response.ok) {
        await loadPlatforms();
        await loadDashboardData();
        setError(null);
      } else {
        throw new Error('Error al sincronizar datos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de sincronización');
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeInsight = async (insightId: number) => {
    try {
      const response = await fetch(`/api/marketing-analytics/insights/${insightId}/acknowledge/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        await loadInsights();
      }
    } catch (err) {
      console.error('Error acknowledging insight:', err);
    }
  };

  const exportToExcel = () => {
    if (!dashboardData) return;

    const wb = XLSX.utils.book_new();
    
    // Dashboard Overview
    const overviewData = [
      ['Métrica', 'Valor'],
      ['Gasto Total', `$${dashboardData.total_spend.toLocaleString()}`],
      ['Ingresos Totales', `$${dashboardData.total_revenue.toLocaleString()}`],
      ['Conversiones Totales', dashboardData.total_conversions.toLocaleString()],
      ['Impresiones Totales', dashboardData.total_impressions.toLocaleString()],
      ['Clics Totales', dashboardData.total_clicks.toLocaleString()],
      ['ROAS General', `${dashboardData.overall_roas}%`],
      ['CTR General', `${dashboardData.overall_ctr}%`],
      ['Tasa de Conversión', `${dashboardData.overall_conversion_rate}%`]
    ];
    
    const overviewWs = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, overviewWs, 'Resumen');
    
    // Platform Performance
    if (dashboardData.platform_performance.length > 0) {
      const platformHeaders = ['Plataforma', 'Nombre', 'Gasto', 'Ingresos', 'Conversiones', 'ROAS'];
      const platformData = [
        platformHeaders,
        ...dashboardData.platform_performance.map(p => [
          p.platform,
          p.name,
          p.spend,
          p.revenue,
          p.conversions,
          `${p.roas}%`
        ])
      ];
      
      const platformWs = XLSX.utils.aoa_to_sheet(platformData);
      XLSX.utils.book_append_sheet(wb, platformWs, 'Rendimiento por Plataforma');
    }
    
    // Trends Data
    if (trendsData.length > 0) {
      const trendsHeaders = ['Fecha', 'Gasto', 'Ingresos', 'Clics', 'Conversiones', 'Impresiones', 'ROAS', 'CTR'];
      const trendsExportData = [
        trendsHeaders,
        ...trendsData.map(t => [
          t.date,
          t.spend,
          t.revenue,
          t.clicks,
          t.conversions,
          t.impressions,
          `${t.roas}%`,
          `${t.ctr}%`
        ])
      ];
      
      const trendsWs = XLSX.utils.aoa_to_sheet(trendsExportData);
      XLSX.utils.book_append_sheet(wb, trendsWs, 'Tendencias Diarias');
    }
    
    const fileName = `marketing_analytics_${dateRange.start}_${dateRange.end}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Configurar datos para gráficos
  const trendsChartData = {
    labels: trendsData.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'ROAS (%)',
        data: trendsData.map(d => d.roas),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'CTR (%)',
        data: trendsData.map(d => d.ctr),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: false,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  const spendRevenueChartData = {
    labels: trendsData.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Gasto',
        data: trendsData.map(d => d.spend),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1
      },
      {
        label: 'Ingresos',
        data: trendsData.map(d => d.revenue),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      }
    ]
  };

  const platformDistributionData = {
    labels: dashboardData?.platform_performance.map(p => p.name) || [],
    datasets: [{
      data: dashboardData?.platform_performance.map(p => p.spend) || [],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)',
        'rgb(168, 85, 247)',
        'rgb(236, 72, 153)'
      ],
      borderWidth: 2
    }]
  };

  const getPlatformIcon = (platformType: string) => {
    const icons: Record<string, string> = {
      google_ads: '🎯',
      instagram: '📷',
      facebook_ads: '👥',
      linkedin_ads: '💼',
      tiktok_ads: '🎵',
      youtube_ads: '📹'
    };
    return icons[platformType] || '📊';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-blue-600 bg-blue-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-orange-600 bg-orange-100',
      critical: 'text-red-600 bg-red-100'
    };
    return colors[priority] || 'text-gray-600 bg-gray-100';
  };

  const getPerformanceColor = (status: string) => {
    const colors: Record<string, string> = {
      excellent: 'text-green-600 bg-green-100',
      good: 'text-blue-600 bg-blue-100',
      average: 'text-yellow-600 bg-yellow-100',
      poor: 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de marketing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                📊 Marketing Analytics
              </h1>
              <p className="text-gray-600 text-lg">
                Análisis integral de Google Ads, Instagram y otras plataformas digitales
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Date Range Selector */}
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
              >
                📊 Exportar Excel
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {[
                { key: 'dashboard', label: '📈 Dashboard', icon: '📈' },
                { key: 'platforms', label: '🔗 Plataformas', icon: '🔗' },
                { key: 'campaigns', label: '🎯 Campañas', icon: '🎯' },
                { key: 'insights', label: '💡 Insights', icon: '💡' },
                { key: 'audience', label: '👥 Audiencia', icon: '👥' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key as any);
                    if (tab.key === 'campaigns') loadCampaigns();
                  }}
                  className={`${
                    activeTab === tab.key
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && dashboardData && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Gasto Total</p>
                    <p className="text-2xl font-bold text-gray-900">${dashboardData.total_spend.toLocaleString()}</p>
                  </div>
                  <div className="ml-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <span className="text-2xl">💸</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Ingresos</p>
                    <p className="text-2xl font-bold text-gray-900">${dashboardData.total_revenue.toLocaleString()}</p>
                  </div>
                  <div className="ml-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <span className="text-2xl">💰</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">ROAS</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.overall_roas}%</p>
                  </div>
                  <div className="ml-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <span className="text-2xl">📊</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Conversiones</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.total_conversions.toLocaleString()}</p>
                  </div>
                  <div className="ml-4">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <span className="text-2xl">🎯</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Trends Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencias de Rendimiento</h3>
                <div className="h-80">
                  <Line
                    data={trendsChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'top' as const }
                      },
                      scales: {
                        y: {
                          type: 'linear' as const,
                          display: true,
                          position: 'left' as const,
                          title: { display: true, text: 'ROAS (%)' }
                        },
                        y1: {
                          type: 'linear' as const,
                          display: true,
                          position: 'right' as const,
                          title: { display: true, text: 'CTR (%)' },
                          grid: { drawOnChartArea: false }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Spend vs Revenue */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gasto vs Ingresos</h3>
                <div className="h-80">
                  <Bar
                    data={spendRevenueChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'top' as const }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: { display: true, text: 'Monto ($)' }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Platform Performance and Platform Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Platform Performance Table */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento por Plataforma</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Plataforma
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Gasto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ingresos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ROAS
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardData.platform_performance.map((platform, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="mr-2">{getPlatformIcon(platform.platform)}</span>
                              <span className="text-sm font-medium text-gray-900">{platform.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${platform.spend.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${platform.revenue.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              platform.roas >= 200 ? 'bg-green-100 text-green-800' :
                              platform.roas >= 100 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {platform.roas}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Platform Distribution */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Gasto</h3>
                <div className="h-64">
                  <Doughnut
                    data={platformDistributionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom' as const }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Recent Insights */}
            {dashboardData.recent_insights && dashboardData.recent_insights.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Insights Recientes</h3>
                <div className="space-y-4">
                  {dashboardData.recent_insights.slice(0, 3).map((insight) => (
                    <div key={insight.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                              {insight.priority}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(insight.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                          <p className="text-sm text-gray-600">{insight.description}</p>
                        </div>
                        <button
                          onClick={() => setShowInsightDetails(insight)}
                          className="ml-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Platforms Tab */}
        {activeTab === 'platforms' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Plataformas de Marketing</h2>
              <button
                onClick={() => setShowPlatformConfig(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                ➕ Agregar Plataforma
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platforms.map((platform) => (
                <div key={platform.id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{getPlatformIcon(platform.platform_type)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                        <p className="text-sm text-gray-600">{platform.platform_type}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      platform.status === 'active' ? 'bg-green-100 text-green-800' :
                      platform.status === 'sync_needed' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {platform.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Campañas activas:</span>
                      <span className="font-medium">{platform.campaigns_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Última sincronización:</span>
                      <span className="font-medium">
                        {platform.last_sync ? new Date(platform.last_sync).toLocaleDateString() : 'Nunca'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => syncPlatformData(platform.id)}
                      disabled={loading}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      🔄 Sincronizar
                    </button>
                    <button className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors duration-200">
                      ⚙️ Configurar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Campañas de Marketing</h2>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todas las plataformas</option>
                {platforms.map((platform) => (
                  <option key={platform.id} value={platform.id.toString()}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campaña
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plataforma
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Presupuesto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ROAS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CTR
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rendimiento
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                            <div className="text-sm text-gray-500">
                              Gasto: ${campaign.total_spend.toLocaleString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="mr-2">{getPlatformIcon(campaign.platform_type)}</span>
                            <span className="text-sm text-gray-900">{campaign.platform_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                            campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                            campaign.status === 'ended' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${campaign.daily_budget.toLocaleString()}/día
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            campaign.roas >= 200 ? 'bg-green-100 text-green-800' :
                            campaign.roas >= 100 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {campaign.roas}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {campaign.avg_ctr}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPerformanceColor(campaign.performance_status)}`}>
                            {campaign.performance_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">💡 Insights de Marketing</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {insights.filter(i => i.priority === 'critical').length}
                </div>
                <div className="text-sm text-gray-600">Críticos</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {insights.filter(i => i.priority === 'high').length}
                </div>
                <div className="text-sm text-gray-600">Alta Prioridad</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {insights.filter(i => i.priority === 'medium').length}
                </div>
                <div className="text-sm text-gray-600">Media Prioridad</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {insights.filter(i => i.priority === 'low').length}
                </div>
                <div className="text-sm text-gray-600">Baja Prioridad</div>
              </div>
            </div>

            <div className="space-y-4">
              {insights.map((insight) => (
                <div key={insight.id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(insight.priority)}`}>
                          {insight.priority.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(insight.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-500">
                          Confianza: {insight.confidence_score}%
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h3>
                      <p className="text-gray-600 mb-4">{insight.description}</p>
                      
                      {insight.recommended_actions.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Acciones Recomendadas:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {insight.recommended_actions.map((action, index) => (
                              <li key={index}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex gap-2">
                      <button
                        onClick={() => setShowInsightDetails(insight)}
                        className="px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                      >
                        Ver Detalles
                      </button>
                      {!insight.acknowledged && (
                        <button
                          onClick={() => acknowledgeInsight(insight.id)}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                        >
                          ✓ Marcar como Visto
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {insights.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💡</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No hay insights disponibles</h3>
                  <p className="text-gray-600">Los insights se generarán automáticamente cuando haya datos suficientes.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Audience Tab */}
        {activeTab === 'audience' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">👥 Análisis de Audiencia</h2>
            
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Próximamente</h3>
              <p className="text-gray-600">
                Los análisis de audiencia estarán disponibles una vez que se configuren las plataformas 
                y se recopilen datos demográficos y de comportamiento.
              </p>
            </div>
          </div>
        )}

        {/* Platform Configuration Modal */}
        {showPlatformConfig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurar Nueva Plataforma</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Plataforma
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Seleccionar plataforma...</option>
                    <option value="google_ads">Google Ads</option>
                    <option value="instagram">Instagram Business</option>
                    <option value="facebook_ads">Facebook Ads</option>
                    <option value="linkedin_ads">LinkedIn Ads</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Plataforma
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ej: Mi Cuenta de Google Ads"
                  />
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Para completar la configuración, necesitarás las credenciales API de la plataforma seleccionada. 
                    Esto incluye tokens de acceso, IDs de cuenta, y claves de desarrollador.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPlatformConfig(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                  Configurar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Insight Details Modal */}
        {showInsightDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{showInsightDetails.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(showInsightDetails.priority)}`}>
                      {showInsightDetails.priority}
                    </span>
                    <span className="text-sm text-gray-500">
                      Confianza: {showInsightDetails.confidence_score}%
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowInsightDetails(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Descripción:</h4>
                  <p className="text-gray-600">{showInsightDetails.description}</p>
                </div>
                
                {showInsightDetails.recommended_actions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Acciones Recomendadas:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {showInsightDetails.recommended_actions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-sm text-gray-500">
                    Creado: {new Date(showInsightDetails.created_at).toLocaleDateString()}
                  </span>
                  {!showInsightDetails.acknowledged && (
                    <button
                      onClick={() => {
                        acknowledgeInsight(showInsightDetails.id);
                        setShowInsightDetails(null);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                      ✓ Marcar como Visto
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingAnalytics;