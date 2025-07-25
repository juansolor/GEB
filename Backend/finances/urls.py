from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet, ExpenseCategoryViewSet, BudgetViewSet

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet)
router.register(r'categories', ExpenseCategoryViewSet)
router.register(r'budgets', BudgetViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
