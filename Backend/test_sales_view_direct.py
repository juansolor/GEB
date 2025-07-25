import os
import sys
import django
from django.http import HttpRequest
from django.test import RequestFactory

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'geb_backend.settings')
django.setup()

from reports.views import generate_sales_report

def test_sales_report_view():
    """Test the sales report view directly"""
    print("=== TEST SALES REPORT VIEW ===")
    
    try:
        factory = RequestFactory()
        request = factory.get(
            '/api/reports/sales/',
            {
                'start_date': '2025-07-24',
                'end_date': '2025-07-25',
                'format': 'json'
            }
        )
        print(f"Request method: {request.method}")
        print(f"Request GET params: {request.GET}")

        response = generate_sales_report(request)

        # Robust type check
        if hasattr(response, 'status_code'):
            print(f"Response status: {response.status_code}")
            # Mostrar datos según tipo de respuesta

            data = getattr(response, 'data', None)
            if data is not None:
                print(f"Response data: {data}")
                if not data:
                    print("⚠️ ADVERTENCIA: La respuesta no contiene datos.")
            elif hasattr(response, 'content'):
                try:
                    content = response.content.decode('utf-8')
                    print(f"Response content: {content}")
                    if not content:
                        print("⚠️ ADVERTENCIA: La respuesta no contiene datos.")
                except Exception:
                    print(f"Response content (raw): {response.content}")
            else:
                print("⚠️ ADVERTENCIA: La respuesta no tiene atributo 'data' ni 'content'.")

            if response.status_code == 200:
                print("✓ SUCCESS: Sales report view works correctly")
            else:
                print(f"✗ ERROR: Status {response.status_code}")
        else:
            print(f"✗ ERROR: La vista no retornó un objeto Response. Tipo: {type(response)}")
            print(f"Contenido: {response}")

    except Exception as e:
        print(f"✗ EXCEPTION: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_sales_report_view()
