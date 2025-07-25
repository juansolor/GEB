import os
import sys
import django

# Add the current directory to the Python path
sys.path.append('.')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'geb_backend.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model

def test_reports_directly():
    """Probar las vistas de reportes directamente usando Django test client"""
    print("=== PRUEBA DIRECTA DE VISTAS DE REPORTES ===")
    
    User = get_user_model()
    
    # Crear cliente de test
    client = Client()
    
    # Crear usuario admin si no existe
    admin_user, created = User.objects.get_or_create(
        username='admin', 
        defaults={'email': 'admin@test.com', 'is_staff': True, 'is_superuser': True}
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
    
    # Login del usuario
    client.force_login(admin_user)
    
    # Crear usuario de prueba si no existe
    user, created = User.objects.get_or_create(
        username='test_user',
        defaults={'email': 'test@example.com', 'is_active': True}
    )
    if created:
        user.set_password('password123')
        user.save()
    
    client = Client()
    
    # Probar get_report_types (sin autenticación por ahora)
    try:
        response = client.get('/api/reports/types/')
        print(f"✅ get_report_types: {response.status_code}")
        if response.status_code == 200:
            import json
            data = json.loads(response.content)
            print(f"Tipos de reportes: {len(data)}")
            for report_type in data:
                print(f"  - {report_type['icon']} {report_type['name']}")
        else:
            print(f"Error: {response.content}")
    except Exception as e:
        print(f"❌ Error en get_report_types: {e}")
        import traceback
        traceback.print_exc()
    
    # Probar generate_sales_report
    try:
        response = client.get('/api/reports/sales/')
        print(f"✅ generate_sales_report: {response.status_code}")
        if response.status_code == 200:
            import json
            data = json.loads(response.content)
            if 'summary' in data:
                print(f"Ventas totales: ${data['summary']['total_amount']}")
                print(f"Número de ventas: {data['summary']['total_sales']}")
        else:
            print(f"Error: {response.content}")
    except Exception as e:
        print(f"❌ Error en generate_sales_report: {e}")
        import traceback
        traceback.print_exc()
    
    # Probar generate_inventory_report
    try:
        response = client.get('/api/reports/inventory/')
        print(f"✅ generate_inventory_report: {response.status_code}")
        if response.status_code == 200:
            import json
            data = json.loads(response.content)
            if 'summary' in data:
                print(f"Total productos: {data['summary']['total_products']}")
                print(f"Productos activos: {data['summary']['active_products']}")
                print(f"Valor de inventario: ${data['summary']['total_stock_value']}")
        else:
            print(f"Error: {response.content}")
    except Exception as e:
        print(f"❌ Error en generate_inventory_report: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_reports_directly()
