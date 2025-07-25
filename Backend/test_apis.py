import os
import sys
import django

# Add the current directory to the Python path
sys.path.append('.')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'geb_backend.settings')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from pricing_analysis.models import ResourceType, Resource

def test_reports_without_auth():
    """Probar la vista de reportes usando Django test client"""
    print("=== PRUEBA DIRECTA DE VISTAS ===")
    
    from django.test import Client
    
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

def test_resource_api():
    """Probar la API de recursos"""
    print("\n=== PRUEBA DE API DE RECURSOS ===")
    
    User = get_user_model()
    
    # Crear usuario de prueba si no existe
    user, created = User.objects.get_or_create(
        username='test_user',
        defaults={'email': 'test@example.com', 'is_active': True}
    )
    if created:
        user.set_password('password123')
        user.save()
        print("✅ Usuario de prueba creado")
    
    # Usar APIClient para simular requests
    from rest_framework.test import APIClient
    client = APIClient()
    client.force_authenticate(user=user)
    
    # Primero verificar qué URLs existen
    from django.urls import reverse, NoReverseMatch
    
    # Lista de endpoints a probar
    endpoints = [
        ('pricing_analysis:resourcetype-list', 'resource-types'),
        ('pricing_analysis:resource-list', 'resources'),
        ('reports:types', 'report-types'),
    ]
    
    for endpoint_name, description in endpoints:
        try:
            url = reverse(endpoint_name)
            response = client.get(url)
            print(f"{description} API: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict) and 'results' in data:
                    print(f"  - Encontrados: {len(data['results'])}")
                elif isinstance(data, list):
                    print(f"  - Encontrados: {len(data)}")
                else:
                    print(f"  - Respuesta exitosa")
            else:
                print(f"  Error: {response.status_code}")
        except NoReverseMatch:
            print(f"❌ URL {endpoint_name} no encontrada")
        except Exception as e:
            print(f"❌ Error en {description}: {e}")
    
    # Probar URLs directas como fallback
    direct_urls = [
        ('/api/reports/types/', 'Report Types Direct'),
    ]
    
    for url, description in direct_urls:
        try:
            response = client.get(url)
            print(f"{description}: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    print(f"  - Encontrados: {len(data)}")
                else:
                    print(f"  - Respuesta exitosa")
        except Exception as e:
            print(f"❌ Error en {description}: {e}")

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

if __name__ == "__main__":
    check_installed_apps()
    test_reports_without_auth()
    test_resource_api()
