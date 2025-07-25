import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'geb_backend.settings')
django.setup()

from reports.views import get_report_types, generate_sales_report, generate_inventory_report, generate_financial_report
from django.http import HttpRequest
from django.contrib.auth import get_user_model
import json

def test_views_directly():
    """Testear las vistas directamente sin HTTP"""
    print("=== PRUEBA DIRECTA DE FUNCIONES DE REPORTES ===")
    
    User = get_user_model()
    
    # Crear usuario admin si no existe
    admin_user, created = User.objects.get_or_create(
        username='admin', 
        defaults={'email': 'admin@test.com', 'is_staff': True, 'is_superuser': True}
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
    
    # Crear una request mock
    request = HttpRequest()
    request.method = 'GET'
    request.user = admin_user
    request.META = {'HTTP_HOST': 'localhost'}
    
    # 1. Test get_report_types
    print("\n--- Test 1: get_report_types ---")
    try:
        response = get_report_types(request)
        print(f"Status: {response.status_code}")
        print(f"Response type: {type(response)}")
        if response.status_code == 200:
            # Para JsonResponse, el contenido está directamente disponible
            if hasattr(response, 'content'):
                data = json.loads(response.content.decode())
                print(f"Tipos encontrados: {len(data)}")
                for report_type in data:
                    print(f"  - {report_type['icon']} {report_type['name']}")
        else:
            if hasattr(response, 'content'):
                print(f"Error: {response.content.decode()}")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    # 2. Test generate_sales_report
    print("\n--- Test 2: generate_sales_report ---")
    try:
        response = generate_sales_report(request)
        print(f"Status: {response.status_code}")
        print(f"Response type: {type(response)}")
        if response.status_code == 200:
            if hasattr(response, 'content'):
                data = json.loads(response.content.decode())
                print(f"Sales data keys: {list(data.keys())}")
                if 'total' in data:
                    print(f"Total ventas: ${data['total']}")
                if 'count' in data:
                    print(f"Número de ventas: {data['count']}")
        else:
            if hasattr(response, 'content'):
                print(f"Error: {response.content.decode()}")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    # 3. Test generate_inventory_report
    print("\n--- Test 3: generate_inventory_report ---")
    try:
        response = generate_inventory_report(request)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = json.loads(response.content)
            print(f"Inventory data keys: {list(data.keys())}")
            if 'total_products' in data:
                print(f"Total productos: {data['total_products']}")
        else:
            print(f"Error: {response.content}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # 4. Test generate_financial_report
    print("\n--- Test 4: generate_financial_report ---")
    try:
        response = generate_financial_report(request)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = json.loads(response.content)
            print(f"Financial data keys: {list(data.keys())}")
            if 'total_income' in data:
                print(f"Total ingresos: ${data['total_income']}")
            if 'total_expenses' in data:
                print(f"Total gastos: ${data['total_expenses']}")
        else:
            print(f"Error: {response.content}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n=== PRUEBA TERMINADA ===")

if __name__ == '__main__':
    test_views_directly()
