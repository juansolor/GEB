from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal
from datetime import datetime, timedelta
import json

User = get_user_model()


class PredictiveModel(models.Model):
    """Modelos predictivos para análisis avanzado"""
    
    MODEL_TYPES = [
        ('sales_forecast', 'Pronóstico de Ventas'),
        ('cost_prediction', 'Predicción de Costos'),
        ('demand_forecast', 'Pronóstico de Demanda'),
        ('risk_assessment', 'Evaluación de Riesgos'),
        ('market_trend', 'Tendencias de Mercado'),
        ('customer_behavior', 'Comportamiento del Cliente'),
        ('resource_optimization', 'Optimización de Recursos'),
        ('profitability_analysis', 'Análisis de Rentabilidad'),
    ]
    
    ALGORITHMS = [
        ('linear_regression', 'Regresión Lineal'),
        ('polynomial_regression', 'Regresión Polinomial'),
        ('random_forest', 'Random Forest'),
        ('neural_network', 'Red Neuronal'),
        ('time_series', 'Series Temporales (ARIMA)'),
        ('svm', 'Support Vector Machine'),
        ('ensemble', 'Métodos de Ensemble'),
    ]
    
    name = models.CharField(max_length=200, verbose_name="Nombre del Modelo")
    model_type = models.CharField(max_length=30, choices=MODEL_TYPES, verbose_name="Tipo de Modelo")
    algorithm = models.CharField(max_length=30, choices=ALGORITHMS, verbose_name="Algoritmo")
    description = models.TextField(verbose_name="Descripción")
    
    # Configuración del modelo
    input_features = models.JSONField(default=list, verbose_name="Variables de Entrada")
    target_variable = models.CharField(max_length=100, verbose_name="Variable Objetivo")
    training_config = models.JSONField(default=dict, verbose_name="Configuración de Entrenamiento")
    
    # Rendimiento del modelo
    accuracy_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name="Precisión (%)")
    r2_score = models.DecimalField(max_digits=5, decimal_places=4, null=True, blank=True, verbose_name="R² Score")
    mae = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name="Error Absoluto Medio")
    rmse = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True, verbose_name="RMSE")
    
    # Estado del modelo
    is_trained = models.BooleanField(default=False, verbose_name="Entrenado")
    is_production_ready = models.BooleanField(default=False, verbose_name="Listo para Producción")
    last_trained_at = models.DateTimeField(null=True, blank=True, verbose_name="Último Entrenamiento")
    
    # Datos de entrenamiento
    training_data_source = models.CharField(max_length=200, blank=True, verbose_name="Fuente de Datos de Entrenamiento")
    training_period_start = models.DateField(null=True, blank=True, verbose_name="Inicio Período Entrenamiento")
    training_period_end = models.DateField(null=True, blank=True, verbose_name="Fin Período Entrenamiento")
    
    # Configuración de re-entrenamiento
    auto_retrain = models.BooleanField(default=False, verbose_name="Re-entrenar Automáticamente")
    retrain_frequency_days = models.IntegerField(default=30, verbose_name="Frecuencia Re-entrenamiento (días)")
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Modelo Predictivo"
        verbose_name_plural = "Modelos Predictivos"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.algorithm})"
    
    def make_prediction(self, input_data):
        """Realiza una predicción con el modelo"""
        if not self.is_production_ready:
            return None
        
        # Implementar lógica de predicción según el algoritmo
        # Por ahora retornamos un placeholder
        return {
            'prediction': 0.0,
            'confidence': 0.85,
            'prediction_date': datetime.now().isoformat()
        }


