#!/usr/bin/env python
import os
import django
from django.contrib.auth import get_user_model

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'geb_backend.settings')
django.setup()

print("=== PRUEBA DE API DE CATEGORÍAS ===")

# 1. Verificar categorías en base de datos
from pricing_analysis.models import ServiceCategory
categories = ServiceCategory.objects.all()
print(f"Categorías en BD: {categories.count()}")
for cat in categories:
    print(f"  - {cat.id}: {cat.name} ({cat.code})")

# 2. Obtener un token de usuario para la prueba
User = get_user_model()
user = User.objects.first()
if user:
    from rest_framework.authtoken.models import Token
    token, created = Token.objects.get_or_create(user=user)
    print(f"\nToken de usuario: {token.key}")
else:
    print("No hay usuarios en la base de datos")

print("\n=== VERIFICACIÓN DE URLS ===")
try:
    from django.test import Client
    client = Client()
    
    # Probar sin autenticación
    response = client.get('/api/service-categories/')
    print(f"Sin auth: {response.status_code}")
    
    if user:
        # Probar con autenticación
        client.force_login(user)
        response = client.get('/api/service-categories/')
        print(f"Con auth: {response.status_code}")
        if response.status_code == 200:
            import json
            data = json.loads(response.content)
            print(f"Datos: {len(data)} categorías")
            for cat in data:
                print(f"  - {cat['id']}: {cat['name']} ({cat['code']})")
            
except Exception as e:
    print(f"Error en prueba de URLs: {e}")

print("\n=== VERIFICACIÓN DE SERIALIZER ===")
from pricing_analysis.serializers import ServiceCategorySerializer
serializer = ServiceCategorySerializer(categories, many=True)
print(f"Serializer data: {len(serializer.data)} items")
for item in serializer.data:
    print(f"  - {item}")

print("\n=== VERIFICACIÓN DE PERMISOS ===")
from pricing_analysis.views import ServiceCategoryViewSet
viewset = ServiceCategoryViewSet()
print(f"Permission classes: {viewset.permission_classes}")
print(f"Queryset count: {viewset.get_queryset().count()}")
