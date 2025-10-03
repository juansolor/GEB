"""
Servicios para integración con Google Ads e Instagram Business API
"""

import os
import json
import requests
from datetime import datetime, timedelta, date
from decimal import Decimal
from typing import Dict, List, Optional, Any
from django.conf import settings
from django.utils import timezone
from .models import MarketingPlatform, MarketingCampaign, MarketingMetrics, MarketingInsight


class GoogleAdsService:
    """Servicio para integrar con Google Ads API"""
    
    def __init__(self, platform: MarketingPlatform):
        self.platform = platform
        self.base_url = "https://googleads.googleapis.com/v14"
        self.customer_id = platform.account_id
        
    def authenticate(self) -> bool:
        """Autentica con Google Ads API"""
        try:
            # Implementar OAuth2 flow
            headers = {
                'Authorization': f'Bearer {self.platform.access_token}',
                'developer-token': settings.GOOGLE_ADS_DEVELOPER_TOKEN,
                'login-customer-id': self.customer_id,
            }
            
            # Test authentication
            response = requests.get(
                f"{self.base_url}/customers/{self.customer_id}",
                headers=headers
            )
            
            return response.status_code == 200
        except Exception as e:
            print(f"Google Ads authentication error: {e}")
            return False

    def get_campaigns(self) -> List[Dict]:
        """Obtiene las campañas de Google Ads"""
        try:
            headers = {
                'Authorization': f'Bearer {self.platform.access_token}',
                'developer-token': settings.GOOGLE_ADS_DEVELOPER_TOKEN,
                'login-customer-id': self.customer_id,
            }
            
            query = """
            SELECT 
                campaign.id,
                campaign.name,
                campaign.status,
                campaign.start_date,
                campaign.end_date,
                campaign_budget.amount_micros,
                campaign.advertising_channel_type
            FROM campaign
            WHERE campaign.status != 'REMOVED'
            """
            
            response = requests.post(
                f"{self.base_url}/customers/{self.customer_id}/googleAds:searchStream",
                headers=headers,
                json={'query': query}
            )
            
            if response.status_code == 200:
                return self._process_campaigns_response(response.json())
            
            return []
        except Exception as e:
            print(f"Error getting Google Ads campaigns: {e}")
            return []

    def get_campaign_metrics(self, campaign_id: str, start_date: date, end_date: date) -> Dict:
        """Obtiene métricas de una campaña específica"""
        try:
            headers = {
                'Authorization': f'Bearer {self.platform.access_token}',
                'developer-token': settings.GOOGLE_ADS_DEVELOPER_TOKEN,
                'login-customer-id': self.customer_id,
            }
            
            query = f"""
            SELECT 
                segments.date,
                metrics.impressions,
                metrics.clicks,
                metrics.cost_micros,
                metrics.conversions,
                metrics.conversions_value,
                metrics.ctr,
                metrics.average_cpc,
                metrics.cost_per_conversion
            FROM campaign
            WHERE 
                campaign.id = {campaign_id}
                AND segments.date >= '{start_date}'
                AND segments.date <= '{end_date}'
            """
            
            response = requests.post(
                f"{self.base_url}/customers/{self.customer_id}/googleAds:searchStream",
                headers=headers,
                json={'query': query}
            )
            
            if response.status_code == 200:
                return self._process_metrics_response(response.json())
            
            return {}
        except Exception as e:
            print(f"Error getting Google Ads metrics: {e}")
            return {}

    def get_audience_insights(self, start_date: date, end_date: date) -> Dict:
        """Obtiene insights de audiencia"""
        try:
            headers = {
                'Authorization': f'Bearer {self.platform.access_token}',
                'developer-token': settings.GOOGLE_ADS_DEVELOPER_TOKEN,
                'login-customer-id': self.customer_id,
            }
            
            # Age and gender demographics
            demographics_query = f"""
            SELECT 
                ad_group_criterion.age_range.type,
                ad_group_criterion.gender.type,
                metrics.impressions,
                metrics.clicks,
                segments.date
            FROM age_range_view
            WHERE 
                segments.date >= '{start_date}'
                AND segments.date <= '{end_date}'
            """
            
            # Geographic insights
            geo_query = f"""
            SELECT 
                geographic_view.country_criterion_id,
                geographic_view.location_type,
                metrics.impressions,
                metrics.clicks,
                segments.date
            FROM geographic_view
            WHERE 
                segments.date >= '{start_date}'
                AND segments.date <= '{end_date}'
            """
            
            # Process both queries
            demo_response = requests.post(
                f"{self.base_url}/customers/{self.customer_id}/googleAds:searchStream",
                headers=headers,
                json={'query': demographics_query}
            )
            
            geo_response = requests.post(
                f"{self.base_url}/customers/{self.customer_id}/googleAds:searchStream",
                headers=headers,
                json={'query': geo_query}
            )
            
            return {
                'demographics': self._process_demographics_response(demo_response.json()) if demo_response.status_code == 200 else {},
                'geographic': self._process_geographic_response(geo_response.json()) if geo_response.status_code == 200 else {}
            }
        except Exception as e:
            print(f"Error getting Google Ads audience insights: {e}")
            return {}

    def _process_campaigns_response(self, data: Dict) -> List[Dict]:
        """Procesa la respuesta de campañas"""
        campaigns = []
        
        for result in data.get('results', []):
            campaign_data = result.get('campaign', {})
            budget_data = result.get('campaignBudget', {})
            
            campaigns.append({
                'campaign_id': str(campaign_data.get('id', '')),
                'name': campaign_data.get('name', ''),
                'status': campaign_data.get('status', '').lower(),
                'start_date': campaign_data.get('startDate'),
                'end_date': campaign_data.get('endDate'),
                'daily_budget': Decimal(str(budget_data.get('amountMicros', 0))) / Decimal('1000000'),
                'objective': campaign_data.get('advertisingChannelType', '')
            })
        
        return campaigns

    def _process_metrics_response(self, data: Dict) -> Dict:
        """Procesa la respuesta de métricas"""
        metrics_by_date = {}
        
        for result in data.get('results', []):
            segments = result.get('segments', {})
            metrics = result.get('metrics', {})
            
            date_str = segments.get('date')
            if date_str:
                metrics_by_date[date_str] = {
                    'impressions': int(metrics.get('impressions', 0)),
                    'clicks': int(metrics.get('clicks', 0)),
                    'spend': Decimal(str(metrics.get('costMicros', 0))) / Decimal('1000000'),
                    'conversions': int(float(metrics.get('conversions', 0))),
                    'revenue': Decimal(str(metrics.get('conversionsValue', 0))) / Decimal('1000000'),
                    'ctr': float(metrics.get('ctr', 0)),
                    'cpc': Decimal(str(metrics.get('averageCpc', 0))) / Decimal('1000000'),
                    'cost_per_conversion': Decimal(str(metrics.get('costPerConversion', 0))) / Decimal('1000000')
                }
        
        return metrics_by_date

    def _process_demographics_response(self, data: Dict) -> Dict:
        """Procesa datos demográficos"""
        demographics = {
            'age_groups': {},
            'gender_distribution': {}
        }
        
        total_impressions = 0
        age_impressions = {}
        gender_impressions = {}
        
        for result in data.get('results', []):
            criterion = result.get('adGroupCriterion', {})
            metrics = result.get('metrics', {})
            impressions = int(metrics.get('impressions', 0))
            
            total_impressions += impressions
            
            # Age ranges
            age_range = criterion.get('ageRange', {}).get('type')
            if age_range:
                age_impressions[age_range] = age_impressions.get(age_range, 0) + impressions
            
            # Gender
            gender = criterion.get('gender', {}).get('type')
            if gender:
                gender_impressions[gender] = gender_impressions.get(gender, 0) + impressions
        
        # Calculate percentages
        if total_impressions > 0:
            for age, imps in age_impressions.items():
                demographics['age_groups'][age] = round((imps / total_impressions) * 100, 2)
            
            for gender, imps in gender_impressions.items():
                demographics['gender_distribution'][gender] = round((imps / total_impressions) * 100, 2)
        
        return demographics

    def _process_geographic_response(self, data: Dict) -> List[Dict]:
        """Procesa datos geográficos"""
        locations = []
        location_data = {}
        total_impressions = 0
        
        for result in data.get('results', []):
            geographic = result.get('geographicView', {})
            metrics = result.get('metrics', {})
            impressions = int(metrics.get('impressions', 0))
            
            country_id = geographic.get('countryCriterionId')
            if country_id:
                location_data[country_id] = location_data.get(country_id, 0) + impressions
                total_impressions += impressions
        
        # Convert to percentage and create list
        for country_id, impressions in location_data.items():
            percentage = round((impressions / total_impressions) * 100, 2) if total_impressions > 0 else 0
            locations.append({
                'country_id': country_id,
                'percentage': percentage,
                'impressions': impressions
            })
        
        return sorted(locations, key=lambda x: x['percentage'], reverse=True)