class MarketIntelligence(models.Model):
    """Inteligencia de mercado y análisis competitivo"""
    
    INTELLIGENCE_TYPES = [
        ('market_size', 'Tamaño de Mercado'),
        ('competitor_analysis', 'Análisis de Competencia'),
        ('pricing_intelligence', 'Inteligencia de Precios'),
        ('customer_segments', 'Segmentos de Clientes'),
        ('market_trends', 'Tendencias de Mercado'),
        ('regulatory_changes', 'Cambios Regulatorios'),
        ('technology_trends', 'Tendencias Tecnológicas'),
        ('economic_indicators', 'Indicadores Económicos'),
    ]
    
    DATA_SOURCES = [
        ('internal', 'Datos Internos'),
        ('surveys', 'Encuestas'),
        ('web_scraping', 'Web Scraping'),
        ('industry_reports', 'Reportes de Industria'),
        ('government_data', 'Datos Gubernamentales'),
        ('third_party_apis', 'APIs de Terceros'),
        ('social_media', 'Redes Sociales'),
        ('news_analysis', 'Análisis de Noticias'),
    ]
    
    title = models.CharField(max_length=200, verbose_name="Título del Análisis")
    intelligence_type = models.CharField(max_length=30, choices=INTELLIGENCE_TYPES, verbose_name="Tipo de Inteligencia")
    description = models.TextField(verbose_name="Descripción")
    
    # Datos del análisis
    data_sources = models.JSONField(default=list, verbose_name="Fuentes de Datos")
    analysis_period_start = models.DateField(verbose_name="Inicio Período Análisis")
    analysis_period_end = models.DateField(verbose_name="Fin Período Análisis")
    
    # Hallazgos principales
    key_findings = models.JSONField(default=list, verbose_name="Hallazgos Clave")
    market_opportunities = models.JSONField(default=list, verbose_name="Oportunidades de Mercado")
    threats_identified = models.JSONField(default=list, verbose_name="Amenazas Identificadas")
    
    # Datos cuantitativos
    market_size_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name="Valor del Mercado")
    growth_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name="Tasa de Crecimiento (%)")
    market_share = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name="Participación de Mercado (%)")
    
    # Análisis de competencia
    main_competitors = models.JSONField(default=list, verbose_name="Principales Competidores")
    competitive_advantages = models.JSONField(default=list, verbose_name="Ventajas Competitivas")
    competitive_disadvantages = models.JSONField(default=list, verbose_name="Desventajas Competitivas")
    
    # Recomendaciones estratégicas
    strategic_recommendations = models.JSONField(default=list, verbose_name="Recomendaciones Estratégicas")
    priority_actions = models.JSONField(default=list, verbose_name="Acciones Prioritarias")
    
    # Validez y actualización
    is_current = models.BooleanField(default=True, verbose_name="Actual")
    expires_at = models.DateField(null=True, blank=True, verbose_name="Expira el")
    confidence_level = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('75.00'), verbose_name="Nivel de Confianza (%)")
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Inteligencia de Mercado"
        verbose_name_plural = "Inteligencia de Mercado"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.intelligence_type})"


