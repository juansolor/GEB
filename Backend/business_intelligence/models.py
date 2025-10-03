from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal
from datetime import datetime, timedelta
import json

User = get_user_model()


class BusinessIntelligenceDashboard(models.Model):
    """Dashboard principal de Business Intelligence"""
    
    DASHBOARD_TYPES = [
        ('executive', 'Ejecutivo'),
        ('operational', 'Operacional'),
        ('financial', 'Financiero'),
        ('sales', 'Ventas'),
        ('projects', 'Proyectos'),
        ('market', 'Mercado'),
        ('custom', 'Personalizado'),
    ]
    
    name = models.CharField(max_length=200, verbose_name="Nombre del Dashboard")
    dashboard_type = models.CharField(max_length=20, choices=DASHBOARD_TYPES, verbose_name="Tipo")
    description = models.TextField(verbose_name="Descripción")
    
    # Configuración del dashboard
    layout_config = models.JSONField(
        default=dict,
        verbose_name="Configuración de Layout",
        help_text="JSON con configuración de widgets y posiciones"
    )
    
    # Filtros y parámetros
    default_filters = models.JSONField(
        default=dict,
        verbose_name="Filtros por Defecto",
        help_text="Filtros que se aplican automáticamente"
    )
    
    # Configuración de actualización
    auto_refresh_minutes = models.IntegerField(
        default=15,
        verbose_name="Auto-actualización (minutos)"
    )
    
    # Permisos y acceso
    is_public = models.BooleanField(default=False, verbose_name="Público")
    allowed_users = models.ManyToManyField(
        User, 
        blank=True, 
        verbose_name="Usuarios Permitidos"
    )
    allowed_roles = models.JSONField(
        default=list,
        verbose_name="Roles Permitidos",
        help_text="Lista de roles que pueden acceder"
    )
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_dashboards')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Dashboard BI"
        verbose_name_plural = "Dashboards BI"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.dashboard_type})"


class KPIMetric(models.Model):
    """Métricas e indicadores clave de performance"""
    
    METRIC_TYPES = [
        ('financial', 'Financiero'),
        ('sales', 'Ventas'),
        ('operational', 'Operacional'),
        ('quality', 'Calidad'),
        ('efficiency', 'Eficiencia'),
        ('growth', 'Crecimiento'),
        ('market', 'Mercado'),
    ]
    
    CALCULATION_METHODS = [
        ('sum', 'Suma'),
        ('avg', 'Promedio'),
        ('count', 'Conteo'),
        ('percentage', 'Porcentaje'),
        ('ratio', 'Ratio'),
        ('growth_rate', 'Tasa de Crecimiento'),
        ('custom_sql', 'SQL Personalizado'),
        ('api_call', 'Llamada API'),
    ]
    
    FREQUENCY_OPTIONS = [
        ('real_time', 'Tiempo Real'),
        ('hourly', 'Cada Hora'),
        ('daily', 'Diario'),
        ('weekly', 'Semanal'),
        ('monthly', 'Mensual'),
        ('quarterly', 'Trimestral'),
        ('yearly', 'Anual'),
    ]
    
    name = models.CharField(max_length=200, verbose_name="Nombre del KPI")
    code = models.CharField(max_length=50, unique=True, verbose_name="Código")
    metric_type = models.CharField(max_length=20, choices=METRIC_TYPES, verbose_name="Tipo de Métrica")
    description = models.TextField(verbose_name="Descripción")
    
    # Configuración de cálculo
    calculation_method = models.CharField(max_length=20, choices=CALCULATION_METHODS, verbose_name="Método de Cálculo")
    source_model = models.CharField(max_length=100, blank=True, verbose_name="Modelo Fuente")
    source_fields = models.JSONField(default=list, verbose_name="Campos Fuente")
    custom_sql = models.TextField(blank=True, verbose_name="SQL Personalizado")
    
    # Configuración de actualización
    update_frequency = models.CharField(max_length=20, choices=FREQUENCY_OPTIONS, verbose_name="Frecuencia de Actualización")
    
    # Metas y objetivos
    target_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name="Valor Objetivo")
    warning_threshold = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name="Umbral de Advertencia")
    critical_threshold = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name="Umbral Crítico")
    
    # Formato y visualización
    unit = models.CharField(max_length=20, blank=True, verbose_name="Unidad")
    decimal_places = models.IntegerField(default=2, verbose_name="Decimales")
    show_trend = models.BooleanField(default=True, verbose_name="Mostrar Tendencia")
    
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Métrica KPI"
        verbose_name_plural = "Métricas KPI"
        ordering = ['metric_type', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.code})"
    
    def calculate_current_value(self):
        """Calcula el valor actual de la métrica"""
        # Implementación específica según el método de cálculo
        if self.calculation_method == 'custom_sql' and self.custom_sql:
            # Ejecutar SQL personalizado
            pass
        elif self.source_model:
            # Calcular basado en modelo y campos
            pass
        return Decimal('0.00')
    
    def get_trend_data(self, days=30):
        """Obtiene datos de tendencia para los últimos N días"""
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        return KPIValue.objects.filter(
            kpi=self,
            measurement_date__range=[start_date, end_date]
        ).order_by('measurement_date').values('measurement_date', 'value')


