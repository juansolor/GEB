from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from users.views import UserViewSet
from products.views import ProductViewSet, CategoryViewSet
from customers.views import CustomerViewSet
from pricing_analysis.views import (
    ServiceCategoryViewSet, ResourceTypeViewSet, ResourceViewSet,
    UnitPriceAnalysisViewSet, UnitPriceItemViewSet, 
    ProjectEstimateViewSet, ProjectEstimateItemViewSet
)

# API Router
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'products', ProductViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'service-categories', ServiceCategoryViewSet)
router.register(r'resource-types', ResourceTypeViewSet)
router.register(r'resources', ResourceViewSet)
router.register(r'unit-price-analysis', UnitPriceAnalysisViewSet)
router.register(r'unit-price-items', UnitPriceItemViewSet)
router.register(r'project-estimates', ProjectEstimateViewSet)
router.register(r'project-estimate-items', ProjectEstimateItemViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/', include('rest_framework.urls')),
    path('test/', include('testing_pages.urls')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
