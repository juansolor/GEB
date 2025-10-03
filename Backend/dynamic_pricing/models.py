from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal
from datetime import datetime, timedelta
import json

User = get_user_model()


class CostMatrix(models.Model):
    """Matriz de costos dinámica para diferentes escenarios de pricing"""
    
    MATRIX_TYPES = [
        ('standard', 'Estándar'),
        ('premium', 'Premium'), 
        ('economy', 'Económico'),
        ('enterprise', 'Empresarial'),
        ('government', 'Gubernamental'),
        ('custom', 'Personalizado'),
    ]
    
    COMPLEXITY_LEVELS = [
        ('simple', 'Simple'),
        ('moderate', 'Moderado'),
        ('complex', 'Complejo'),
        ('critical', 'Crítico'),
    ]
    
    name = models.CharField(max_length=200, verbose_name="Nombre de la Matriz")
    matrix_type = models.CharField(max_length=20, choices=MATRIX_TYPES, verbose_name="Tipo de Matriz")
    description = models.TextField(verbose_name="Descripción")
    
    # Factores base de la matriz
    base_margin = models.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal('20.00'),
        verbose_name="Margen Base (%)"
    )
    administrative_overhead = models.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal('15.00'),
        verbose_name="Gastos Administrativos (%)"
    )
    
    # Factores de complejidad
    complexity_multipliers = models.JSONField(
        default=dict,
        verbose_name="Multiplicadores por Complejidad",
        help_text="JSON con multiplicadores: {'simple': 1.0, 'moderate': 1.2, 'complex': 1.5, 'critical': 2.0}"
    )
    
    # Factores por volumen (escalas de precio)
    volume_tiers = models.JSONField(
        default=dict,
        verbose_name="Niveles de Volumen",
        help_text="JSON con escalas: {'tier1': {'min': 0, 'max': 10000, 'discount': 0}, ...}"
    )
    
    # Factores temporales
    seasonal_adjustments = models.JSONField(
        default=dict,
        verbose_name="Ajustes Estacionales",
        help_text="JSON con ajustes por mes: {'1': 1.0, '2': 0.9, ...}"
    )
    
    # Factores geográficos
    location_multipliers = models.JSONField(
        default=dict,
        verbose_name="Multiplicadores por Ubicación",
        help_text="JSON con factores: {'lima': 1.0, 'provincia': 1.1, 'selva': 1.3}"
    )
    
    # Factores de riesgo
    risk_premiums = models.JSONField(
        default=dict,
        verbose_name="Primas de Riesgo",
        help_text="JSON con primas: {'low': 0.0, 'medium': 0.05, 'high': 0.15}"
    )
    
    # Control de vigencia
    effective_date = models.DateField(verbose_name="Fecha de Vigencia")
    expiry_date = models.DateField(null=True, blank=True, verbose_name="Fecha de Expiración")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    is_default = models.BooleanField(default=False, verbose_name="Matriz por Defecto")
    
    # Metadatos
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    version = models.CharField(max_length=20, default="1.0", verbose_name="Versión")
    
    class Meta:
        verbose_name = "Matriz de Costos"
        verbose_name_plural = "Matrices de Costos"
        ordering = ['-is_default', '-effective_date']
    
    def __str__(self):
        return f"{self.name} v{self.version}"
    
    def save(self, *args, **kwargs):
        # Ensure only one default matrix
        if self.is_default:
            CostMatrix.objects.filter(is_default=True).update(is_default=False)
        super().save(*args, **kwargs)
    
    def get_complexity_factor(self, complexity_level):
        """Obtiene el factor de complejidad"""
        multipliers = self.complexity_multipliers or {
            'simple': 1.0,
            'moderate': 1.2, 
            'complex': 1.5,
            'critical': 2.0
        }
        return Decimal(str(multipliers.get(complexity_level, 1.0)))
    
    def get_volume_discount(self, project_value):
        """Calcula descuento por volumen basado en valor del proyecto"""
        tiers = self.volume_tiers or {
            'tier1': {'min': 0, 'max': 50000, 'discount': 0},
            'tier2': {'min': 50000, 'max': 200000, 'discount': 5},
            'tier3': {'min': 200000, 'max': 500000, 'discount': 10},
            'tier4': {'min': 500000, 'max': float('inf'), 'discount': 15}
        }
        
        project_value = float(project_value)
        for tier_data in tiers.values():
            if tier_data['min'] <= project_value < tier_data['max']:
                return Decimal(str(tier_data['discount']))
        return Decimal('0.00')
    
    def get_seasonal_factor(self, date=None):
        """Obtiene factor estacional para una fecha específica"""
        if not date:
            date = datetime.now().date()
        
        adjustments = self.seasonal_adjustments or {
            '1': 1.0, '2': 0.95, '3': 0.9, '4': 0.9,   # Q1 - baja demanda
            '5': 1.0, '6': 1.05, '7': 1.1, '8': 1.1,   # Q2-Q3 - alta demanda
            '9': 1.05, '10': 1.0, '11': 0.95, '12': 1.2 # Q4 - fin de año
        }
        
        month_str = str(date.month)
        return Decimal(str(adjustments.get(month_str, 1.0)))
    
    def get_location_factor(self, location):
        """Obtiene factor por ubicación geográfica"""
        multipliers = self.location_multipliers or {
            'lima': 1.0,
            'arequipa': 1.05,
            'trujillo': 1.08,
            'chiclayo': 1.08,
            'piura': 1.12,
            'iquitos': 1.25,
            'cusco': 1.15,
            'huancayo': 1.10,
            'provincia': 1.15,
            'selva': 1.30,
            'sierra': 1.20
        }
        return Decimal(str(multipliers.get(location.lower(), 1.15)))
    
    def get_risk_premium(self, risk_level):
        """Obtiene prima de riesgo"""
        premiums = self.risk_premiums or {
            'low': 0.0,
            'medium': 5.0,
            'high': 15.0,
            'critical': 25.0
        }
        return Decimal(str(premiums.get(risk_level, 5.0)))
    
    def calculate_dynamic_price(self, base_cost, **factors):
        """
        Calcula precio dinámico aplicando todos los factores
        
        Args:
            base_cost: Costo base del análisis
            **factors: Diccionario con factores específicos
                - complexity: nivel de complejidad
                - project_value: valor estimado del proyecto
                - location: ubicación geográfica
                - risk_level: nivel de riesgo
                - date: fecha del proyecto
                - custom_margin: margen personalizado
        """
        # Costo base
        working_cost = Decimal(str(base_cost))
        
        # Factor de complejidad
        if 'complexity' in factors:
            complexity_factor = self.get_complexity_factor(factors['complexity'])
            working_cost *= complexity_factor
        
        # Gastos administrativos
        admin_cost = working_cost * (self.administrative_overhead / 100)
        working_cost += admin_cost
        
        # Factor estacional
        if 'date' in factors:
            seasonal_factor = self.get_seasonal_factor(factors['date'])
            working_cost *= seasonal_factor
        
        # Factor de ubicación
        if 'location' in factors:
            location_factor = self.get_location_factor(factors['location'])
            working_cost *= location_factor
        
        # Prima de riesgo
        risk_premium = Decimal('0.00')
        if 'risk_level' in factors:
            risk_premium = self.get_risk_premium(factors['risk_level'])
        
        # Margen (base + prima de riesgo + margen personalizado)
        margin_percentage = self.base_margin + risk_premium
        if 'custom_margin' in factors:
            margin_percentage = Decimal(str(factors['custom_margin']))
        
        margin_amount = working_cost * (margin_percentage / 100)
        final_price = working_cost + margin_amount
        
        # Descuento por volumen (se aplica al final)
        volume_discount = Decimal('0.00')
        if 'project_value' in factors:
            volume_discount = self.get_volume_discount(factors['project_value'])
            discount_amount = final_price * (volume_discount / 100)
            final_price -= discount_amount
        
        return {
            'base_cost': base_cost,
            'complexity_adjusted_cost': working_cost - admin_cost,
            'administrative_cost': admin_cost,
            'location_adjusted_cost': working_cost,
            'margin_percentage': margin_percentage,
            'margin_amount': margin_amount,
            'subtotal': working_cost + margin_amount,
            'volume_discount_percentage': volume_discount,
            'volume_discount_amount': final_price * (volume_discount / 100) if volume_discount > 0 else Decimal('0.00'),
            'final_price': final_price,
            'effective_margin': ((final_price - base_cost) / base_cost * 100) if base_cost > 0 else Decimal('0.00')
        }