class KPIValue(models.Model):
    """Valores históricos de las métricas KPI"""
    
    kpi = models.ForeignKey(KPIMetric, on_delete=models.CASCADE, related_name='values')
    value = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Valor")
    measurement_date = models.DateField(verbose_name="Fecha de Medición")
    measurement_time = models.DateTimeField(auto_now_add=True, verbose_name="Hora de Medición")
    
    # Contexto adicional
    filters_applied = models.JSONField(default=dict, verbose_name="Filtros Aplicados")
    calculation_details = models.JSONField(default=dict, verbose_name="Detalles del Cálculo")
    
    class Meta:
        verbose_name = "Valor de KPI"
        verbose_name_plural = "Valores de KPI"
        unique_together = ['kpi', 'measurement_date']
        ordering = ['-measurement_date']
    
    def __str__(self):
        return f"{self.kpi.name}: {self.value} ({self.measurement_date})"


class TrendAnalysis(models.Model):
    """Análisis de tendencias automático"""
    
    TREND_TYPES = [
        ('upward', 'Tendencia Alcista'),
        ('downward', 'Tendencia Bajista'),
        ('stable', 'Estable'),
        ('volatile', 'Volátil'),
        ('seasonal', 'Estacional'),
        ('cyclical', 'Cíclico'),
    ]
    
    ANALYSIS_PERIODS = [
        ('7d', '7 días'),
        ('30d', '30 días'),
        ('90d', '90 días'),
        ('6m', '6 meses'),
        ('1y', '1 año'),
        ('custom', 'Personalizado'),
    ]
    
    name = models.CharField(max_length=200, verbose_name="Nombre del Análisis")
    description = models.TextField(verbose_name="Descripción")
    
    # Configuración del análisis
    kpis = models.ManyToManyField(KPIMetric, verbose_name="KPIs a Analizar")
    analysis_period = models.CharField(max_length=10, choices=ANALYSIS_PERIODS, verbose_name="Período de Análisis")
    custom_start_date = models.DateField(null=True, blank=True, verbose_name="Fecha Inicio Personalizada")
    custom_end_date = models.DateField(null=True, blank=True, verbose_name="Fecha Fin Personalizada")
    
    # Algoritmos y configuración
    algorithms_config = models.JSONField(
        default=dict,
        verbose_name="Configuración de Algoritmos",
        help_text="Configuración para algoritmos de análisis de tendencias"
    )
    
    # Resultados del análisis
    last_analysis_date = models.DateTimeField(null=True, blank=True, verbose_name="Última Ejecución")
    trend_classification = models.CharField(max_length=20, choices=TREND_TYPES, blank=True, verbose_name="Clasificación de Tendencia")
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name="Nivel de Confianza (%)")
    
    # Predicciones
    prediction_accuracy = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name="Precisión de Predicción (%)")
    next_period_forecast = models.JSONField(default=dict, verbose_name="Pronóstico Próximo Período")
    
    # Configuración de ejecución
    auto_run = models.BooleanField(default=False, verbose_name="Ejecutar Automáticamente")
    run_frequency = models.CharField(max_length=20, choices=KPIMetric.FREQUENCY_OPTIONS, default='weekly', verbose_name="Frecuencia de Ejecución")
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Análisis de Tendencias"
        verbose_name_plural = "Análisis de Tendencias"
        ordering = ['-last_analysis_date']
    
    def __str__(self):
        return self.name
    
    def execute_analysis(self):
        """Ejecuta el análisis de tendencias"""
        # Implementar algoritmos de análisis de tendencias
        # - Regresión lineal
        # - Análisis estacional
        # - Detección de outliers
        # - Predicciones futuras
        pass


