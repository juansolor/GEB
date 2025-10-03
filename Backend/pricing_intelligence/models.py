from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal
from django.db.models import Avg, Count, Sum
from datetime import datetime
import json

User = get_user_model()


class PricingRecommendationEngine(models.Model):
    """Motor de recomendaciones inteligentes para pricing"""
    
    name = models.CharField(max_length=200, verbose_name="Nombre del Motor")
    description = models.TextField(verbose_name="Descripción")
    
    # Configuración del motor
    algorithm_type = models.CharField(
        max_length=50,
        choices=[
            ('historical', 'Basado en Históricos'),
            ('market_analysis', 'Análisis de Mercado'),
            ('ml_regression', 'Regresión ML'),
            ('hybrid', 'Híbrido'),
        ],
        default='historical',
        verbose_name="Tipo de Algoritmo"
    )
    
    # Pesos para diferentes factores
    weights = models.JSONField(
        default=dict,
        verbose_name="Pesos de Factores",
        help_text="JSON con pesos: {'historical': 0.4, 'market': 0.3, 'complexity': 0.3}"
    )
    
    # Configuración de ML (si aplica)
    ml_config = models.JSONField(
        default=dict,
        verbose_name="Configuración ML",
        help_text="Parámetros específicos para algoritmos de ML"
    )
    
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Motor de Recomendaciones"
        verbose_name_plural = "Motores de Recomendaciones"
    
    def __str__(self):
        return self.name
    
    def generate_recommendations(self, analysis_id, company_id=None, project_params=None):
        """Genera recomendaciones de pricing para un análisis específico"""
        from pricing_analysis.models import UnitPriceAnalysis
        
        try:
            analysis = UnitPriceAnalysis.objects.get(id=analysis_id)
        except UnitPriceAnalysis.DoesNotExist:
            return {'error': 'Análisis no encontrado'}
        
        recommendations = []
        
        # 1. Recomendación basada en históricos
        historical_rec = self._get_historical_recommendation(analysis, company_id)
        if historical_rec:
            recommendations.append(historical_rec)
        
        # 2. Recomendación basada en complejidad
        complexity_rec = self._get_complexity_recommendation(analysis, project_params)
        if complexity_rec:
            recommendations.append(complexity_rec)
        
        # 3. Recomendación basada en mercado
        market_rec = self._get_market_recommendation(analysis)
        if market_rec:
            recommendations.append(market_rec)
        
        # 4. Recomendación personalizada por empresa
        if company_id:
            company_rec = self._get_company_recommendation(analysis, company_id)
            if company_rec:
                recommendations.append(company_rec)
        
        return {
            'analysis_id': analysis_id,
            'base_cost': float(analysis.total_direct_cost),
            'recommendations': recommendations,
            'generated_at': datetime.now().isoformat()
        }
    
    def _get_historical_recommendation(self, analysis, company_id=None):
        """Recomendación basada en análisis históricos similares"""
        from pricing_analysis.models import UnitPriceAnalysis, ProjectEstimateItem
        
        # Buscar análisis similares en la misma categoría
        similar_analyses = UnitPriceAnalysis.objects.filter(
            category=analysis.category
        ).exclude(id=analysis.id)
        
        if similar_analyses.exists():
            avg_margin = similar_analyses.aggregate(
                avg_margin=Avg('profit_margin')
            )['avg_margin'] or Decimal('20.00')
            
            # Buscar proyectos ejecutados con este tipo de análisis
            executed_projects = ProjectEstimateItem.objects.filter(
                analysis__category=analysis.category,
                estimate__status='executed'
            )
            
            success_rate = Decimal('85.0')  # Placeholder
            if executed_projects.exists():
                total_projects = executed_projects.count()
                # Calcular tasa de éxito real basada en datos
                
            return {
                'type': 'historical',
                'title': 'Recomendación Histórica',
                'description': f'Basado en {similar_analyses.count()} análisis similares',
                'recommended_margin': float(avg_margin),
                'confidence_level': min(similar_analyses.count() * 10, 95),
                'success_rate': float(success_rate),
                'factors': ['Histórico de categoría', 'Proyectos ejecutados']
            }
        
        return None
    
    def _get_complexity_recommendation(self, analysis, project_params=None):
        """Recomendación basada en complejidad del proyecto"""
        base_margin = Decimal('20.00')
        complexity_factor = Decimal('1.0')
        
        if project_params:
            complexity = project_params.get('complexity', 'moderate')
            location = project_params.get('location', 'lima')
            timeline = project_params.get('timeline_days', 30)
            
            # Ajustar margen por complejidad
            complexity_adjustments = {
                'simple': 0.0,
                'moderate': 5.0,
                'complex': 15.0,
                'critical': 30.0
            }
            
            complexity_adj = Decimal(str(complexity_adjustments.get(complexity, 5.0)))
            
            # Ajustar por ubicación
            location_adj = Decimal('0.0')
            if location != 'lima':
                location_adj = Decimal('10.0')
            
            # Ajustar por cronograma
            timeline_adj = Decimal('0.0')
            if timeline < 15:  # Proyecto urgente
                timeline_adj = Decimal('20.0')
            elif timeline < 30:
                timeline_adj = Decimal('10.0')
            
            recommended_margin = base_margin + complexity_adj + location_adj + timeline_adj
            
            return {
                'type': 'complexity',
                'title': 'Recomendación por Complejidad',
                'description': f'Proyecto {complexity} en {location}',
                'recommended_margin': float(recommended_margin),
                'confidence_level': 80,
                'factors': [
                    f'Complejidad: {complexity} (+{complexity_adj}%)',
                    f'Ubicación: {location} (+{location_adj}%)',
                    f'Cronograma: {timeline} días (+{timeline_adj}%)'
                ]
            }
        
        return {
            'type': 'complexity',
            'title': 'Recomendación Estándar',
            'description': 'Basado en parámetros estándar',
            'recommended_margin': float(base_margin),
            'confidence_level': 70,
            'factors': ['Configuración estándar']
        }
    
    def _get_market_recommendation(self, analysis):
        """Recomendación basada en análisis de mercado"""
        # En una implementación real, esto consultaría datos de mercado
        # Por ahora, simulamos con lógica basada en la categoría
        
        category_margins = {
            'construccion': 22.0,
            'infraestructura': 25.0,
            'telecomunicaciones': 30.0,
            'mineria': 35.0,
            'energia': 28.0
        }
        
        category_name = analysis.category.code.lower() if analysis.category else 'construccion'
        market_margin = Decimal(str(category_margins.get(category_name, 25.0)))
        
        return {
            'type': 'market',
            'title': 'Recomendación de Mercado',
            'description': f'Margen típico del sector {analysis.category.name if analysis.category else "construcción"}',
            'recommended_margin': float(market_margin),
            'confidence_level': 75,
            'factors': ['Análisis sectorial', 'Benchmarking de mercado']
        }
    
    def _get_company_recommendation(self, analysis, company_id):
        """Recomendación personalizada por empresa"""
        try:
            from companies.models import Company, CompanyPricingRule
            
            company = Company.objects.get(id=company_id)
            
            # Buscar reglas específicas de la empresa
            pricing_rule = CompanyPricingRule.objects.filter(
                company=company,
                category=analysis.category,
                is_active=True
            ).first()
            
            base_margin = company.average_project_margin
            
            if pricing_rule and pricing_rule.is_valid():
                adjusted_margin = base_margin + pricing_rule.margin_adjustment
            else:
                # Aplicar factores generales de la empresa
                risk_premium = company.risk_premium
                adjusted_margin = base_margin + risk_premium
            
            # Considerar descuentos por volumen y lealtad
            effective_discount = company.effective_discount
            
            return {
                'type': 'company_specific',
                'title': f'Recomendación para {company.name}',
                'description': f'Basado en histórico y perfil de riesgo de la empresa',
                'recommended_margin': float(adjusted_margin),
                'volume_discount': float(effective_discount),
                'confidence_level': 90,
                'factors': [
                    f'Margen histórico: {base_margin}%',
                    f'Nivel de riesgo: {company.risk_level}',
                    f'Descuento efectivo: {effective_discount}%'
                ]
            }
            
        except:
            return None


