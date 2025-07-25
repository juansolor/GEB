import os
import sys
import django

# Add the current directory to the Python path
sys.path.append('.')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'geb_backend.settings')
django.setup()

from finances.models import ExpenseCategory

categories = [
    {'name': 'Alimentación', 'description': 'Gastos en comida y bebidas'},
    {'name': 'Transporte', 'description': 'Gastos en transporte y combustible'},
    {'name': 'Servicios Públicos', 'description': 'Electricidad, agua, gas, internet'},
    {'name': 'Arriendo', 'description': 'Pago de arriendo o hipoteca'},
    {'name': 'Salud', 'description': 'Gastos médicos y medicamentos'},
    {'name': 'Educación', 'description': 'Gastos educativos y cursos'},
    {'name': 'Entretenimiento', 'description': 'Ocio y entretenimiento'},
    {'name': 'Ropa', 'description': 'Vestimenta y accesorios'},
    {'name': 'Tecnología', 'description': 'Equipos tecnológicos y software'},
    {'name': 'Otros', 'description': 'Otros gastos no categorizados'}
]

created_count = 0
for cat_data in categories:
    try:
        category, created = ExpenseCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults={'description': cat_data['description']}
        )
        if created:
            created_count += 1
            print(f'Creada categoría: {category.name}')
        else:
            print(f'Ya existe categoría: {category.name}')
    except Exception as e:
        print(f'Error creando categoría {cat_data["name"]}: {e}')

print(f'\nSe crearon {created_count} nuevas categorías.')
print(f'Total de categorías: {ExpenseCategory.objects.count()}')