class BusinessInsight(models.Model):
    """Insights y hallazgos automáticos del negocio"""
    
    INSIGHT_TYPES = [
        ('opportunity', 'Oportunidad'),
        ('risk', 'Riesgo'),
        ('anomaly', 'Anomalía'),
        ('pattern', 'Patrón'),
        ('forecast', 'Pronóstico'),
        ('recommendation', 'Recomendación'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'Baja'),
        ('medium', 'Media'),
        ('high', 'Alta'),
        ('critical', 'Crítica'),
    ]
    
    CONFIDENCE_LEVELS = [
        ('low', 'Baja (< 60%)'),
        ('medium', 'Media (60-80%)'),
        ('high', 'Alta (80-95%)'),
        ('very_high', 'Muy Alta (> 95%)'),
    ]
    
    title = models.CharField(max_length=200, verbose_name="Título del Insight")
    description = models.TextField(verbose_name="Descripción")
    insight_type = models.CharField(max_length=20, choices=INSIGHT_TYPES, verbose_name="Tipo de Insight")
    priority = models.CharField(max_length=20, choices=PRIORITY_LEVELS, verbose_name="Prioridad")
    confidence = models.CharField(max_length=20, choices=CONFIDENCE_LEVELS, verbose_name="Nivel de Confianza")
    
    # Datos del insight
    data_source = models.JSONField(default=dict, verbose_name="Fuente de Datos")
    supporting_data = models.JSONField(default=dict, verbose_name="Datos de Soporte")
    
    # KPIs relacionados
    related_kpis = models.ManyToManyField(KPIMetric, blank=True, verbose_name="KPIs Relacionados")
    
    # Impacto estimado
    estimated_impact = models.TextField(blank=True, verbose_name="Impacto Estimado")
    financial_impact = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name="Impacto Financiero")
    
    # Acciones recomendadas
    recommended_actions = models.JSONField(default=list, verbose_name="Acciones Recomendadas")
    
    # Estado del insight
    is_reviewed = models.BooleanField(default=False, verbose_name="Revisado")
    is_actionable = models.BooleanField(default=True, verbose_name="Accionable")
    is_resolved = models.BooleanField(default=False, verbose_name="Resuelto")
    
    # Fechas importantes
    detected_at = models.DateTimeField(auto_now_add=True, verbose_name="Detectado el")
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name="Expira el")
    reviewed_at = models.DateTimeField(null=True, blank=True, verbose_name="Revisado el")
    resolved_at = models.DateTimeField(null=True, blank=True, verbose_name="Resuelto el")
    
    # Usuario asignado
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Asignado a")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_insights')
    
    class Meta:
        verbose_name = "Business Insight"
        verbose_name_plural = "Business Insights"
        ordering = ['-priority', '-detected_at']
    
    def __str__(self):
        return f"{self.title} ({self.insight_type})"


