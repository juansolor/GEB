import os
import sys
import django

# Add the current directory to the Python path
sys.path.append('.')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'geb_backend.settings')
django.setup()

from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
import json

def test_reports_with_clean_client():
    """Probar las vistas de reportes usando clean client"""
    print("=== PRUEBA LIMPIA DE VISTAS DE REPORTES ===")
    
    User = get_user_model()
    
    # Crear cliente de Django test (permite saltarse ALLOWED_HOSTS)
    client = Client()
    
    # Crear usuario admin
    admin_user, created = User.objects.get_or_create(
        username='admin', 
        defaults={'email': 'admin@test.com', 'is_staff': True, 'is_superuser': True}
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
    
    # 1. Test sin autenticación (reports temporalmente sin auth)
    print("\n--- Test 1: get_report_types ---")
    try:
        response = client.get('/api/reports/types/')
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Tipos encontrados: {len(data)}")
            for report_type in data:
                print(f"  - {report_type['icon']} {report_type['name']}")
        else:
            print(f"Error content: {response.content.decode()[:200]}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # 2. Test generate_sales_report
    print("\n--- Test 2: generate_sales_report ---")
    try:
        response = client.get('/api/reports/sales/')
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Sales data keys: {list(data.keys())}")
            if 'total' in data:
                print(f"Total ventas: ${data['total']}")
            if 'count' in data:
                print(f"Número de ventas: {data['count']}")
        else:
            print(f"Error content: {response.content.decode()[:200]}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # 3. Test generate_inventory_report
    print("\n--- Test 3: generate_inventory_report ---")
    try:
        response = client.get('/api/reports/inventory/')
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Inventory data keys: {list(data.keys())}")
            if 'total_products' in data:
                print(f"Total productos: {data['total_products']}")
        else:
            print(f"Error content: {response.content.decode()[:200]}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # 4. Test generate_financial_report
    print("\n--- Test 4: generate_financial_report ---")
    try:
        response = client.get('/api/reports/financial/')
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Financial data keys: {list(data.keys())}")
            if 'total_income' in data:
                print(f"Total ingresos: ${data['total_income']}")
            if 'total_expenses' in data:
                print(f"Total gastos: ${data['total_expenses']}")
        else:
            print(f"Error content: {response.content.decode()[:200]}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n=== PRUEBA TERMINADA ===")

if __name__ == '__main__':
    test_reports_with_clean_client()