class InstagramService:
    """Servicio para integrar con Instagram Business API"""
    
    def __init__(self, platform: MarketingPlatform):
        self.platform = platform
        self.base_url = "https://graph.facebook.com/v18.0"
        self.access_token = platform.access_token
        
    def authenticate(self) -> bool:
        """Autentica con Instagram Business API"""
        try:
            response = requests.get(
                f"{self.base_url}/me",
                params={'access_token': self.access_token}
            )
            
            return response.status_code == 200
        except Exception as e:
            print(f"Instagram authentication error: {e}")
            return False

    def get_account_insights(self, start_date: date, end_date: date) -> Dict:
        """Obtiene insights generales de la cuenta"""
        try:
            metrics = [
                'impressions',
                'reach',
                'profile_views',
                'website_clicks',
                'follower_count',
                'email_contacts',
                'phone_call_clicks',
                'text_message_clicks'
            ]
            
            params = {
                'metric': ','.join(metrics),
                'period': 'day',
                'since': start_date.strftime('%Y-%m-%d'),
                'until': end_date.strftime('%Y-%m-%d'),
                'access_token': self.access_token
            }
            
            response = requests.get(
                f"{self.base_url}/{self.platform.account_id}/insights",
                params=params
            )
            
            if response.status_code == 200:
                return self._process_account_insights(response.json())
            
            return {}
        except Exception as e:
            print(f"Error getting Instagram insights: {e}")
            return {}

    def get_media_insights(self, start_date: date, end_date: date) -> List[Dict]:
        """Obtiene insights de publicaciones"""
        try:
            # First, get media IDs
            media_params = {
                'fields': 'id,media_type,timestamp,permalink,caption',
                'since': int(start_date.timestamp()),
                'until': int(end_date.timestamp()),
                'access_token': self.access_token
            }
            
            media_response = requests.get(
                f"{self.base_url}/{self.platform.account_id}/media",
                params=media_params
            )
            
            if media_response.status_code != 200:
                return []
            
            media_data = media_response.json().get('data', [])
            media_insights = []
            
            for media in media_data:
                media_id = media.get('id')
                if not media_id:
                    continue
                
                # Get insights for each media
                insight_metrics = [
                    'impressions',
                    'reach',
                    'likes',
                    'comments',
                    'shares',
                    'saves',
                    'profile_visits',
                    'website_clicks'
                ]
                
                insight_params = {
                    'metric': ','.join(insight_metrics),
                    'access_token': self.access_token
                }
                
                insight_response = requests.get(
                    f"{self.base_url}/{media_id}/insights",
                    params=insight_params
                )
                
                if insight_response.status_code == 200:
                    insights = self._process_media_insights(insight_response.json())
                    insights.update({
                        'media_id': media_id,
                        'media_type': media.get('media_type'),
                        'timestamp': media.get('timestamp'),
                        'permalink': media.get('permalink'),
                        'caption': media.get('caption', '')[:200]  # Truncate long captions
                    })
                    media_insights.append(insights)
            
            return media_insights
        except Exception as e:
            print(f"Error getting Instagram media insights: {e}")
            return []

    def get_audience_insights(self) -> Dict:
        """Obtiene insights de audiencia"""
        try:
            metrics = [
                'audience_gender_age',
                'audience_locale',
                'audience_country',
                'audience_city'
            ]
            
            params = {
                'metric': ','.join(metrics),
                'period': 'lifetime',
                'access_token': self.access_token
            }
            
            response = requests.get(
                f"{self.base_url}/{self.platform.account_id}/insights",
                params=params
            )
            
            if response.status_code == 200:
                return self._process_audience_insights(response.json())
            
            return {}
        except Exception as e:
            print(f"Error getting Instagram audience insights: {e}")
            return {}

    def get_hashtag_performance(self, hashtags: List[str]) -> Dict:
        """Analiza el rendimiento de hashtags"""
        try:
            hashtag_data = {}
            
            for hashtag in hashtags:
                # Search for hashtag
                search_params = {
                    'user_id': self.platform.account_id,
                    'q': hashtag,
                    'access_token': self.access_token
                }
                
                response = requests.get(
                    f"{self.base_url}/ig_hashtag_search",
                    params=search_params
                )
                
                if response.status_code == 200:
                    hashtag_info = response.json().get('data', [])
                    if hashtag_info:
                        hashtag_id = hashtag_info[0].get('id')
                        
                        # Get hashtag insights
                        insights_response = requests.get(
                            f"{self.base_url}/{hashtag_id}",
                            params={
                                'fields': 'name,media_count',
                                'access_token': self.access_token
                            }
                        )
                        
                        if insights_response.status_code == 200:
                            hashtag_data[hashtag] = insights_response.json()
            
            return hashtag_data
        except Exception as e:
            print(f"Error getting hashtag performance: {e}")
            return {}

    def _process_account_insights(self, data: Dict) -> Dict:
        """Procesa insights de cuenta"""
        processed = {}
        
        for insight in data.get('data', []):
            metric_name = insight.get('name')
            values = insight.get('values', [])
            
            if values:
                # Take the most recent value
                processed[metric_name] = values[-1].get('value', 0)
        
        return processed

    def _process_media_insights(self, data: Dict) -> Dict:
        """Procesa insights de medios"""
        processed = {}
        
        for insight in data.get('data', []):
            metric_name = insight.get('name')
            values = insight.get('values', [])
            
            if values:
                processed[metric_name] = values[0].get('value', 0)
        
        return processed

    def _process_audience_insights(self, data: Dict) -> Dict:
        """Procesa insights de audiencia"""
        processed = {
            'age_groups': {},
            'gender_distribution': {},
            'top_locations': [],
            'top_cities': []
        }
        
        for insight in data.get('data', []):
            metric_name = insight.get('name')
            values = insight.get('values', [])
            
            if not values:
                continue
            
            value_data = values[0].get('value', {})
            
            if metric_name == 'audience_gender_age':
                # Process gender and age data
                for key, count in value_data.items():
                    if '.' in key:
                        gender, age_range = key.split('.')
                        if gender not in processed['gender_distribution']:
                            processed['gender_distribution'][gender] = 0
                        processed['gender_distribution'][gender] += count
                        
                        if age_range not in processed['age_groups']:
                            processed['age_groups'][age_range] = 0
                        processed['age_groups'][age_range] += count
            
            elif metric_name == 'audience_country':
                # Process country data
                country_list = []
                total_audience = sum(value_data.values())
                
                for country, count in value_data.items():
                    percentage = (count / total_audience) * 100 if total_audience > 0 else 0
                    country_list.append({
                        'country': country,
                        'count': count,
                        'percentage': round(percentage, 2)
                    })
                
                processed['top_locations'] = sorted(country_list, key=lambda x: x['count'], reverse=True)
            
            elif metric_name == 'audience_city':
                # Process city data
                city_list = []
                total_audience = sum(value_data.values())
                
                for city, count in value_data.items():
                    percentage = (count / total_audience) * 100 if total_audience > 0 else 0
                    city_list.append({
                        'city': city,
                        'count': count,
                        'percentage': round(percentage, 2)
                    })
                
                processed['top_cities'] = sorted(city_list, key=lambda x: x['count'], reverse=True)
        
        return processed


