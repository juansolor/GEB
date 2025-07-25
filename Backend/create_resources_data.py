import os
import sys
import django

# Add the current directory to the Python path
sys.path.append('.')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'geb_backend.settings')
django.setup()

from pricing_analysis.models import ResourceType, Resource
from django.contrib.auth import get_user_model

User = get_user_model()

# Create resource types
resource_types_data = [
    {'name': 'material', 'description': 'Materiales de construcción', 'overhead_percentage': 10},
    {'name': 'labor', 'description': 'Mano de obra especializada', 'overhead_percentage': 25},
    {'name': 'equipment', 'description': 'Equipos y maquinaria', 'overhead_percentage': 15},
    {'name': 'subcontract', 'description': 'Subcontratos especializados', 'overhead_percentage': 5},
    {'name': 'transport', 'description': 'Transporte y logística', 'overhead_percentage': 8},
]

print("Creando tipos de recursos...")
created_types = 0
for type_data in resource_types_data:
    resource_type, created = ResourceType.objects.get_or_create(
        name=type_data['name'],
        defaults={
            'description': type_data['description'],
            'overhead_percentage': type_data['overhead_percentage']
        }
    )
    if created:
        created_types += 1
        print(f'Creado tipo de recurso: {resource_type.name}')
    else:
        print(f'Ya existe tipo de recurso: {resource_type.name}')

print(f'\nSe crearon {created_types} nuevos tipos de recursos.')

# Create sample resources
try:
    # Get first user or create admin user
    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        admin_user = User.objects.first()
        
    material_type = ResourceType.objects.get(name='material')
    labor_type = ResourceType.objects.get(name='labor')
    equipment_type = ResourceType.objects.get(name='equipment')
    
    resources_data = [
        # Materials
        {'name': 'Cemento Portland', 'code': 'MAT001', 'resource_type': material_type, 'unit': 'kg', 'unit_cost': 1200, 'description': 'Cemento Portland tipo I'},
        {'name': 'Arena de río', 'code': 'MAT002', 'resource_type': material_type, 'unit': 'm³', 'unit_cost': 35000, 'description': 'Arena lavada de río'},
        {'name': 'Gravilla', 'code': 'MAT003', 'resource_type': material_type, 'unit': 'm³', 'unit_cost': 45000, 'description': 'Gravilla clasificada'},
        {'name': 'Ladrillo común', 'code': 'MAT004', 'resource_type': material_type, 'unit': 'unidad', 'unit_cost': 800, 'description': 'Ladrillo común tolete'},
        {'name': 'Hierro de refuerzo', 'code': 'MAT005', 'resource_type': material_type, 'unit': 'kg', 'unit_cost': 4500, 'description': 'Varilla corrugada 60000 PSI'},
        
        # Labor
        {'name': 'Oficial construcción', 'code': 'MO001', 'resource_type': labor_type, 'unit': 'hora', 'unit_cost': 8500, 'description': 'Oficial especializado en construcción'},
        {'name': 'Ayudante construcción', 'code': 'MO002', 'resource_type': labor_type, 'unit': 'hora', 'unit_cost': 6200, 'description': 'Ayudante de construcción'},
        {'name': 'Maestro de obra', 'code': 'MO003', 'resource_type': labor_type, 'unit': 'hora', 'unit_cost': 12000, 'description': 'Maestro de obra especializado'},
        {'name': 'Soldador', 'code': 'MO004', 'resource_type': labor_type, 'unit': 'hora', 'unit_cost': 15000, 'description': 'Soldador especializado'},
        
        # Equipment
        {'name': 'Mezcladora concreto', 'code': 'EQ001', 'resource_type': equipment_type, 'unit': 'hora', 'unit_cost': 25000, 'description': 'Mezcladora de concreto 1 saco'},
        {'name': 'Vibrador concreto', 'code': 'EQ002', 'resource_type': equipment_type, 'unit': 'hora', 'unit_cost': 8000, 'description': 'Vibrador de concreto 1.5 HP'},
        {'name': 'Retroexcavadora', 'code': 'EQ003', 'resource_type': equipment_type, 'unit': 'hora', 'unit_cost': 85000, 'description': 'Retroexcavadora CAT 320'},
        {'name': 'Volqueta', 'code': 'EQ004', 'resource_type': equipment_type, 'unit': 'hora', 'unit_cost': 45000, 'description': 'Volqueta 8 m³'},
    ]
    
    print("\nCreando recursos...")
    created_resources = 0
    for resource_data in resources_data:
        resource, created = Resource.objects.get_or_create(
            code=resource_data['code'],
            defaults={
                'name': resource_data['name'],
                'resource_type': resource_data['resource_type'],
                'unit': resource_data['unit'],
                'unit_cost': resource_data['unit_cost'],
                'description': resource_data['description'],
                'created_by': admin_user
            }
        )
        if created:
            created_resources += 1
            print(f'Creado recurso: {resource.code} - {resource.name}')
        else:
            print(f'Ya existe recurso: {resource.code} - {resource.name}')
    
    print(f'\nSe crearon {created_resources} nuevos recursos.')
    print(f'Total de recursos: {Resource.objects.count()}')
    print(f'Total de tipos de recursos: {ResourceType.objects.count()}')
    
except Exception as e:
    print(f'Error creando recursos: {e}')
    import traceback
    traceback.print_exc()
