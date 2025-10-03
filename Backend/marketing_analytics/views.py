from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Avg, Q, Count
from django.utils import timezone
from datetime import datetime, timedelta, date
from decimal import Decimal
import json

from .models import (
    MarketingPlatform, MarketingCampaign, MarketingMetrics, 
    MarketingInsight, MarketingAudienceInsight, MarketingBudgetOptimization
)
from .serializers import (
    MarketingPlatformSerializer, MarketingCampaignSerializer, MarketingMetricsSerializer,
    MarketingInsightSerializer, MarketingAudienceInsightSerializer, 
    MarketingBudgetOptimizationSerializer, MarketingDashboardSerializer,
    MarketingReportSerializer, MarketingPlatformConfigSerializer
)
from .services import MarketingDataSyncService, MarketingInsightsGenerator


class MarketingPlatformViewSet(viewsets.ModelViewSet):
    """ViewSet para plataformas de marketing"""
    
    queryset = MarketingPlatform.objects.all()
    serializer_class = MarketingPlatformSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def sync_data(self, request, pk=None):
        """Sincroniza datos de la plataforma"""
        platform = self.get_object()
        days_back = request.data.get('days_back', 7)
        
        success = MarketingDataSyncService.sync_platform_data(platform, days_back)
        
        if success:
            return Response({
                'status': 'success',
                'message': f'Datos sincronizados correctamente para {platform.name}',
                'last_sync': platform.last_sync
            })
        else:
            return Response({
                'status': 'error',
                'message': 'Error al sincronizar datos. Verifique las credenciales.'
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def test_connection(self, request, pk=None):
        """Prueba la conexión con la plataforma"""
        platform = self.get_object()
        
        if platform.platform_type == 'google_ads':
            from .services import GoogleAdsService
            service = GoogleAdsService(platform)
            connected = service.authenticate()
        elif platform.platform_type == 'instagram':
            from .services import InstagramService
            service = InstagramService(platform)
            connected = service.authenticate()
        else:
            connected = False
        
        return Response({
            'connected': connected,
            'platform': platform.platform_type,
            'message': 'Conexión exitosa' if connected else 'Error de conexión'
        })

    @action(detail=False, methods=['post'])
    def configure_platform(self, request):
        """Configura una nueva plataforma"""
        serializer = MarketingPlatformConfigSerializer(data=request.data)
        
        if serializer.is_valid():
            validated_data = serializer.validated_data
            platform_type = validated_data['platform_type']
            
            # Create platform based on type
            platform_data = {
                'name': validated_data['name'],
                'platform_type': platform_type,
                'sync_frequency_hours': validated_data.get('sync_frequency_hours', 24),
                'access_token': validated_data.get('access_token', ''),
                'refresh_token': validated_data.get('refresh_token', '')
            }
            
            if platform_type == 'google_ads':
                platform_data.update({
                    'account_id': validated_data.get('google_ads_customer_id', ''),
                    'api_key': validated_data.get('google_ads_developer_token', '')
                })
            elif platform_type == 'instagram':
                platform_data.update({
                    'account_id': validated_data.get('instagram_account_id', ''),
                    'api_key': validated_data.get('facebook_app_id', ''),
                    'api_secret': validated_data.get('facebook_app_secret', '')
                })
            
            platform = MarketingPlatform.objects.create(**platform_data)
            
            return Response(
                MarketingPlatformSerializer(platform).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False)
    def sync_all(self, request):
        """Sincroniza todas las plataformas activas"""
        active_platforms = MarketingPlatform.objects.filter(is_active=True)
        results = []
        
        for platform in active_platforms:
            success = MarketingDataSyncService.sync_platform_data(platform)
            results.append({
                'platform': platform.name,
                'platform_type': platform.platform_type,
                'success': success,
                'last_sync': platform.last_sync
            })
        
        return Response({
            'total_platforms': len(results),
            'successful_syncs': len([r for r in results if r['success']]),
            'results': results
        })


class MarketingCampaignViewSet(viewsets.ModelViewSet):
    """ViewSet para campañas de marketing"""
    
    queryset = MarketingCampaign.objects.all()
    serializer_class = MarketingCampaignSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by platform
        platform_id = self.request.query_params.get('platform')
        if platform_id:
            queryset = queryset.filter(platform_id=platform_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(start_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(start_date__lte=end_date)
        
        return queryset.select_related('platform').prefetch_related('metrics')

    @action(detail=True)
    def metrics(self, request, pk=None):
        """Obtiene métricas de una campaña específica"""
        campaign = self.get_object()
        
        # Date range filter
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        metrics_qs = campaign.metrics.all()
        
        if start_date:
            metrics_qs = metrics_qs.filter(date__gte=start_date)
        if end_date:
            metrics_qs = metrics_qs.filter(date__lte=end_date)
        
        metrics = metrics_qs.order_by('-date')
        serializer = MarketingMetricsSerializer(metrics, many=True)
        
        return Response(serializer.data)

    @action(detail=True)
    def performance_summary(self, request, pk=None):
        """Resumen de rendimiento de la campaña"""
        campaign = self.get_object()
        
        # Get metrics for last 30 days
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=30)
        
        metrics = campaign.metrics.filter(
            date__gte=start_date,
            date__lte=end_date
        )
        
        if not metrics.exists():
            return Response({
                'message': 'No hay métricas disponibles para este período'
            })
        
        # Calculate aggregated metrics
        totals = metrics.aggregate(
            total_spend=Sum('spend'),
            total_revenue=Sum('revenue'),
            total_impressions=Sum('impressions'),
            total_clicks=Sum('clicks'),
            total_conversions=Sum('conversions')
        )
        
        # Calculate rates
        total_impressions = totals['total_impressions'] or 0
        total_clicks = totals['total_clicks'] or 0
        total_spend = totals['total_spend'] or Decimal('0')
        total_revenue = totals['total_revenue'] or Decimal('0')
        
        ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
        conversion_rate = (totals['total_conversions'] / total_clicks * 100) if total_clicks > 0 else 0
        roas = (total_revenue / total_spend * 100) if total_spend > 0 else 0
        
        # Get daily trend data
        daily_metrics = list(metrics.order_by('date').values(
            'date', 'spend', 'revenue', 'clicks', 'conversions', 'impressions'
        ))
        
        return Response({
            'period': {
                'start_date': start_date,
                'end_date': end_date,
                'days': 30
            },
            'totals': {
                **totals,
                'ctr': round(ctr, 2),
                'conversion_rate': round(conversion_rate, 2),
                'roas': round(float(roas), 2)
            },
            'daily_metrics': daily_metrics,
            'performance_status': self._get_performance_status(roas, ctr, conversion_rate)
        })

    @action(detail=True)
    def generate_insights(self, request, pk=None):
        """Genera insights automáticos para la campaña"""
        campaign = self.get_object()
        
        # Generate different types of insights
        performance_insights = MarketingInsightsGenerator.generate_performance_insights(campaign)
        budget_insights = MarketingInsightsGenerator.generate_budget_optimization_insights(campaign)
        
        # Save insights to database
        for insight_data in performance_insights + budget_insights:
            MarketingInsight.objects.create(
                campaign=campaign,
                insight_type=insight_data['type'],
                priority=insight_data['priority'],
                title=insight_data['title'],
                description=insight_data['description'],
                recommended_actions=insight_data['recommended_actions'],
                confidence_score=insight_data['confidence_score']
            )
        
        # Return recent insights
        recent_insights = MarketingInsight.objects.filter(
            campaign=campaign
        ).order_by('-created_at')[:10]
        
        serializer = MarketingInsightSerializer(recent_insights, many=True)
        return Response(serializer.data)

    def _get_performance_status(self, roas, ctr, conversion_rate):
        """Determina el estado de rendimiento"""
        if roas >= 300 and ctr >= 2 and conversion_rate >= 3:
            return 'excellent'
        elif roas >= 200 and ctr >= 1.5 and conversion_rate >= 2:
            return 'good'
        elif roas >= 100 and ctr >= 1 and conversion_rate >= 1:
            return 'average'
        else:
            return 'poor'


class MarketingMetricsViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para métricas de marketing (solo lectura)"""
    
    queryset = MarketingMetrics.objects.all()
    serializer_class = MarketingMetricsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by campaign
        campaign_id = self.request.query_params.get('campaign')
        if campaign_id:
            queryset = queryset.filter(campaign_id=campaign_id)
        
        # Filter by platform
        platform_id = self.request.query_params.get('platform')
        if platform_id:
            queryset = queryset.filter(campaign__platform_id=platform_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        return queryset.select_related('campaign__platform').order_by('-date')

    @action(detail=False)
    def summary(self, request):
        """Resumen de métricas agregadas"""
        queryset = self.get_queryset()
        
        # Calculate totals
        totals = queryset.aggregate(
            total_spend=Sum('spend'),
            total_revenue=Sum('revenue'),
            total_impressions=Sum('impressions'),
            total_clicks=Sum('clicks'),
            total_conversions=Sum('conversions'),
            total_likes=Sum('likes'),
            total_comments=Sum('comments'),
            total_shares=Sum('shares')
        )
        
        # Calculate averages and rates
        total_impressions = totals['total_impressions'] or 0
        total_clicks = totals['total_clicks'] or 0
        total_spend = totals['total_spend'] or Decimal('0')
        total_revenue = totals['total_revenue'] or Decimal('0')
        
        overall_ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
        overall_conversion_rate = (totals['total_conversions'] / total_clicks * 100) if total_clicks > 0 else 0
        overall_roas = (total_revenue / total_spend * 100) if total_spend > 0 else 0
        
        return Response({
            'totals': totals,
            'calculated_metrics': {
                'overall_ctr': round(overall_ctr, 2),
                'overall_conversion_rate': round(overall_conversion_rate, 2),
                'overall_roas': round(float(overall_roas), 2),
                'cost_per_click': float(total_spend / total_clicks) if total_clicks > 0 else 0,
                'cost_per_conversion': float(total_spend / totals['total_conversions']) if totals['total_conversions'] > 0 else 0
            },
            'date_range': {
                'start_date': request.query_params.get('start_date'),
                'end_date': request.query_params.get('end_date')
            }
        })


class MarketingInsightViewSet(viewsets.ModelViewSet):
    """ViewSet para insights de marketing"""
    
    queryset = MarketingInsight.objects.all()
    serializer_class = MarketingInsightSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by campaign
        campaign_id = self.request.query_params.get('campaign')
        if campaign_id:
            queryset = queryset.filter(campaign_id=campaign_id)
        
        # Filter by type
        insight_type = self.request.query_params.get('type')
        if insight_type:
            queryset = queryset.filter(insight_type=insight_type)
        
        # Filter by priority
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Filter active insights
        active_only = self.request.query_params.get('active_only')
        if active_only == 'true':
            queryset = queryset.filter(is_active=True, acknowledged=False)
        
        return queryset.select_related('campaign__platform', 'acknowledged_by')

    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """Marca un insight como reconocido"""
        insight = self.get_object()
        
        insight.acknowledged = True
        insight.acknowledged_by = request.user
        insight.acknowledged_at = timezone.now()
        insight.save()
        
        return Response({
            'status': 'acknowledged',
            'acknowledged_at': insight.acknowledged_at,
            'acknowledged_by': request.user.get_full_name()
        })

    @action(detail=False)
    def priority_summary(self, request):
        """Resumen de insights por prioridad"""
        queryset = self.get_queryset().filter(is_active=True, acknowledged=False)
        
        priority_counts = queryset.values('priority').annotate(
            count=Count('id')
        ).order_by('priority')
        
        type_counts = queryset.values('insight_type').annotate(
            count=Count('id')
        ).order_by('insight_type')
        
        return Response({
            'total_active': queryset.count(),
            'by_priority': list(priority_counts),
            'by_type': list(type_counts),
            'recent_insights': MarketingInsightSerializer(
                queryset.order_by('-created_at')[:5], many=True
            ).data
        })


class MarketingDashboardViewSet(viewsets.ViewSet):
    """ViewSet para dashboard de marketing"""
    
    permission_classes = [IsAuthenticated]

    @action(detail=False)
    def overview(self, request):
        """Dashboard general de marketing"""
        # Date range (default: last 30 days)
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=30)
        
        # Custom date range from params
        if request.query_params.get('start_date'):
            start_date = datetime.strptime(request.query_params.get('start_date'), '%Y-%m-%d').date()
        if request.query_params.get('end_date'):
            end_date = datetime.strptime(request.query_params.get('end_date'), '%Y-%m-%d').date()
        
        # Get all metrics for the period
        metrics = MarketingMetrics.objects.filter(
            date__gte=start_date,
            date__lte=end_date
        )
        
        # Calculate totals
        totals = metrics.aggregate(
            total_spend=Sum('spend'),
            total_revenue=Sum('revenue'),
            total_impressions=Sum('impressions'),
            total_clicks=Sum('clicks'),
            total_conversions=Sum('conversions')
        )
        
        # Calculate rates
        total_impressions = totals['total_impressions'] or 0
        total_clicks = totals['total_clicks'] or 0
        total_spend = totals['total_spend'] or Decimal('0')
        total_revenue = totals['total_revenue'] or Decimal('0')
        
        overall_ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
        overall_conversion_rate = (totals['total_conversions'] / total_clicks * 100) if total_clicks > 0 else 0
        overall_roas = (total_revenue / total_spend * 100) if total_spend > 0 else 0
        
        # Platform performance
        platform_performance = []
        platforms = MarketingPlatform.objects.filter(is_active=True)
        
        for platform in platforms:
            platform_metrics = metrics.filter(campaign__platform=platform)
            if platform_metrics.exists():
                platform_totals = platform_metrics.aggregate(
                    spend=Sum('spend'),
                    revenue=Sum('revenue'),
                    conversions=Sum('conversions')
                )
                
                platform_roas = 0
                if platform_totals['spend'] and platform_totals['spend'] > 0:
                    platform_roas = (platform_totals['revenue'] / platform_totals['spend'] * 100)
                
                platform_performance.append({
                    'platform': platform.platform_type,
                    'name': platform.name,
                    'spend': float(platform_totals['spend'] or 0),
                    'revenue': float(platform_totals['revenue'] or 0),
                    'conversions': platform_totals['conversions'] or 0,
                    'roas': round(float(platform_roas), 2)
                })
        
        # Top campaigns
        top_campaigns_data = MarketingCampaign.objects.filter(
            metrics__date__gte=start_date,
            metrics__date__lte=end_date
        ).annotate(
            total_revenue=Sum('metrics__revenue'),
            total_spend=Sum('metrics__spend'),
            total_conversions=Sum('metrics__conversions')
        ).filter(
            total_revenue__gt=0
        ).order_by('-total_revenue')[:5]
        
        # Recent insights
        recent_insights = MarketingInsight.objects.filter(
            is_active=True,
            created_at__gte=start_date
        ).order_by('-created_at')[:5]
        
        # Budget recommendations
        budget_recommendations = MarketingBudgetOptimization.objects.filter(
            implemented=False,
            created_at__gte=start_date
        ).order_by('-confidence_level')[:5]
        
        # Prepare dashboard data
        dashboard_data = {
            'total_spend': float(total_spend),
            'total_revenue': float(total_revenue),
            'total_conversions': totals['total_conversions'] or 0,
            'total_impressions': total_impressions,
            'total_clicks': total_clicks,
            'overall_roas': round(float(overall_roas), 2),
            'overall_ctr': round(overall_ctr, 2),
            'overall_conversion_rate': round(overall_conversion_rate, 2),
            'platform_performance': platform_performance,
            'top_campaigns': MarketingCampaignSerializer(top_campaigns_data, many=True).data,
            'recent_insights': MarketingInsightSerializer(recent_insights, many=True).data,
            'budget_recommendations': MarketingBudgetOptimizationSerializer(budget_recommendations, many=True).data,
            'audience_summary': self._get_audience_summary()
        }
        
        serializer = MarketingDashboardSerializer(dashboard_data)
        return Response(serializer.data)

    @action(detail=False)
    def performance_trends(self, request):
        """Tendencias de rendimiento"""
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Daily metrics
        daily_metrics = MarketingMetrics.objects.filter(
            date__gte=start_date,
            date__lte=end_date
        ).values('date').annotate(
            daily_spend=Sum('spend'),
            daily_revenue=Sum('revenue'),
            daily_clicks=Sum('clicks'),
            daily_conversions=Sum('conversions'),
            daily_impressions=Sum('impressions')
        ).order_by('date')
        
        # Calculate daily rates
        trend_data = []
        for day in daily_metrics:
            daily_roas = 0
            daily_ctr = 0
            
            if day['daily_spend'] and day['daily_spend'] > 0:
                daily_roas = (day['daily_revenue'] / day['daily_spend'] * 100)
            
            if day['daily_impressions'] and day['daily_impressions'] > 0:
                daily_ctr = (day['daily_clicks'] / day['daily_impressions'] * 100)
            
            trend_data.append({
                'date': day['date'],
                'spend': float(day['daily_spend'] or 0),
                'revenue': float(day['daily_revenue'] or 0),
                'clicks': day['daily_clicks'] or 0,
                'conversions': day['daily_conversions'] or 0,
                'impressions': day['daily_impressions'] or 0,
                'roas': round(daily_roas, 2),
                'ctr': round(daily_ctr, 2)
            })
        
        return Response({
            'period': {
                'start_date': start_date,
                'end_date': end_date,
                'days': days
            },
            'daily_trends': trend_data
        })

    def _get_audience_summary(self):
        """Obtiene resumen de audiencia"""
        recent_audience = MarketingAudienceInsight.objects.order_by('-date').first()
        
        if not recent_audience:
            return {}
        
        return {
            'top_age_group': max(recent_audience.age_groups.items(), key=lambda x: x[1]) if recent_audience.age_groups else None,
            'gender_distribution': recent_audience.gender_distribution,
            'top_location': recent_audience.top_locations[0] if recent_audience.top_locations else None,
            'device_breakdown': recent_audience.device_types
        }