class MarketingDataSyncService:
    """Servicio para sincronizar datos de marketing"""
    
    @staticmethod
    def sync_platform_data(platform: MarketingPlatform, days_back: int = 7) -> bool:
        """Sincroniza datos de una plataforma específica"""
        try:
            end_date = date.today()
            start_date = end_date - timedelta(days=days_back)
            
            if platform.platform_type == 'google_ads':
                service = GoogleAdsService(platform)
                if not service.authenticate():
                    return False
                
                # Sync campaigns
                campaigns_data = service.get_campaigns()
                MarketingDataSyncService._update_campaigns(platform, campaigns_data)
                
                # Sync metrics for each campaign
                for campaign in MarketingCampaign.objects.filter(platform=platform):
                    metrics_data = service.get_campaign_metrics(
                        campaign.campaign_id, start_date, end_date
                    )
                    MarketingDataSyncService._update_metrics(campaign, metrics_data)
                
                # Sync audience insights
                audience_data = service.get_audience_insights(start_date, end_date)
                MarketingDataSyncService._update_audience_insights(platform, audience_data, end_date)
            
            elif platform.platform_type == 'instagram':
                service = InstagramService(platform)
                if not service.authenticate():
                    return False
                
                # Sync account insights
                account_data = service.get_account_insights(start_date, end_date)
                MarketingDataSyncService._update_instagram_data(platform, account_data, start_date, end_date)
                
                # Sync audience insights
                audience_data = service.get_audience_insights()
                MarketingDataSyncService._update_audience_insights(platform, audience_data, end_date)
            
            # Update last sync time
            platform.last_sync = timezone.now()
            platform.save()
            
            return True
            
        except Exception as e:
            print(f"Error syncing platform data: {e}")
            return False

    @staticmethod
    def _update_campaigns(platform: MarketingPlatform, campaigns_data: List[Dict]):
        """Actualiza campañas en la base de datos"""
        for campaign_data in campaigns_data:
            MarketingCampaign.objects.update_or_create(
                platform=platform,
                campaign_id=campaign_data['campaign_id'],
                defaults={
                    'name': campaign_data['name'],
                    'status': campaign_data['status'],
                    'start_date': campaign_data.get('start_date'),
                    'end_date': campaign_data.get('end_date'),
                    'daily_budget': campaign_data.get('daily_budget', 0),
                    'objective': campaign_data.get('objective', '')
                }
            )

    @staticmethod
    def _update_metrics(campaign: MarketingCampaign, metrics_data: Dict):
        """Actualiza métricas en la base de datos"""
        for date_str, metrics in metrics_data.items():
            metric_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            
            MarketingMetrics.objects.update_or_create(
                campaign=campaign,
                date=metric_date,
                defaults={
                    'impressions': metrics.get('impressions', 0),
                    'clicks': metrics.get('clicks', 0),
                    'spend': metrics.get('spend', 0),
                    'conversions': metrics.get('conversions', 0),
                    'revenue': metrics.get('revenue', 0),
                    'cost_per_click': metrics.get('cpc', 0),
                    'cost_per_conversion': metrics.get('cost_per_conversion', 0)
                }
            )

    @staticmethod
    def _update_instagram_data(platform: MarketingPlatform, account_data: Dict, start_date: date, end_date: date):
        """Actualiza datos de Instagram"""
        # Create a virtual campaign for Instagram account
        campaign, created = MarketingCampaign.objects.get_or_create(
            platform=platform,
            campaign_id='instagram_account',
            defaults={
                'name': f'{platform.name} - Cuenta Principal',
                'status': 'active',
                'start_date': start_date,
                'objective': 'engagement'
            }
        )
        
        # Update metrics
        MarketingMetrics.objects.update_or_create(
            campaign=campaign,
            date=end_date,
            defaults={
                'impressions': account_data.get('impressions', 0),
                'reach': account_data.get('reach', 0),
                'likes': account_data.get('likes', 0),
                'comments': account_data.get('comments', 0),
                'shares': account_data.get('shares', 0),
                'saves': account_data.get('saves', 0),
                'additional_metrics': {
                    'profile_views': account_data.get('profile_views', 0),
                    'website_clicks': account_data.get('website_clicks', 0),
                    'follower_count': account_data.get('follower_count', 0)
                }
            }
        )

    @staticmethod
    def _update_audience_insights(platform: MarketingPlatform, audience_data: Dict, date_val: date):
        """Actualiza insights de audiencia"""
        from .models import MarketingAudienceInsight
        
        MarketingAudienceInsight.objects.update_or_create(
            platform=platform,
            date=date_val,
            defaults={
                'age_groups': audience_data.get('age_groups', {}),
                'gender_distribution': audience_data.get('gender_distribution', {}),
                'top_locations': audience_data.get('top_locations', []),
                'interests': audience_data.get('interests', []),
                'device_types': audience_data.get('device_types', {}),
                'engagement_by_content_type': audience_data.get('engagement_by_content_type', {})
            }
        )


