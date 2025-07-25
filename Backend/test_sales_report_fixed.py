import os
import sys
import django
from datetime import datetime
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'geb_backend.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()

def test_sales_report():
    """Test the sales report endpoint directly"""
    print("=== TEST SALES REPORT ENDPOINT (FIXED) ===")
    
    try:
        # Create a test user and token
        user, created = User.objects.get_or_create(
            username='testuser',
            defaults={'email': 'test@example.com'}
        )
        token, created = Token.objects.get_or_create(user=user)
        
        # Create client and set authentication
        client = Client()
        
        # Test with proper timezone handling
        print("--- Test 1: Con fechas timezone-aware ---")
        response = client.get(
            '/api/reports/sales/',
            {
                'start_date': '2025-07-24',
                'end_date': '2025-07-25',
                'format': 'json'
            },
            HTTP_AUTHORIZATION=f'Token {token.key}',
            SERVER_NAME='localhost'  # Usar localhost en lugar de testserver
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✓ SUCCESS: Endpoint funciona correctamente")
            data = response.json()
            print(f"Data keys: {list(data.keys())}")
            if 'summary' in data:
                print(f"Summary: {data['summary']}")
        else:
            print(f"✗ ERROR: Status {response.status_code}")
            print(f"Content: {response.content.decode()}")
            
    except Exception as e:
        print(f"✗ EXCEPTION: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_sales_report()
