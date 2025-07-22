from django.urls import path
from . import views

app_name = 'testing_pages'

urlpatterns = [
    path('', views.index, name='index'),
    path('register/', views.test_register, name='test_register'),
    path('login/', views.test_login, name='test_login'),
    path('api/', views.test_api, name='test_api'),
    path('pricing/', views.test_pricing, name='test_pricing'),
]
