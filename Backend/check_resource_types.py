import os
import sys
import django

# Add the current directory to the Python path
sys.path.append('.')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'geb_backend.settings')
django.setup()

from pricing_analysis.models import ResourceType

categories = [
    {'name': 'material', 'description': 'Materiales de construcción', 'overhead_percentage': 10},
    {'name': 'labor', 'description': 'Mano de obra especializada', 'overhead_percentage': 25},
    {'name': 'equipment', 'description': 'Equipos y maquinaria', 'overhead_percentage': 15},
    {'name': 'subcontract', 'description': 'Subcontratos especializados', 'overhead_percentage': 5},
    {'name': 'transport', 'description': 'Transporte y logística', 'overhead_percentage': 8},
]

for category in categories:
    resource_type, created = ResourceType.objects.get_or_create(
        name=category['name'],
        defaults={
            'description': category['description'],
            'overhead_percentage': category['overhead_percentage']
        }
    )
    if created:
        print(f"Created ResourceType: {resource_type.name}")
    else:
        print(f"ResourceType already exists: {resource_type.name}")
