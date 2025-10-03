from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal
from datetime import datetime, date
import json

User = get_user_model()


class MarketingPlatform(models.Model):
    """Plataformas de marketing digital configuradas"""
    
    PLATFORM_CHOICES = [
        ('google_ads', 'Google Ads'),
        ('instagram', 'Instagram Business'),
        ('facebook_ads', 'Facebook Ads'),
        ('linkedin_ads', 'LinkedIn Ads'),
        ('tiktok_ads', 'TikTok Ads'),
        ('youtube_ads', 'YouTube Ads'),
    ]

    name = models.CharField(max_length=100, verbose_name="Nombre de la Plataforma")
    platform_type = models.CharField(
        max_length=20, 
        choices=PLATFORM_CHOICES, 
        verbose_name="Tipo de Plataforma"
    )
    api_key = models.TextField(verbose_name="API Key", help_text="Clave API encriptada")
    api_secret = models.TextField(blank=True, verbose_name="API Secret")
    access_token = models.TextField(blank=True, verbose_name="Access Token")
    refresh_token = models.TextField(blank=True, verbose_name="Refresh Token")
    
    # Configuration
    account_id = models.CharField(max_length=100, blank=True, verbose_name="Account ID")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    last_sync = models.DateTimeField(null=True, blank=True, verbose_name="Última Sincronización")
    sync_frequency_hours = models.IntegerField(default=24, verbose_name="Frecuencia de Sincronización (horas)")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Plataforma de Marketing"
        verbose_name_plural = "Plataformas de Marketing"
        unique_together = ['platform_type', 'account_id']

    def __str__(self):
        return f"{self.name} ({self.platform_type})"


class MarketingCampaign(models.Model):
    """Campañas de marketing digital"""
    
    STATUS_CHOICES = [
        ('active', 'Activa'),
        ('paused', 'Pausada'),
        ('ended', 'Finalizada'),
        ('draft', 'Borrador'),
    ]

    platform = models.ForeignKey(
        MarketingPlatform, 
        on_delete=models.CASCADE, 
        verbose_name="Plataforma"
    )
    campaign_id = models.CharField(max_length=100, verbose_name="ID de Campaña")
    name = models.CharField(max_length=200, verbose_name="Nombre de la Campaña")
    objective = models.CharField(max_length=100, blank=True, verbose_name="Objetivo")
    
    # Dates
    start_date = models.DateField(verbose_name="Fecha de Inicio")
    end_date = models.DateField(null=True, blank=True, verbose_name="Fecha de Fin")
    
    # Budget
    daily_budget = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0, 
        verbose_name="Presupuesto Diario"
    )
    total_budget = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0, 
        verbose_name="Presupuesto Total"
    )
    
    # Status
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='active', 
        verbose_name="Estado"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Campaña de Marketing"
        verbose_name_plural = "Campañas de Marketing"
        unique_together = ['platform', 'campaign_id']

    def __str__(self):
        return f"{self.name} - {self.platform.platform_type}"


class MarketingMetrics(models.Model):
    """Métricas diarias de marketing digital"""
    
    campaign = models.ForeignKey(
        MarketingCampaign, 
        on_delete=models.CASCADE, 
        related_name='metrics',
        verbose_name="Campaña"
    )
    date = models.DateField(verbose_name="Fecha")
    
    # Reach and Impressions
    impressions = models.BigIntegerField(default=0, verbose_name="Impresiones")
    reach = models.BigIntegerField(default=0, verbose_name="Alcance")
    unique_users = models.BigIntegerField(default=0, verbose_name="Usuarios Únicos")
    
    # Engagement
    clicks = models.IntegerField(default=0, verbose_name="Clics")
    likes = models.IntegerField(default=0, verbose_name="Me Gusta")
    comments = models.IntegerField(default=0, verbose_name="Comentarios")
    shares = models.IntegerField(default=0, verbose_name="Compartidos")
    saves = models.IntegerField(default=0, verbose_name="Guardados")
    
    # Conversions
    conversions = models.IntegerField(default=0, verbose_name="Conversiones")
    leads = models.IntegerField(default=0, verbose_name="Leads")
    purchases = models.IntegerField(default=0, verbose_name="Compras")
    
    # Costs
    spend = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0, 
        verbose_name="Gasto"
    )
    cost_per_click = models.DecimalField(
        max_digits=10, 
        decimal_places=4, 
        default=0, 
        verbose_name="Costo por Clic (CPC)"
    )
    cost_per_impression = models.DecimalField(
        max_digits=10, 
        decimal_places=4, 
        default=0, 
        verbose_name="Costo por Mil Impresiones (CPM)"
    )
    cost_per_conversion = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0, 
        verbose_name="Costo por Conversión"
    )
    
    # Revenue
    revenue = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0, 
        verbose_name="Ingresos"
    )
    
    # Additional metrics (JSON field for platform-specific metrics)
    additional_metrics = models.JSONField(
        default=dict, 
        blank=True, 
        verbose_name="Métricas Adicionales"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Métrica de Marketing"
        verbose_name_plural = "Métricas de Marketing"
        unique_together = ['campaign', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.campaign.name} - {self.date}"

    @property
    def click_through_rate(self):
        """Calcula el CTR (Click Through Rate)"""
        if self.impressions > 0:
            return (self.clicks / self.impressions) * 100
        return 0

    @property
    def conversion_rate(self):
        """Calcula la tasa de conversión"""
        if self.clicks > 0:
            return (self.conversions / self.clicks) * 100
        return 0

    @property
    def engagement_rate(self):
        """Calcula la tasa de engagement"""
        if self.impressions > 0:
            total_engagement = self.likes + self.comments + self.shares + self.saves
            return (total_engagement / self.impressions) * 100
        return 0

    @property
    def return_on_ad_spend(self):
        """Calcula el ROAS (Return on Ad Spend)"""
        if self.spend > 0:
            return (self.revenue / self.spend) * 100
        return 0


class MarketingInsight(models.Model):
    """Insights automáticos de marketing"""
    
    INSIGHT_TYPE_CHOICES = [
        ('performance', 'Rendimiento'),
        ('audience', 'Audiencia'),
        ('creative', 'Creativos'),
        ('budget', 'Presupuesto'),
        ('optimization', 'Optimización'),
        ('trend', 'Tendencia'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Baja'),
        ('medium', 'Media'),
        ('high', 'Alta'),
        ('critical', 'Crítica'),
    ]

    campaign = models.ForeignKey(
        MarketingCampaign, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        verbose_name="Campaña"
    )
    insight_type = models.CharField(
        max_length=20, 
        choices=INSIGHT_TYPE_CHOICES, 
        verbose_name="Tipo de Insight"
    )
    priority = models.CharField(
        max_length=10, 
        choices=PRIORITY_CHOICES, 
        default='medium', 
        verbose_name="Prioridad"
    )
    
    title = models.CharField(max_length=200, verbose_name="Título")
    description = models.TextField(verbose_name="Descripción")
    
    # Metrics that triggered the insight
    trigger_metrics = models.JSONField(
        default=dict, 
        verbose_name="Métricas Disparadoras"
    )
    
    # Recommended actions
    recommended_actions = models.JSONField(
        default=list, 
        verbose_name="Acciones Recomendadas"
    )
    
    # Impact estimation
    estimated_impact = models.TextField(
        blank=True, 
        verbose_name="Impacto Estimado"
    )
    
    confidence_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0, 
        verbose_name="Puntuación de Confianza (%)"
    )
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    acknowledged = models.BooleanField(default=False, verbose_name="Reconocido")
    acknowledged_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        verbose_name="Reconocido por"
    )
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Insight de Marketing"
        verbose_name_plural = "Insights de Marketing"
        ordering = ['-created_at', '-priority']

    def __str__(self):
        return f"{self.title} ({self.priority})"


