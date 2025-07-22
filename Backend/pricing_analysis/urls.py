from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'service-categories', views.ServiceCategoryViewSet)
router.register(r'resource-types', views.ResourceTypeViewSet)
router.register(r'resources', views.ResourceViewSet)
router.register(r'unit-price-analysis', views.UnitPriceAnalysisViewSet)
router.register(r'unit-price-items', views.UnitPriceItemViewSet)
router.register(r'project-estimates', views.ProjectEstimateViewSet)
router.register(r'project-estimate-items', views.ProjectEstimateItemViewSet)

app_name = 'pricing_analysis'

urlpatterns = [
    path('', include(router.urls)),
]