class PricingAlert(models.Model):
    """Alertas del sistema de pricing"""
    
    ALERT_TYPES = [
        ('margin_low', 'Margen Bajo'),
        ('margin_high', 'Margen Alto'),
        ('cost_variation', 'Variación de Costos'),
        ('competitor_price', 'Precio Competidor'),
        ('market_change', 'Cambio de Mercado'),
        ('risk_warning', 'Advertencia de Riesgo'),
    ]
    
    SEVERITY_LEVELS = [
        ('info', 'Información'),
        ('warning', 'Advertencia'),
        ('critical', 'Crítico'),
    ]
    
    alert_type = models.CharField(max_length=30, choices=ALERT_TYPES, verbose_name="Tipo de Alerta")
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS, verbose_name="Severidad")
    title = models.CharField(max_length=200, verbose_name="Título")
    message = models.TextField(verbose_name="Mensaje")
    
    # Contexto de la alerta
    analysis = models.ForeignKey(
        'pricing_analysis.UnitPriceAnalysis',
        on_delete=models.CASCADE,
        null=True, blank=True,
        verbose_name="Análisis Relacionado"
    )
    
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        null=True, blank=True,
        verbose_name="Empresa Relacionada"
    )
    
    # Datos adicionales
    alert_data = models.JSONField(default=dict, verbose_name="Datos de la Alerta")
    
    # Control
    is_read = models.BooleanField(default=False, verbose_name="Leída")
    is_resolved = models.BooleanField(default=False, verbose_name="Resuelta")
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Alerta de Pricing"
        verbose_name_plural = "Alertas de Pricing"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.severity})"


