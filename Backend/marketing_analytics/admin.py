from django.contrib import admin
from .models import (
    MarketingPlatform, MarketingCampaign, MarketingMetrics, 
    MarketingInsight, MarketingAudienceInsight, MarketingBudgetOptimization
)


@admin.register(MarketingPlatform)
class MarketingPlatformAdmin(admin.ModelAdmin):
    list_display = ['name', 'platform_type', 'account_id', 'is_active', 'last_sync', 'created_at']
    list_filter = ['platform_type', 'is_active', 'created_at']
    search_fields = ['name', 'account_id']
    readonly_fields = ['created_at', 'updated_at', 'last_sync']
    
    fieldsets = (
        ('Información General', {
            'fields': ('name', 'platform_type', 'account_id', 'is_active')
        }),
        ('Credenciales', {
            'fields': ('api_key', 'api_secret', 'access_token', 'refresh_token'),
            'classes': ['collapse']
        }),
        ('Configuración de Sincronización', {
            'fields': ('sync_frequency_hours', 'last_sync')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ['collapse']
        })
    )


@admin.register(MarketingCampaign)
class MarketingCampaignAdmin(admin.ModelAdmin):
    list_display = ['name', 'platform', 'status', 'start_date', 'end_date', 'daily_budget', 'created_at']
    list_filter = ['platform__platform_type', 'status', 'start_date', 'created_at']
    search_fields = ['name', 'campaign_id', 'objective']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Información General', {
            'fields': ('platform', 'campaign_id', 'name', 'objective', 'status')
        }),
        ('Fechas', {
            'fields': ('start_date', 'end_date')
        }),
        ('Presupuesto', {
            'fields': ('daily_budget', 'total_budget')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ['collapse']
        })
    )


@admin.register(MarketingMetrics)
class MarketingMetricsAdmin(admin.ModelAdmin):
    list_display = ['campaign', 'date', 'impressions', 'clicks', 'spend', 'conversions', 'revenue']
    list_filter = ['campaign__platform__platform_type', 'date', 'created_at']
    search_fields = ['campaign__name']
    readonly_fields = ['click_through_rate', 'conversion_rate', 'engagement_rate', 'return_on_ad_spend', 'created_at']
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Información General', {
            'fields': ('campaign', 'date')
        }),
        ('Métricas de Alcance', {
            'fields': ('impressions', 'reach', 'unique_users')
        }),
        ('Métricas de Engagement', {
            'fields': ('clicks', 'likes', 'comments', 'shares', 'saves')
        }),
        ('Métricas de Conversión', {
            'fields': ('conversions', 'leads', 'purchases')
        }),
        ('Métricas de Costo', {
            'fields': ('spend', 'cost_per_click', 'cost_per_impression', 'cost_per_conversion')
        }),
        ('Revenue', {
            'fields': ('revenue',)
        }),
        ('Métricas Calculadas', {
            'fields': ('click_through_rate', 'conversion_rate', 'engagement_rate', 'return_on_ad_spend'),
            'classes': ['collapse']
        }),
        ('Adicionales', {
            'fields': ('additional_metrics',),
            'classes': ['collapse']
        })
    )


@admin.register(MarketingInsight)
class MarketingInsightAdmin(admin.ModelAdmin):
    list_display = ['title', 'campaign', 'insight_type', 'priority', 'confidence_score', 'acknowledged', 'created_at']
    list_filter = ['insight_type', 'priority', 'acknowledged', 'is_active', 'created_at']
    search_fields = ['title', 'description', 'campaign__name']
    readonly_fields = ['created_at', 'acknowledged_at']
    
    fieldsets = (
        ('Información General', {
            'fields': ('campaign', 'insight_type', 'priority', 'title', 'description')
        }),
        ('Detalles del Insight', {
            'fields': ('trigger_metrics', 'recommended_actions', 'estimated_impact', 'confidence_score')
        }),
        ('Estado', {
            'fields': ('is_active', 'acknowledged', 'acknowledged_by', 'acknowledged_at')
        })
    )
    
    def save_model(self, request, obj, form, change):
        if obj.acknowledged and not obj.acknowledged_by:
            obj.acknowledged_by = request.user
            from django.utils import timezone
            obj.acknowledged_at = timezone.now()
        super().save_model(request, obj, form, change)


@admin.register(MarketingAudienceInsight)
class MarketingAudienceInsightAdmin(admin.ModelAdmin):
    list_display = ['platform', 'date', 'created_at']
    list_filter = ['platform__platform_type', 'date', 'created_at']
    search_fields = ['platform__name']
    readonly_fields = ['created_at']
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Información General', {
            'fields': ('platform', 'date')
        }),
        ('Demografía', {
            'fields': ('age_groups', 'gender_distribution')
        }),
        ('Geografía', {
            'fields': ('top_locations',)
        }),
        ('Intereses y Comportamiento', {
            'fields': ('interests', 'device_types', 'peak_hours', 'engagement_by_content_type')
        })
    )


@admin.register(MarketingBudgetOptimization)
class MarketingBudgetOptimizationAdmin(admin.ModelAdmin):
    list_display = ['campaign', 'recommended_action', 'current_budget', 'recommended_budget', 'expected_improvement', 'implemented', 'created_at']
    list_filter = ['recommended_action', 'implemented', 'created_at']
    search_fields = ['campaign__name', 'reasoning']
    readonly_fields = ['created_at', 'implemented_at']
    
    fieldsets = (
        ('Información General', {
            'fields': ('campaign', 'recommended_action')
        }),
        ('Presupuesto', {
            'fields': ('current_budget', 'recommended_budget', 'expected_improvement')
        }),
        ('Detalles', {
            'fields': ('reasoning', 'confidence_level')
        }),
        ('Estado de Implementación', {
            'fields': ('implemented', 'implemented_at', 'implemented_by')
        })
    )
    
    def save_model(self, request, obj, form, change):
        if obj.implemented and not obj.implemented_by:
            obj.implemented_by = request.user
            from django.utils import timezone
            obj.implemented_at = timezone.now()
        super().save_model(request, obj, form, change)