class MarketingAudienceInsight(models.Model):
    """Insights de audiencia por plataforma"""
    
    platform = models.ForeignKey(
        MarketingPlatform, 
        on_delete=models.CASCADE, 
        verbose_name="Plataforma"
    )
    date = models.DateField(verbose_name="Fecha")
    
    # Demographics
    age_groups = models.JSONField(
        default=dict, 
        verbose_name="Grupos de Edad"
    )  # {"18-24": 25, "25-34": 40, ...}
    
    gender_distribution = models.JSONField(
        default=dict, 
        verbose_name="Distribución por Género"
    )  # {"male": 60, "female": 40}
    
    top_locations = models.JSONField(
        default=list, 
        verbose_name="Principales Ubicaciones"
    )  # [{"city": "Lima", "percentage": 45}, ...]
    
    interests = models.JSONField(
        default=list, 
        verbose_name="Intereses"
    )  # [{"interest": "Construction", "affinity": 85}, ...]
    
    device_types = models.JSONField(
        default=dict, 
        verbose_name="Tipos de Dispositivo"
    )  # {"mobile": 70, "desktop": 25, "tablet": 5}
    
    # Behavior
    peak_hours = models.JSONField(
        default=dict, 
        verbose_name="Horas Pico"
    )  # {"Monday": [9, 14, 18], ...}
    
    engagement_by_content_type = models.JSONField(
        default=dict, 
        verbose_name="Engagement por Tipo de Contenido"
    )  # {"video": 4.5, "image": 3.2, "carousel": 3.8}
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Insight de Audiencia"
        verbose_name_plural = "Insights de Audiencia"
        unique_together = ['platform', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"Audiencia {self.platform.name} - {self.date}"


class MarketingBudgetOptimization(models.Model):
    """Recomendaciones de optimización de presupuesto"""
    
    ACTION_CHOICES = [
        ('increase_budget', 'Aumentar Presupuesto'),
        ('decrease_budget', 'Disminuir Presupuesto'),
        ('pause_campaign', 'Pausar Campaña'),
        ('redistribute_budget', 'Redistribuir Presupuesto'),
        ('change_bidding', 'Cambiar Estrategia de Puja'),
    ]

    campaign = models.ForeignKey(
        MarketingCampaign, 
        on_delete=models.CASCADE, 
        verbose_name="Campaña"
    )
    
    recommended_action = models.CharField(
        max_length=30, 
        choices=ACTION_CHOICES, 
        verbose_name="Acción Recomendada"
    )
    
    current_budget = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        verbose_name="Presupuesto Actual"
    )
    recommended_budget = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        verbose_name="Presupuesto Recomendado"
    )
    
    expected_improvement = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        verbose_name="Mejora Esperada (%)"
    )
    
    reasoning = models.TextField(verbose_name="Razonamiento")
    
    confidence_level = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        verbose_name="Nivel de Confianza (%)"
    )
    
    # Implementation status
    implemented = models.BooleanField(default=False, verbose_name="Implementado")
    implemented_at = models.DateTimeField(null=True, blank=True)
    implemented_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        verbose_name="Implementado por"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Optimización de Presupuesto"
        verbose_name_plural = "Optimizaciones de Presupuesto"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.campaign.name} - {self.recommended_action}"