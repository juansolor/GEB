import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'geb_backend.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
import json

def test_sales_report_endpoint():
    """Probar el endpoint de reportes de ventas directamente"""
    print("=== TEST ENDPOINT SALES REPORT ===")
    
    User = get_user_model()
    
    # Crear usuario de prueba
    user, created = User.objects.get_or_create(
        username='test_user',
        defaults={'email': 'test@example.com', 'is_active': True}
    )
    if created:
        user.set_password('password123')
        user.save()
    
    client = Client()
    client.force_login(user)
    
    # Test 1: Sin parámetros de fecha
    print("\n--- Test 1: Sin fechas ---")
    try:
        response = client.get('/api/reports/sales/?format=json')
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Datos recibidos: {list(data.keys())}")
            print(f"Total ventas: {data.get('summary', {}).get('total_sales', 'N/A')}")
        else:
            print(f"Error: {response.content.decode()}")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    # Test 2: Con fechas vacías (como viene del frontend)
    print("\n--- Test 2: Con fechas vacías ---")
    try:
        response = client.get('/api/reports/sales/?start_date=&end_date=&format=json')
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Datos recibidos: {list(data.keys())}")
            print(f"Total ventas: {data.get('summary', {}).get('total_sales', 'N/A')}")
        else:
            print(f"Error: {response.content.decode()}")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    # Test 3: Con fechas válidas
    print("\n--- Test 3: Con fechas válidas ---")
    try:
        response = client.get('/api/reports/sales/?start_date=2025-07-24&end_date=2025-07-25&format=json')
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Datos recibidos: {list(data.keys())}")
            print(f"Total ventas: {data.get('summary', {}).get('total_sales', 'N/A')}")
        else:
            print(f"Error: {response.content.decode()}")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_sales_report_endpoint()
