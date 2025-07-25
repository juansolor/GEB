import React, { useState, useEffect } from 'react';
import { 
  getReportTypes, 
  generateSalesReport, 
  generateInventoryReport, 
  generateFinancialReport,
  downloadReport,
  ReportType, 
  SalesReportData, 
  InventoryReportData, 
  FinancialReportData,
  ReportFilters
} from '../utils/reportsApi';
import { SimpleBarChart, SimpleLineChart, StatCard } from '../components/Charts';

const Reports: React.FC = () => {
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState<SalesReportData | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryReportData | null>(null);
  const [financialData, setFinancialData] = useState<FinancialReportData | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    start_date: '',
    end_date: '',
    format: 'json'
  });

  useEffect(() => {
    loadReportTypes();
  }, []);

  const loadReportTypes = async () => {
    try {
      const types = await getReportTypes();
      setReportTypes(types);
    } catch (error) {
      console.error('Error loading report types:', error);
    }
  };

  const generateReport = async (reportType: string) => {
    setLoading(true);
    setActiveReport(reportType);
    
    try {
      switch (reportType) {
        case 'sales':
          const salesReport = await generateSalesReport(filters);
          setSalesData(salesReport);
          break;
        case 'inventory':
          const inventoryReport = await generateInventoryReport(filters);
          setInventoryData(inventoryReport);
          break;
        case 'financial':
          const financialReport = await generateFinancialReport(filters);
          setFinancialData(financialReport);
          break;
        default:
          alert('Tipo de reporte no implementado aún');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format: 'csv' | 'excel') => {
    if (!activeReport) return;

    let generatedAt: string | undefined;
    if (activeReport === 'sales' && salesData) {
      generatedAt = salesData.generated_at;
    } else if (activeReport === 'inventory' && inventoryData) {
      generatedAt = inventoryData.generated_at;
    } else if (activeReport === 'financial' && financialData) {
      generatedAt = financialData.generated_at;
    }

    try {
      await downloadReport(activeReport, filters, format, generatedAt);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error al descargar el reporte');
    }
  };

  const renderReportContent = () => {
    if (!activeReport) return null;

    if (loading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          backgroundColor: 'white',
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
            <div>Generando reporte...</div>
          </div>
        </div>
      );
    }

    switch (activeReport) {
      case 'sales':
        return renderSalesReport();
      case 'inventory':
        return renderInventoryReport();
      case 'financial':
        return renderFinancialReport();
      default:
        return <div>Reporte no implementado</div>;
    }
  };

  const renderSalesReport = () => {
    if (!salesData) return null;

    const productChartData = salesData.top_products.slice(0, 5).map(product => ({
      label: product.product__name.length > 20 ? 
        product.product__name.substring(0, 20) + '...' : 
        product.product__name,
      value: parseFloat(product.total_revenue.toString()),
      color: '#28a745'
    }));

    const dailySalesChartData = salesData.daily_sales.slice(-7).map(day => ({
      label: new Date(day.day).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      value: parseFloat(day.daily_total.toString())
    }));

    return (
      <div style={{ display: 'grid', gap: '20px' }}>
        {/* Resumen */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <StatCard
            title="Ventas Totales"
            value={`$${salesData.summary.total_amount.toLocaleString()}`}
            subtitle={`${salesData.summary.total_sales} transacciones`}
            icon="💰"
            color="#28a745"
          />
          <StatCard
            title="Venta Promedio"
            value={`$${salesData.summary.average_sale.toLocaleString()}`}
            subtitle="Por transacción"
            icon="📊"
            color="#007bff"
          />
          <StatCard
            title="Productos Vendidos"
            value={salesData.top_products.reduce((sum, p) => sum + parseInt(p.total_quantity.toString()), 0)}
            subtitle="Unidades totales"
            icon="📦"
            color="#fd7e14"
          />
        </div>

        {/* Gráficos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <SimpleBarChart
            data={productChartData}
            title="Top 5 Productos por Ingresos"
            valuePrefix="$"
          />
          <SimpleLineChart
            data={dailySalesChartData}
            title="Ventas Últimos 7 Días"
            valuePrefix="$"
          />
        </div>

        {/* Tabla de productos */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ padding: '20px', margin: '0', borderBottom: '1px solid #ddd' }}>Top Productos</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Producto</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>SKU</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Cantidad</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Ingresos</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Ventas</th>
                </tr>
              </thead>
              <tbody>
                {salesData.top_products.map((product, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{product.product__name}</td>
                    <td style={{ padding: '12px', fontFamily: 'monospace' }}>{product.product__sku}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{product.total_quantity}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                      ${parseFloat(product.total_revenue.toString()).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{product.sales_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderInventoryReport = () => {
    if (!inventoryData) return null;

    const categoryChartData = inventoryData.category_breakdown.slice(0, 5).map(category => ({
      label: category.category__name || 'Sin categoría',
      value: category.product_count,
      color: '#17a2b8'
    }));

    return (
      <div style={{ display: 'grid', gap: '20px' }}>
        {/* Resumen */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <StatCard
            title="Total Productos"
            value={inventoryData.summary.total_products}
            subtitle={`${inventoryData.summary.active_products} activos`}
            icon="📦"
            color="#007bff"
          />
          <StatCard
            title="Valor de Inventario"
            value={`$${inventoryData.summary.total_stock_value.toLocaleString()}`}
            subtitle="Costo total en stock"
            icon="💰"
            color="#28a745"
          />
          <StatCard
            title="Stock Bajo"
            value={inventoryData.summary.low_stock_count}
            subtitle="Productos por reabastecer"
            icon="⚠️"
            color="#dc3545"
          />
        </div>

        {/* Gráfico de categorías */}
        <SimpleBarChart
          data={categoryChartData}
          title="Productos por Categoría"
          valueSuffix=" productos"
        />

        {/* Productos con stock bajo */}
        {inventoryData.low_stock_products.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ padding: '20px', margin: '0', borderBottom: '1px solid #ddd', color: '#dc3545' }}>⚠️ Productos con Stock Bajo</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8f9fa' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Producto</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>SKU</th>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Stock Actual</th>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Stock Mínimo</th>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.low_stock_products.map((product, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>{product.name}</td>
                      <td style={{ padding: '12px', fontFamily: 'monospace' }}>{product.sku}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#dc3545', fontWeight: 'bold' }}>
                        {product.stock_quantity}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>{product.min_stock_level}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        ${parseFloat(product.price.toString()).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFinancialReport = () => {
    if (!financialData) return null;

    const expenseChartData = financialData.expense_categories.slice(0, 5).map(category => ({
      label: category.category__name || 'Sin categoría',
      value: parseFloat(category.total_amount.toString()),
      color: '#dc3545'
    }));

    return (
      <div style={{ display: 'grid', gap: '20px' }}>
        {/* Resumen */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <StatCard
            title="Ingresos Totales"
            value={`$${financialData.summary.total_income.toLocaleString()}`}
            subtitle="Período seleccionado"
            icon="💰"
            color="#28a745"
          />
          <StatCard
            title="Gastos Totales"
            value={`$${financialData.summary.total_expenses.toLocaleString()}`}
            subtitle="Período seleccionado"
            icon="💸"
            color="#dc3545"
          />
          <StatCard
            title="Ganancia Neta"
            value={`$${financialData.summary.net_profit.toLocaleString()}`}
            subtitle={`${financialData.summary.profit_margin.toFixed(1)}% margen`}
            icon="📈"
            color={financialData.summary.net_profit >= 0 ? "#28a745" : "#dc3545"}
          />
        </div>

        {/* Gráfico de gastos */}
        <SimpleBarChart
          data={expenseChartData}
          title="Top 5 Categorías de Gastos"
          valuePrefix="$"
        />

        {/* Tabla de gastos por categoría */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ padding: '20px', margin: '0', borderBottom: '1px solid #ddd' }}>Gastos por Categoría</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Categoría</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Total</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Transacciones</th>
                  <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Promedio</th>
                </tr>
              </thead>
              <tbody>
                {financialData.expense_categories.map((category, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{category.category__name || 'Sin categoría'}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                      ${parseFloat(category.total_amount.toString()).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{category.transaction_count}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      ${(parseFloat(category.total_amount.toString()) / category.transaction_count).toLocaleString()}
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

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>📈 Reportes y Análisis</h2>
        <p style={{ color: '#666', margin: '0' }}>
          Genera reportes detallados de ventas, inventario, finanzas y rendimiento del negocio.
        </p>
      </div>

      {/* Filtros de fecha */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Filtros</h3>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666' }}>
              Fecha Inicio:
            </label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666' }}>
              Fecha Fin:
            </label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          {activeReport && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleDownload('csv')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                📄 Descargar CSV
              </button>
              <button
                onClick={() => handleDownload('excel')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                📊 Descargar Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tipos de reportes */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        {reportTypes.map((type) => (
          <div 
            key={type.key}
            style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: activeReport === type.key ? '2px solid #007bff' : '1px solid #ddd',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => generateReport(type.key)}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '24px', marginRight: '10px' }}>{type.icon}</span>
              <h3 style={{ margin: '0', color: '#333' }}>{type.name}</h3>
            </div>
            <p style={{ color: '#666', margin: '0 0 15px 0', fontSize: '14px' }}>
              {type.description}
            </p>
            <button 
              style={{
                backgroundColor: activeReport === type.key ? '#007bff' : '#f8f9fa',
                color: activeReport === type.key ? 'white' : '#007bff',
                border: `1px solid ${activeReport === type.key ? '#007bff' : '#007bff'}`,
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                width: '100%'
              }}
            >
              {activeReport === type.key ? '✅ Reporte Activo' : 'Generar Reporte'}
            </button>
          </div>
        ))}
      </div>

      {/* Contenido del reporte */}
      {renderReportContent()}
    </div>
  );
};

export default Reports;
