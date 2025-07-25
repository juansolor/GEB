from django.urls import path
from . import views

urlpatterns = [
    path('sales/', views.generate_sales_report, name='sales_report'),
    path('inventory/', views.generate_inventory_report, name='inventory_report'),
    path('financial/', views.generate_financial_report, name='financial_report'),
    path('types/', views.get_report_types, name='report_types'),
]