class CompetitorAnalysis(models.Model):
    """Análisis de competencia para pricing inteligente"""
    
    competitor_name = models.CharField(max_length=200, verbose_name="Nombre del Competidor")
    category = models.ForeignKey(
        'pricing_analysis.ServiceCategory',
        on_delete=models.CASCADE,
        verbose_name="Categoría"
    )
    
    # Datos de pricing del competidor
    typical_margin = models.DecimalField(
        max_digits=5, decimal_places=2,
        verbose_name="Margen Típico (%)"
    )
    base_cost_estimation = models.DecimalField(
        max_digits=15, decimal_places=2,
        verbose_name="Estimación de Costo Base"
    )
    
    # Análisis cualitativo
    strengths = models.TextField(verbose_name="Fortalezas")
    weaknesses = models.TextField(verbose_name="Debilidades")
    market_positioning = models.CharField(
        max_length=50,
        choices=[
            ('premium', 'Premium'),
            ('standard', 'Estándar'),
            ('economy', 'Económico'),
        ],
        verbose_name="Posicionamiento"
    )
    
    # Datos de mercado
    market_share = models.DecimalField(
        max_digits=5, decimal_places=2,
        null=True, blank=True,
        verbose_name="Participación de Mercado (%)"
    )
    
    last_updated = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        verbose_name = "Análisis de Competidor"
        verbose_name_plural = "Análisis de Competidores"
        unique_together = ['competitor_name', 'category']
    
    def __str__(self):
        return f"{self.competitor_name} - {self.category.name}"


class MarketTrend(models.Model):
    """Tendencias de mercado para ajustar pricing"""
    
    category = models.ForeignKey(
        'pricing_analysis.ServiceCategory',
        on_delete=models.CASCADE,
        verbose_name="Categoría"
    )
    
    trend_date = models.DateField(verbose_name="Fecha de la Tendencia")
    
    # Indicadores de mercado
    demand_level = models.CharField(
        max_length=20,
        choices=[
            ('very_low', 'Muy Baja'),
            ('low', 'Baja'), 
            ('normal', 'Normal'),
            ('high', 'Alta'),
            ('very_high', 'Muy Alta'),
        ],
        verbose_name="Nivel de Demanda"
    )
    
    cost_inflation = models.DecimalField(
        max_digits=5, decimal_places=2,
        verbose_name="Inflación de Costos (%)"
    )
    
    market_price_change = models.DecimalField(
        max_digits=5, decimal_places=2,
        verbose_name="Cambio en Precios de Mercado (%)"
    )
    
    # Análisis descriptivo
    analysis = models.TextField(verbose_name="Análisis de la Tendencia")
    recommendations = models.TextField(verbose_name="Recomendaciones")
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Tendencia de Mercado"
        verbose_name_plural = "Tendencias de Mercado"
        ordering = ['-trend_date']
    
    def __str__(self):
        return f"{self.category.name} - {self.trend_date}"