class DynamicPricingRule(models.Model):
    """Reglas de pricing dinámico por condiciones específicas"""
    
    RULE_TYPES = [
        ('volume_discount', 'Descuento por Volumen'),
        ('loyalty_bonus', 'Bonificación por Lealtad'),
        ('seasonal_adjustment', 'Ajuste Estacional'),
        ('location_premium', 'Prima por Ubicación'),
        ('complexity_surcharge', 'Recargo por Complejidad'),
        ('risk_premium', 'Prima de Riesgo'),
        ('payment_discount', 'Descuento por Forma de Pago'),
        ('timeline_urgency', 'Recargo por Urgencia'),
    ]
    
    name = models.CharField(max_length=200, verbose_name="Nombre de la Regla")
    rule_type = models.CharField(max_length=30, choices=RULE_TYPES, verbose_name="Tipo de Regla")
    description = models.TextField(verbose_name="Descripción")
    
    # Condiciones de aplicación
    conditions = models.JSONField(
        verbose_name="Condiciones",
        help_text="JSON con condiciones de aplicación de la regla"
    )
    
    # Ajustes a aplicar
    adjustments = models.JSONField(
        verbose_name="Ajustes",
        help_text="JSON con ajustes/modificaciones a aplicar"
    )
    
    # Matriz asociada
    cost_matrix = models.ForeignKey(
        CostMatrix, 
        on_delete=models.CASCADE,
        related_name='pricing_rules',
        verbose_name="Matriz de Costos"
    )
    
    # Prioridad y control
    priority = models.IntegerField(default=1, verbose_name="Prioridad")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        verbose_name = "Regla de Pricing Dinámico"
        verbose_name_plural = "Reglas de Pricing Dinámico"
        ordering = ['-priority', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.rule_type})"
    
    def evaluate_conditions(self, context):
        """Evalúa si las condiciones se cumplen para el contexto dado"""
        # Implementación de evaluación de condiciones
        # context sería un dict con datos del proyecto/cliente
        return True  # Placeholder
    
    def apply_adjustment(self, base_value, context):
        """Aplica el ajuste al valor base"""
        # Implementación de aplicación de ajustes
        return base_value  # Placeholder