class AutomatedReport(models.Model):
    """Reportes automáticos generados por el sistema BI"""
    
    REPORT_TYPES = [
        ('executive_summary', 'Resumen Ejecutivo'),
        ('performance_dashboard', 'Dashboard de Rendimiento'),
        ('financial_analysis', 'Análisis Financiero'),
        ('operational_metrics', 'Métricas Operacionales'),
        ('market_analysis', 'Análisis de Mercado'),
        ('predictive_insights', 'Insights Predictivos'),
        ('improvement_recommendations', 'Recomendaciones de Mejora'),
        ('risk_assessment', 'Evaluación de Riesgos'),
    ]
    
    FREQUENCY_OPTIONS = [
        ('daily', 'Diario'),
        ('weekly', 'Semanal'),
        ('monthly', 'Mensual'),
        ('quarterly', 'Trimestral'),
        ('yearly', 'Anual'),
        ('on_demand', 'Bajo Demanda'),
    ]
    
    OUTPUT_FORMATS = [
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('powerpoint', 'PowerPoint'),
        ('html', 'HTML'),
        ('json', 'JSON'),
        ('csv', 'CSV'),
    ]
    
    name = models.CharField(max_length=200, verbose_name="Nombre del Reporte")
    report_type = models.CharField(max_length=30, choices=REPORT_TYPES, verbose_name="Tipo de Reporte")
    description = models.TextField(verbose_name="Descripción")
    
    # Configuración del reporte
    data_sources = models.JSONField(default=list, verbose_name="Fuentes de Datos")
    filters = models.JSONField(default=dict, verbose_name="Filtros Aplicados")
    kpis_included = models.ManyToManyField('business_intelligence.KPIMetric', blank=True, verbose_name="KPIs Incluidos")
    
    # Configuración de generación
    frequency = models.CharField(max_length=20, choices=FREQUENCY_OPTIONS, verbose_name="Frecuencia")
    output_format = models.CharField(max_length=20, choices=OUTPUT_FORMATS, verbose_name="Formato de Salida")
    auto_generate = models.BooleanField(default=False, verbose_name="Generar Automáticamente")
    
    # Distribución
    recipients = models.ManyToManyField(User, blank=True, verbose_name="Destinatarios")
    email_distribution = models.BooleanField(default=False, verbose_name="Distribución por Email")
    
    # Plantilla y diseño
    template_config = models.JSONField(default=dict, verbose_name="Configuración de Plantilla")
    include_charts = models.BooleanField(default=True, verbose_name="Incluir Gráficos")
    include_tables = models.BooleanField(default=True, verbose_name="Incluir Tablas")
    include_insights = models.BooleanField(default=True, verbose_name="Incluir Insights")
    
    # Estado y ejecución
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    last_generated_at = models.DateTimeField(null=True, blank=True, verbose_name="Última Generación")
    next_generation_at = models.DateTimeField(null=True, blank=True, verbose_name="Próxima Generación")
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Reporte Automático"
        verbose_name_plural = "Reportes Automáticos"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.frequency})"
    
    def generate_report(self):
        """Genera el reporte con los datos actuales"""
        # Implementar lógica de generación de reportes
        pass


class DataVisualization(models.Model):
    """Configuración de visualizaciones de datos personalizadas"""
    
    CHART_TYPES = [
        ('line', 'Líneas'),
        ('bar', 'Barras'),
        ('pie', 'Circular'),
        ('scatter', 'Dispersión'),
        ('area', 'Área'),
        ('heatmap', 'Mapa de Calor'),
        ('gauge', 'Medidor'),
        ('funnel', 'Embudo'),
        ('waterfall', 'Cascada'),
        ('treemap', 'Mapa de Árbol'),
        ('sankey', 'Sankey'),
        ('radar', 'Radar'),
    ]
    
    name = models.CharField(max_length=200, verbose_name="Nombre de la Visualización")
    chart_type = models.CharField(max_length=20, choices=CHART_TYPES, verbose_name="Tipo de Gráfico")
    description = models.TextField(blank=True, verbose_name="Descripción")
    
    # Configuración de datos
    data_source = models.CharField(max_length=200, verbose_name="Fuente de Datos")
    x_axis_field = models.CharField(max_length=100, verbose_name="Campo Eje X")
    y_axis_field = models.CharField(max_length=100, verbose_name="Campo Eje Y")
    group_by_field = models.CharField(max_length=100, blank=True, verbose_name="Agrupar por")
    
    # Filtros de datos
    filters = models.JSONField(default=dict, verbose_name="Filtros de Datos")
    aggregation_method = models.CharField(max_length=20, default='sum', verbose_name="Método de Agregación")
    
    # Configuración visual
    color_scheme = models.CharField(max_length=50, default='default', verbose_name="Esquema de Colores")
    chart_config = models.JSONField(default=dict, verbose_name="Configuración del Gráfico")
    
    # Interactividad
    is_interactive = models.BooleanField(default=True, verbose_name="Interactivo")
    enable_drill_down = models.BooleanField(default=False, verbose_name="Habilitar Drill-down")
    refresh_rate_seconds = models.IntegerField(default=300, verbose_name="Tasa de Actualización (segundos)")
    
    # Dashboard asociado
    dashboard = models.ForeignKey(
        'business_intelligence.BusinessIntelligenceDashboard',
        on_delete=models.CASCADE,
        related_name='visualizations',
        null=True, blank=True,
        verbose_name="Dashboard"
    )
    
    # Posición en el dashboard
    position_x = models.IntegerField(default=0, verbose_name="Posición X")
    position_y = models.IntegerField(default=0, verbose_name="Posición Y")
    width = models.IntegerField(default=6, verbose_name="Ancho")
    height = models.IntegerField(default=4, verbose_name="Alto")
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Visualización de Datos"
        verbose_name_plural = "Visualizaciones de Datos"
        ordering = ['dashboard', 'position_y', 'position_x']
    
    def __str__(self):
        return f"{self.name} ({self.chart_type})"
    
    def get_chart_data(self):
        """Obtiene los datos para la visualización"""
        # Implementar lógica para obtener datos según la configuración
        return {
            'labels': [],
            'datasets': []
        }


