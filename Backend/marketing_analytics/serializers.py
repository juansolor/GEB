from rest_framework import serializers
from .models import (
    MarketingPlatform, MarketingCampaign, MarketingMetrics, 
    MarketingInsight, MarketingAudienceInsight, MarketingBudgetOptimization
)


class MarketingPlatformSerializer(serializers.ModelSerializer):
    """Serializer para plataformas de marketing"""
    
    # Hide sensitive information
    api_key = serializers.CharField(write_only=True, required=False)
    api_secret = serializers.CharField(write_only=True, required=False)
    access_token = serializers.CharField(write_only=True, required=False)
    refresh_token = serializers.CharField(write_only=True, required=False)
    
    # Read-only computed fields
    status = serializers.SerializerMethodField()
    campaigns_count = serializers.SerializerMethodField()
    last_sync_humanized = serializers.SerializerMethodField()

    class Meta:
        model = MarketingPlatform
        fields = [
            'id', 'name', 'platform_type', 'account_id', 'is_active', 
            'last_sync', 'last_sync_humanized', 'sync_frequency_hours',
            'api_key', 'api_secret', 'access_token', 'refresh_token',
            'status', 'campaigns_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'last_sync']

    def get_status(self, obj):
        """Determina el estado de la plataforma"""
        if not obj.is_active:
            return 'inactive'
        
        if obj.last_sync:
            from datetime import datetime, timedelta
            if obj.last_sync < datetime.now().replace(tzinfo=obj.last_sync.tzinfo) - timedelta(hours=obj.sync_frequency_hours * 2):
                return 'sync_needed'
        
        return 'active'

    def get_campaigns_count(self, obj):
        """Cuenta las campañas activas"""
        return obj.marketingcampaign_set.filter(status='active').count()

    def get_last_sync_humanized(self, obj):
        """Formato humanizado de la última sincronización"""
        if not obj.last_sync:
            return 'Nunca sincronizado'
        
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.last_sync
        
        if diff < timedelta(minutes=1):
            return 'Hace menos de un minuto'
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f'Hace {minutes} minutos'
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f'Hace {hours} horas'
        else:
            days = diff.days
            return f'Hace {days} días'


class MarketingCampaignSerializer(serializers.ModelSerializer):
    """Serializer para campañas de marketing"""
    
    platform_name = serializers.CharField(source='platform.name', read_only=True)
    platform_type = serializers.CharField(source='platform.platform_type', read_only=True)
    
    # Computed metrics
    total_spend = serializers.SerializerMethodField()
    total_conversions = serializers.SerializerMethodField()
    avg_ctr = serializers.SerializerMethodField()
    avg_conversion_rate = serializers.SerializerMethodField()
    roas = serializers.SerializerMethodField()
    performance_status = serializers.SerializerMethodField()

    class Meta:
        model = MarketingCampaign
        fields = [
            'id', 'campaign_id', 'name', 'objective', 'platform', 
            'platform_name', 'platform_type', 'start_date', 'end_date',
            'daily_budget', 'total_budget', 'status',
            'total_spend', 'total_conversions', 'avg_ctr', 
            'avg_conversion_rate', 'roas', 'performance_status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_total_spend(self, obj):
        """Calcula el gasto total de la campaña"""
        return obj.metrics.aggregate(
            total=serializers.models.Sum('spend')
        )['total'] or 0

    def get_total_conversions(self, obj):
        """Calcula las conversiones totales"""
        return obj.metrics.aggregate(
            total=serializers.models.Sum('conversions')
        )['total'] or 0

    def get_avg_ctr(self, obj):
        """Calcula el CTR promedio"""
        metrics = obj.metrics.all()
        if not metrics:
            return 0
        
        total_clicks = sum(m.clicks for m in metrics)
        total_impressions = sum(m.impressions for m in metrics)
        
        if total_impressions > 0:
            return round((total_clicks / total_impressions) * 100, 2)
        return 0

    def get_avg_conversion_rate(self, obj):
        """Calcula la tasa de conversión promedio"""
        metrics = obj.metrics.all()
        if not metrics:
            return 0
        
        total_conversions = sum(m.conversions for m in metrics)
        total_clicks = sum(m.clicks for m in metrics)
        
        if total_clicks > 0:
            return round((total_conversions / total_clicks) * 100, 2)
        return 0

    def get_roas(self, obj):
        """Calcula el ROAS promedio"""
        total_spend = self.get_total_spend(obj)
        total_revenue = obj.metrics.aggregate(
            total=serializers.models.Sum('revenue')
        )['total'] or 0
        
        if total_spend > 0:
            return round((total_revenue / total_spend) * 100, 2)
        return 0

    def get_performance_status(self, obj):
        """Determina el estado de rendimiento"""
        roas = self.get_roas(obj)
        ctr = self.get_avg_ctr(obj)
        
        if roas >= 300 and ctr >= 2:
            return 'excellent'
        elif roas >= 200 and ctr >= 1.5:
            return 'good'
        elif roas >= 100 and ctr >= 1:
            return 'average'
        else:
            return 'poor'


class MarketingMetricsSerializer(serializers.ModelSerializer):
    """Serializer para métricas de marketing"""
    
    campaign_name = serializers.CharField(source='campaign.name', read_only=True)
    platform_type = serializers.CharField(source='campaign.platform.platform_type', read_only=True)
    
    # Computed fields
    click_through_rate = serializers.ReadOnlyField()
    conversion_rate = serializers.ReadOnlyField()
    engagement_rate = serializers.ReadOnlyField()
    return_on_ad_spend = serializers.ReadOnlyField()

    class Meta:
        model = MarketingMetrics
        fields = [
            'id', 'campaign', 'campaign_name', 'platform_type', 'date',
            'impressions', 'reach', 'unique_users', 'clicks', 'likes', 
            'comments', 'shares', 'saves', 'conversions', 'leads', 'purchases',
            'spend', 'cost_per_click', 'cost_per_impression', 
            'cost_per_conversion', 'revenue', 'additional_metrics',
            'click_through_rate', 'conversion_rate', 'engagement_rate', 
            'return_on_ad_spend', 'created_at'
        ]
        read_only_fields = ['created_at']


class MarketingInsightSerializer(serializers.ModelSerializer):
    """Serializer para insights de marketing"""
    
    campaign_name = serializers.CharField(source='campaign.name', read_only=True)
    platform_type = serializers.CharField(source='campaign.platform.platform_type', read_only=True, allow_null=True)
    acknowledged_by_name = serializers.CharField(source='acknowledged_by.get_full_name', read_only=True)

    class Meta:
        model = MarketingInsight
        fields = [
            'id', 'campaign', 'campaign_name', 'platform_type',
            'insight_type', 'priority', 'title', 'description',
            'trigger_metrics', 'recommended_actions', 'estimated_impact',
            'confidence_score', 'is_active', 'acknowledged',
            'acknowledged_by', 'acknowledged_by_name', 'acknowledged_at',
            'created_at'
        ]
        read_only_fields = ['created_at', 'acknowledged_at']


class MarketingAudienceInsightSerializer(serializers.ModelSerializer):
    """Serializer para insights de audiencia"""
    
    platform_name = serializers.CharField(source='platform.name', read_only=True)
    platform_type = serializers.CharField(source='platform.platform_type', read_only=True)

    class Meta:
        model = MarketingAudienceInsight
        fields = [
            'id', 'platform', 'platform_name', 'platform_type', 'date',
            'age_groups', 'gender_distribution', 'top_locations', 
            'interests', 'device_types', 'peak_hours', 
            'engagement_by_content_type', 'created_at'
        ]
        read_only_fields = ['created_at']


class MarketingBudgetOptimizationSerializer(serializers.ModelSerializer):
    """Serializer para optimizaciones de presupuesto"""
    
    campaign_name = serializers.CharField(source='campaign.name', read_only=True)
    platform_type = serializers.CharField(source='campaign.platform.platform_type', read_only=True)
    implemented_by_name = serializers.CharField(source='implemented_by.get_full_name', read_only=True)
    
    # Budget change calculation
    budget_change = serializers.SerializerMethodField()
    budget_change_percentage = serializers.SerializerMethodField()

    class Meta:
        model = MarketingBudgetOptimization
        fields = [
            'id', 'campaign', 'campaign_name', 'platform_type',
            'recommended_action', 'current_budget', 'recommended_budget',
            'budget_change', 'budget_change_percentage',
            'expected_improvement', 'reasoning', 'confidence_level',
            'implemented', 'implemented_at', 'implemented_by',
            'implemented_by_name', 'created_at'
        ]
        read_only_fields = ['created_at', 'implemented_at']

    def get_budget_change(self, obj):
        """Calcula el cambio en presupuesto"""
        return obj.recommended_budget - obj.current_budget

    def get_budget_change_percentage(self, obj):
        """Calcula el porcentaje de cambio en presupuesto"""
        if obj.current_budget > 0:
            change = obj.recommended_budget - obj.current_budget
            return round((change / obj.current_budget) * 100, 2)
        return 0


class MarketingDashboardSerializer(serializers.Serializer):
    """Serializer para datos del dashboard de marketing"""
    
    # Overview metrics
    total_spend = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_conversions = serializers.IntegerField()
    total_impressions = serializers.IntegerField()
    total_clicks = serializers.IntegerField()
    
    # Calculated metrics
    overall_roas = serializers.DecimalField(max_digits=10, decimal_places=2)
    overall_ctr = serializers.DecimalField(max_digits=5, decimal_places=2)
    overall_conversion_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    
    # Performance by platform
    platform_performance = serializers.JSONField()
    
    # Top performing campaigns
    top_campaigns = MarketingCampaignSerializer(many=True, read_only=True)
    
    # Recent insights
    recent_insights = MarketingInsightSerializer(many=True, read_only=True)
    
    # Budget recommendations
    budget_recommendations = MarketingBudgetOptimizationSerializer(many=True, read_only=True)
    
    # Audience insights summary
    audience_summary = serializers.JSONField()


class MarketingReportSerializer(serializers.Serializer):
    """Serializer para reportes de marketing"""
    
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    
    # Filters
    platforms = serializers.ListField(child=serializers.CharField(), required=False)
    campaigns = serializers.ListField(child=serializers.CharField(), required=False)
    
    # Report data
    summary_metrics = serializers.JSONField()
    daily_metrics = serializers.JSONField()
    platform_comparison = serializers.JSONField()
    campaign_performance = serializers.JSONField()
    audience_insights = serializers.JSONField()
    
    # Charts data
    spend_trend = serializers.JSONField()
    conversion_trend = serializers.JSONField()
    roas_trend = serializers.JSONField()
    
    # Insights and recommendations
    insights = MarketingInsightSerializer(many=True, read_only=True)
    recommendations = serializers.JSONField()


class MarketingPlatformConfigSerializer(serializers.Serializer):
    """Serializer para configuración de plataformas"""
    
    platform_type = serializers.ChoiceField(choices=MarketingPlatform.PLATFORM_CHOICES)
    name = serializers.CharField(max_length=100)
    
    # Google Ads specific
    google_ads_customer_id = serializers.CharField(required=False, allow_blank=True)
    google_ads_developer_token = serializers.CharField(required=False, allow_blank=True)
    
    # Instagram/Facebook specific
    instagram_account_id = serializers.CharField(required=False, allow_blank=True)
    facebook_app_id = serializers.CharField(required=False, allow_blank=True)
    facebook_app_secret = serializers.CharField(required=False, allow_blank=True)
    
    # Common OAuth fields
    access_token = serializers.CharField(required=False, allow_blank=True)
    refresh_token = serializers.CharField(required=False, allow_blank=True)
    
    # Sync settings
    sync_frequency_hours = serializers.IntegerField(min_value=1, max_value=168, default=24)
    auto_sync_enabled = serializers.BooleanField(default=True)