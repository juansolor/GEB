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
from pricing_analysis.models import ResourceType, Resource

def test_reports_without_auth():
    """Probar la vista de reportes usando Django test client"""
    print("=== PRUEBA DIRECTA DE VISTAS ===")
    
    client = Client()
    
    try:
        # Obtener tipos de reportes directamente
        response = client.get('/api/reports/types/')
        print(f"✅ Vista de tipos de reportes funciona: {response.status_code}")
        if response.status_code == 200:
            import json
            data = json.loads(response.content)
            print(f"Tipos disponibles: {len(data)}")
            for report_type in data:
                # Usar los campos correctos del modelo
                icon = report_type.get('icon', '📊')
                name = report_type.get('name', 'Sin nombre')
                print(f"  - {icon} {name}")
        else:
            print(f"Error: {response.content.decode()}")
    except Exception as e:
        print(f"❌ Error en vista de reportes: {e}")
        import traceback
        traceback.print_exc()

def test_data_availability():
    """Verificar que hay datos disponibles"""
    print("\n=== VERIFICACIÓN DE DATOS ===")
    
    # Verificar tipos de recursos
    resource_types_count = ResourceType.objects.count()
    print(f"Tipos de recursos: {resource_types_count}")
    
    # Verificar recursos
    resources_count = Resource.objects.count()
    print(f"Recursos: {resources_count}")
    
    # Verificar ventas
    try:
        from sales.models import Sale
        sales_count = Sale.objects.count()
        print(f"Ventas: {sales_count}")
    except ImportError:
        print("❌ Modelo Sale no disponible")
    
    # Verificar productos
    try:
        from products.models import Product
        products_count = Product.objects.count()
        print(f"Productos: {products_count}")
    except ImportError:
        print("❌ Modelo Product no disponible")

def check_installed_apps():
    """Verificar que la app reports esté instalada"""
    print("\n=== VERIFICACIÓN DE APPS INSTALADAS ===")
    from django.conf import settings
    
    print("Apps instaladas:")
    for app in settings.INSTALLED_APPS:
        if any(keyword in app.lower() for keyword in ['report', 'pricing', 'finance', 'sales']):
            print(f"  ✅ {app}")
    
    if 'reports' not in settings.INSTALLED_APPS:
        print("❌ La app 'reports' no está en INSTALLED_APPS")
    else:
        print("✅ La app 'reports' está instalada")

def check_urls():
    """Verificar que las URLs están configuradas"""
    print("\n=== VERIFICACIÓN DE URLS ===")
    
    from django.urls import reverse, NoReverseMatch
    
    # URLs a verificar
    url_patterns = [
        ('reports:types', 'Report Types'),
        ('reports:sales', 'Sales Report'),
        ('reports:inventory', 'Inventory Report'),
        ('reports:financial', 'Financial Report'),
    ]
    
    for pattern_name, description in url_patterns:
        try:
            url = reverse(pattern_name)
            print(f"✅ {description}: {url}")
        except NoReverseMatch:
            print(f"❌ {description}: URL no encontrada")

if __name__ == "__main__":
    check_installed_apps()
    check_urls()
    test_data_availability()
    test_reports_without_auth()