class BenchmarkData(models.Model):
    """Datos de benchmarking para comparaciones de la industria"""
    
    BENCHMARK_CATEGORIES = [
        ('financial', 'Indicadores Financieros'),
        ('operational', 'Métricas Operacionales'),
        ('quality', 'Calidad'),
        ('customer_satisfaction', 'Satisfacción del Cliente'),
        ('efficiency', 'Eficiencia'),
        ('innovation', 'Innovación'),
        ('market_position', 'Posición en el Mercado'),
        ('sustainability', 'Sostenibilidad'),
    ]
    
    INDUSTRY_TYPES = [
        ('construction', 'Construcción'),
        ('infrastructure', 'Infraestructura'),
        ('engineering', 'Ingeniería'),
        ('consulting', 'Consultoría'),
        ('technology', 'Tecnología'),
        ('manufacturing', 'Manufactura'),
        ('services', 'Servicios'),
    ]
    
    name = models.CharField(max_length=200, verbose_name="Nombre del Benchmark")
    category = models.CharField(max_length=30, choices=BENCHMARK_CATEGORIES, verbose_name="Categoría")
    industry = models.CharField(max_length=30, choices=INDUSTRY_TYPES, verbose_name="Industria")
    description = models.TextField(verbose_name="Descripción")
    
    # Datos del benchmark
    metric_name = models.CharField(max_length=100, verbose_name="Nombre de la Métrica")
    unit = models.CharField(max_length=50, verbose_name="Unidad")
    
    # Valores de referencia
    industry_average = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Promedio de la Industria")
    top_quartile = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Cuartil Superior")
    median = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Mediana")
    bottom_quartile = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Cuartil Inferior")
    
    # Contexto del benchmark
    sample_size = models.IntegerField(verbose_name="Tamaño de la Muestra")
    data_period = models.CharField(max_length=100, verbose_name="Período de los Datos")
    geographic_scope = models.CharField(max_length=100, verbose_name="Ámbito Geográfico")
    
    # Fuente y validez
    data_source = models.CharField(max_length=200, verbose_name="Fuente de Datos")
    collection_methodology = models.TextField(verbose_name="Metodología de Recolección")
    validity_period_start = models.DateField(verbose_name="Inicio Validez")
    validity_period_end = models.DateField(verbose_name="Fin Validez")
    
    # Control de calidad
    is_verified = models.BooleanField(default=False, verbose_name="Verificado")
    confidence_level = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Nivel de Confianza (%)")
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Dato de Benchmark"
        verbose_name_plural = "Datos de Benchmark"
        ordering = ['category', 'metric_name']
    
    def __str__(self):
        return f"{self.metric_name} - {self.industry}"
    
    def compare_with_value(self, value):
        """Compara un valor con los benchmarks de la industria"""
        value = Decimal(str(value))
        
        if value >= self.top_quartile:
            return {
                'performance': 'excellent',
                'percentile': 75,
                'message': 'Rendimiento excelente - Top 25%'
            }
        elif value >= self.median:
            return {
                'performance': 'above_average',
                'percentile': 50,
                'message': 'Por encima del promedio'
            }
        elif value >= self.bottom_quartile:
            return {
                'performance': 'below_average',
                'percentile': 25,
                'message': 'Por debajo del promedio'
            }
        else:
            return {
                'performance': 'poor',
                'percentile': 10,
                'message': 'Rendimiento bajo - Requiere atención'
            }