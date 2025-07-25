import os
import sys
import django
import requests

# Add the current directory to the Python path
sys.path.append('.')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'geb_backend.settings')
django.setup()

def test_resource_types():
    """Probar que los tipos de recursos existan"""
    from pricing_analysis.models import ResourceType
    
    print("=== PRUEBA DE TIPOS DE RECURSOS ===")
    types = ResourceType.objects.all()
    print(f"Total de tipos: {types.count()}")
    
    for resource_type in types:
        print(f"- {resource_type.name}: {resource_type.description} ({resource_type.overhead_percentage}% overhead)")
    
    return types.count() > 0

def test_reports_api():
    """Probar que los endpoints de reportes funcionen"""
    print("\n=== PRUEBA DE API DE REPORTES ===")
    
    base_url = "http://127.0.0.1:8000/api/reports"
    
    # Probar endpoint de tipos de reportes
    try:
        response = requests.get(f"{base_url}/types/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Tipos de reportes: {len(data)} tipos disponibles")
            for report_type in data:
                print(f"  - {report_type['icon']} {report_type['name']}")
        else:
            print(f"❌ Error al obtener tipos de reportes: {response.status_code}")
    except Exception as e:
        print(f"❌ Error de conexión: {e}")

def test_sample_data():
    """Verificar que existan datos de muestra"""
    from sales.models import Sale
    from products.models import Product
    from customers.models import Customer
    from finances.models import Transaction
    
    print("\n=== VERIFICACIÓN DE DATOS ===")
    print(f"Ventas: {Sale.objects.count()}")
    print(f"Productos: {Product.objects.count()}")
    print(f"Clientes: {Customer.objects.count()}")
    print(f"Transacciones: {Transaction.objects.count()}")

if __name__ == "__main__":
    print("🚀 INICIANDO PRUEBAS COMPLETAS\n")
    
    # Probar tipos de recursos
    if test_resource_types():
        print("✅ Tipos de recursos: OK")
    else:
        print("❌ Tipos de recursos: FALLO")
    
    # Probar datos de muestra
    test_sample_data()
    
    # Probar API de reportes
    test_reports_api()
    
    print("\n✅ PRUEBAS COMPLETADAS")