class ImprovementPlan(models.Model):
    """Planes de mejora automáticos basados en BI"""
    
    PLAN_STATUS = [
        ('draft', 'Borrador'),
        ('approved', 'Aprobado'),
        ('in_progress', 'En Progreso'),
        ('completed', 'Completado'),
        ('cancelled', 'Cancelado'),
        ('on_hold', 'En Pausa'),
    ]
    
    PLAN_CATEGORIES = [
        ('operational', 'Operacional'),
        ('financial', 'Financiero'),
        ('quality', 'Calidad'),
        ('efficiency', 'Eficiencia'),
        ('growth', 'Crecimiento'),
        ('technology', 'Tecnología'),
        ('process', 'Procesos'),
        ('training', 'Capacitación'),
    ]
    
    name = models.CharField(max_length=200, verbose_name="Nombre del Plan")
    description = models.TextField(verbose_name="Descripción")
    category = models.CharField(max_length=20, choices=PLAN_CATEGORIES, verbose_name="Categoría")
    status = models.CharField(max_length=20, choices=PLAN_STATUS, default='draft', verbose_name="Estado")
    
    # Objetivos del plan
    objectives = models.JSONField(default=list, verbose_name="Objetivos")
    success_metrics = models.JSONField(default=list, verbose_name="Métricas de Éxito")
    
    # Insights que generaron el plan
    source_insights = models.ManyToManyField(BusinessInsight, blank=True, verbose_name="Insights Origen")
    
    # Estimaciones
    estimated_investment = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name="Inversión Estimada")
    estimated_savings = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name="Ahorros Estimados")
    estimated_roi = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name="ROI Estimado (%)")
    payback_period_months = models.IntegerField(null=True, blank=True, verbose_name="Período de Recuperación (meses)")
    
    # Cronograma
    start_date = models.DateField(null=True, blank=True, verbose_name="Fecha de Inicio")
    target_completion_date = models.DateField(null=True, blank=True, verbose_name="Fecha Objetivo de Finalización")
    actual_completion_date = models.DateField(null=True, blank=True, verbose_name="Fecha Real de Finalización")
    
    # Responsables
    plan_owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Dueño del Plan")
    stakeholders = models.ManyToManyField(User, blank=True, related_name='stakeholder_plans', verbose_name="Interesados")
    
    # Seguimiento
    progress_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'), verbose_name="Progreso (%)")
    last_update_notes = models.TextField(blank=True, verbose_name="Notas de Última Actualización")
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_plans')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Plan de Mejora"
        verbose_name_plural = "Planes de Mejora"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.status})"
    
    @property
    def is_overdue(self):
        """Verifica si el plan está atrasado"""
        if self.target_completion_date and self.status not in ['completed', 'cancelled']:
            return datetime.now().date() > self.target_completion_date
        return False


class ImprovementAction(models.Model):
    """Acciones específicas dentro de un plan de mejora"""
    
    ACTION_STATUS = [
        ('pending', 'Pendiente'),
        ('in_progress', 'En Progreso'),
        ('completed', 'Completada'),
        ('blocked', 'Bloqueada'),
        ('cancelled', 'Cancelada'),
    ]
    
    plan = models.ForeignKey(ImprovementPlan, on_delete=models.CASCADE, related_name='actions')
    name = models.CharField(max_length=200, verbose_name="Nombre de la Acción")
    description = models.TextField(verbose_name="Descripción")
    status = models.CharField(max_length=20, choices=ACTION_STATUS, default='pending', verbose_name="Estado")
    
    # Cronograma de la acción
    due_date = models.DateField(verbose_name="Fecha Límite")
    estimated_hours = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, verbose_name="Horas Estimadas")
    actual_hours = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, verbose_name="Horas Reales")
    
    # Responsables
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Asignado a")
    
    # Recursos necesarios
    required_resources = models.JSONField(default=list, verbose_name="Recursos Necesarios")
    estimated_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Costo Estimado")
    actual_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Costo Real")
    
    # Seguimiento
    progress_notes = models.TextField(blank=True, verbose_name="Notas de Progreso")
    completion_notes = models.TextField(blank=True, verbose_name="Notas de Finalización")
    
    # Dependencias
    depends_on = models.ManyToManyField('self', blank=True, symmetrical=False, verbose_name="Depende de")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name="Completada el")
    
    class Meta:
        verbose_name = "Acción de Mejora"
        verbose_name_plural = "Acciones de Mejora"
        ordering = ['due_date', 'name']
    
    def __str__(self):
        return f"{self.plan.name} - {self.name}"
    
    @property
    def is_overdue(self):
        """Verifica si la acción está atrasada"""
        if self.status not in ['completed', 'cancelled']:
            return datetime.now().date() > self.due_date
        return False