class MarketingInsightsGenerator:
    """Generador de insights automáticos de marketing"""
    
    @staticmethod
    def generate_performance_insights(campaign: MarketingCampaign) -> List[Dict]:
        """Genera insights de rendimiento para una campaña"""
        insights = []
        
        # Get recent metrics (last 7 days)
        recent_metrics = MarketingMetrics.objects.filter(
            campaign=campaign,
            date__gte=date.today() - timedelta(days=7)
        ).order_by('-date')
        
        if recent_metrics.count() < 2:
            return insights
        
        current_metrics = recent_metrics[0]
        previous_metrics = recent_metrics[1] if recent_metrics.count() > 1 else current_metrics
        
        # CTR Analysis
        current_ctr = current_metrics.click_through_rate
        previous_ctr = previous_metrics.click_through_rate
        
        if current_ctr < 1.0 and previous_ctr > 0:
            ctr_change = ((current_ctr - previous_ctr) / previous_ctr) * 100
            if ctr_change < -20:
                insights.append({
                    'type': 'performance',
                    'priority': 'high',
                    'title': 'CTR Bajo Detectado',
                    'description': f'El CTR ha bajado {abs(ctr_change):.1f}% a {current_ctr:.2f}%',
                    'recommended_actions': [
                        'Revisar y actualizar creativos',
                        'Optimizar targeting de audiencia',
                        'Probar nuevos textos publicitarios'
                    ],
                    'confidence_score': 85
                })
        
        # Conversion Rate Analysis
        current_conv_rate = current_metrics.conversion_rate
        if current_conv_rate < 2.0:
            insights.append({
                'type': 'optimization',
                'priority': 'medium',
                'title': 'Oportunidad de Mejora en Conversiones',
                'description': f'La tasa de conversión actual es {current_conv_rate:.2f}%',
                'recommended_actions': [
                    'Optimizar landing page',
                    'Revisar proceso de checkout',
                    'Segmentar mejor la audiencia'
                ],
                'confidence_score': 75
            })
        
        # Budget Performance
        daily_spend = current_metrics.spend
        daily_budget = campaign.daily_budget
        
        if daily_spend > 0 and daily_budget > 0:
            spend_ratio = (daily_spend / daily_budget) * 100
            
            if spend_ratio < 50:
                insights.append({
                    'type': 'budget',
                    'priority': 'medium',
                    'title': 'Presupuesto Subutilizado',
                    'description': f'Solo se está gastando {spend_ratio:.1f}% del presupuesto diario',
                    'recommended_actions': [
                        'Aumentar pujas',
                        'Expandir targeting',
                        'Aumentar presupuesto de campañas exitosas'
                    ],
                    'confidence_score': 80
                })
        
        return insights

    @staticmethod
    def generate_audience_insights(platform: MarketingPlatform) -> List[Dict]:
        """Genera insights de audiencia"""
        insights = []
        
        from .models import MarketingAudienceInsight
        
        recent_audience = MarketingAudienceInsight.objects.filter(
            platform=platform
        ).order_by('-date').first()
        
        if not recent_audience:
            return insights
        
        # Age distribution analysis
        age_groups = recent_audience.age_groups
        if age_groups:
            dominant_age = max(age_groups.items(), key=lambda x: x[1])
            
            if dominant_age[1] > 60:  # More than 60% in one age group
                insights.append({
                    'type': 'audience',
                    'priority': 'low',
                    'title': 'Audiencia Concentrada en Edad',
                    'description': f'{dominant_age[1]:.1f}% de la audiencia está en el rango {dominant_age[0]}',
                    'recommended_actions': [
                        'Considerar expandir a otros grupos de edad',
                        'Crear contenido específico para otros segmentos',
                        'Analizar oportunidades en mercados no explotados'
                    ],
                    'confidence_score': 70
                })
        
        # Geographic concentration
        top_locations = recent_audience.top_locations
        if top_locations and len(top_locations) > 0:
            top_location = top_locations[0]
            
            if top_location.get('percentage', 0) > 70:
                insights.append({
                    'type': 'audience',
                    'priority': 'medium',
                    'title': 'Concentración Geográfica Alta',
                    'description': f'{top_location["percentage"]:.1f}% de la audiencia está en {top_location.get("city", top_location.get("country", "una ubicación"))}',
                    'recommended_actions': [
                        'Explorar expansión a nuevas ciudades/países',
                        'Crear campañas localizadas',
                        'Analizar competencia en otras ubicaciones'
                    ],
                    'confidence_score': 75
                })
        
        return insights

    @staticmethod
    def generate_budget_optimization_insights(campaign: MarketingCampaign) -> List[Dict]:
        """Genera recomendaciones de optimización de presupuesto"""
        insights = []
        
        # Get performance data for last 30 days
        metrics_30d = MarketingMetrics.objects.filter(
            campaign=campaign,
            date__gte=date.today() - timedelta(days=30)
        )
        
        if not metrics_30d.exists():
            return insights
        
        # Calculate averages
        avg_roas = sum(m.return_on_ad_spend for m in metrics_30d) / len(metrics_30d)
        avg_cpa = sum(m.cost_per_conversion for m in metrics_30d if m.cost_per_conversion > 0) / max(1, len([m for m in metrics_30d if m.cost_per_conversion > 0]))
        
        # ROAS-based recommendations
        if avg_roas > 300:  # Great ROAS, recommend budget increase
            insights.append({
                'type': 'budget',
                'priority': 'high',
                'title': 'Oportunidad de Escalado',
                'description': f'ROAS promedio de {avg_roas:.1f}% indica excelente rendimiento',
                'recommended_actions': [
                    f'Incrementar presupuesto diario en 20-30%',
                    'Expandir targeting a audiencias similares',
                    'Duplicar campaña con mayor presupuesto'
                ],
                'confidence_score': 90
            })
        elif avg_roas < 100:  # Poor ROAS
            insights.append({
                'type': 'budget',
                'priority': 'critical',
                'title': 'ROAS Bajo - Acción Requerida',
                'description': f'ROAS de {avg_roas:.1f}% indica pérdidas',
                'recommended_actions': [
                    'Reducir presupuesto inmediatamente',
                    'Pausar campaña para optimización',
                    'Revisar targeting y creativos'
                ],
                'confidence_score': 95
            })
        
        return insights