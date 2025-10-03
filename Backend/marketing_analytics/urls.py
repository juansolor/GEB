from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MarketingPlatformViewSet, MarketingCampaignViewSet, MarketingMetricsViewSet,
    MarketingInsightViewSet, MarketingDashboardViewSet
)

# Create router
router = DefaultRouter()
router.register(r'platforms', MarketingPlatformViewSet)
router.register(r'campaigns', MarketingCampaignViewSet)
router.register(r'metrics', MarketingMetricsViewSet)
router.register(r'insights', MarketingInsightViewSet)
router.register(r'dashboard', MarketingDashboardViewSet, basename='marketing-dashboard')

urlpatterns = [
    path('', include(router.urls)),
]