class PricingScenario(models.Model):
    """Escenarios de pricing para comparación y análisis"""
    
    name = models.CharField(max_length=200, verbose_name="Nombre del Escenario")
    description = models.TextField(verbose_name="Descripción")
    
    # Matriz y reglas asociadas
    cost_matrix = models.ForeignKey(CostMatrix, on_delete=models.CASCADE, verbose_name="Matriz de Costos")
    
    # Parámetros del escenario
    scenario_params = models.JSONField(
        verbose_name="Parámetros del Escenario",
        help_text="JSON con parámetros específicos del escenario"
    )
    
    # Resultados calculados
    total_cost = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    total_price = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    effective_margin = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Análisis asociado
    analysis = models.ForeignKey(
        'pricing_analysis.UnitPriceAnalysis',
        on_delete=models.CASCADE,
        related_name='scenarios',
        verbose_name="Análisis de Precios"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        verbose_name = "Escenario de Pricing"
        verbose_name_plural = "Escenarios de Pricing"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.analysis.name}"
    
    def calculate_scenario(self):
        """Calcula los resultados para este escenario"""
        base_cost = self.analysis.total_direct_cost
        
        pricing_result = self.cost_matrix.calculate_dynamic_price(
            base_cost=base_cost,
            **self.scenario_params
        )
        
        self.total_cost = pricing_result['base_cost']
        self.total_price = pricing_result['final_price'] 
        self.effective_margin = pricing_result['effective_margin']
        
        self.save()
        return pricing_result