class SmartSuggestion(models.Model):
    """Sugerencias automáticas basadas en IA y análisis de datos"""
    
    SUGGESTION_TYPES = [
        ('cost_optimization', 'Optimización de Costos'),
        ('revenue_increase', 'Aumento de Ingresos'),
        ('process_improvement', 'Mejora de Procesos'),
        ('market_opportunity', 'Oportunidad de Mercado'),
        ('risk_mitigation', 'Mitigación de Riesgos'),
        ('technology_upgrade', 'Actualización Tecnológica'),
        ('training_need', 'Necesidad de Capacitación'),
        ('resource_allocation', 'Asignación de Recursos'),
    ]
    
    URGENCY_LEVELS = [
        ('low', 'Baja'),
        ('medium', 'Media'),
        ('high', 'Alta'),
        ('urgent', 'Urgente'),
    ]
    
    title = models.CharField(max_length=200, verbose_name="Título de la Sugerencia")
    description = models.TextField(verbose_name="Descripción Detallada")
    suggestion_type = models.CharField(max_length=30, choices=SUGGESTION_TYPES, verbose_name="Tipo de Sugerencia")
    urgency = models.CharField(max_length=20, choices=URGENCY_LEVELS, verbose_name="Urgencia")
    
    # Análisis que generó la sugerencia
    analysis_data = models.JSONField(default=dict, verbose_name="Datos del Análisis")
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="Nivel de Confianza (%)")
    
    # Impacto estimado
    estimated_benefit = models.TextField(verbose_name="Beneficio Estimado")
    potential_savings = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name="Ahorros Potenciales")
    potential_revenue = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, verbose_name="Ingresos Potenciales")
    
    # Implementación
    implementation_steps = models.JSONField(default=list, verbose_name="Pasos de Implementación")
    estimated_effort = models.CharField(max_length=100, blank=True, verbose_name="Esfuerzo Estimado")
    required_resources = models.JSONField(default=list, verbose_name="Recursos Requeridos")
    
    # Estado de la sugerencia
    is_reviewed = models.BooleanField(default=False, verbose_name="Revisada")
    is_accepted = models.BooleanField(default=False, verbose_name="Aceptada")
    is_implemented = models.BooleanField(default=False, verbose_name="Implementada")
    
    # Fechas
    generated_at = models.DateTimeField(auto_now_add=True, verbose_name="Generada el")
    reviewed_at = models.DateTimeField(null=True, blank=True, verbose_name="Revisada el")
    implemented_at = models.DateTimeField(null=True, blank=True, verbose_name="Implementada el")
    
    # Usuarios relacionados
    suggested_for = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="Sugerida para")
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_suggestions', verbose_name="Revisada por")
    
    # Plan de mejora relacionado
    improvement_plan = models.ForeignKey(ImprovementPlan, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Plan de Mejora Asociado")
    
    class Meta:
        verbose_name = "Sugerencia Inteligente"
        verbose_name_plural = "Sugerencias Inteligentes"
        ordering = ['-urgency', '-generated_at']
    
    def __str__(self):
        return f"{self.title} ({self.suggestion_type})"
    
    def convert_to_improvement_plan(self):
        """Convierte la sugerencia en un plan de mejora"""
        if not self.is_accepted:
            return None
        
        plan = ImprovementPlan.objects.create(
            name=f"Plan: {self.title}",
            description=self.description,
            category='process',  # Default category
            estimated_savings=self.potential_savings,
            plan_owner=self.suggested_for,
            created_by=self.reviewed_by
        )
        
        plan.source_insights.set([])  # Add related insights if any
        
        # Create actions from implementation steps
        for i, step in enumerate(self.implementation_steps):
            ImprovementAction.objects.create(
                plan=plan,
                name=f"Paso {i+1}: {step.get('name', 'Acción')}",
                description=step.get('description', ''),
                due_date=datetime.now().date() + timedelta(days=step.get('days_offset', 30)),
                assigned_to=self.suggested_for
            )
        
        self.improvement_plan = plan
        self.is_implemented = True
        self.implemented_at = datetime.now()
        self.save()
        
        return plan