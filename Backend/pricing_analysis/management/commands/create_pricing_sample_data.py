from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from pricing_analysis.models import (
    ServiceCategory, ResourceType, Resource, UnitPriceAnalysis, UnitPriceItem
)
from decimal import Decimal

User = get_user_model()


class Command(BaseCommand):
    help = 'Crea datos de ejemplo para análisis de precios de ingeniería'

    def handle(self, *args, **options):
        # Crear usuario administrador si no existe
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@geb.com',
                'first_name': 'Admin',
                'last_name': 'GEB',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()

        # Crear tipos de recursos
        resource_types_data = [
            ('material', 'Material', 5.0),
            ('labor', 'Mano de Obra', 35.0),
            ('equipment', 'Equipo', 15.0),
            ('subcontract', 'Subcontrato', 0.0),
            ('transport', 'Transporte', 10.0),
            ('overhead', 'Gastos Generales', 0.0),
        ]

        for name, description, overhead in resource_types_data:
            ResourceType.objects.get_or_create(
                name=name,
                defaults={
                    'description': description,
                    'overhead_percentage': Decimal(str(overhead))
                }
            )

        # Crear categorías de servicios
        categories_data = [
            ('EST', 'Estudios y Diseños', 'Estudios topográficos, geotécnicos y diseños estructurales'),
            ('CON', 'Construcción', 'Obras de construcción civil y estructural'),
            ('INS', 'Instalaciones', 'Instalaciones eléctricas, hidráulicas y mecánicas'),
            ('MAN', 'Mantenimiento', 'Servicios de mantenimiento preventivo y correctivo'),
            ('CON-ELE', 'Consultoría', 'Servicios de consultoría y supervisión técnica'),
        ]

        for code, name, description in categories_data:
            ServiceCategory.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'description': description,
                    'created_by': admin_user
                }
            )

        # Crear recursos de ejemplo
        resources_data = [
            # Materiales
            ('MAT-001', 'Cemento Portland Tipo I', 'material', 'kg', 0.85),
            ('MAT-002', 'Arena gruesa', 'material', 'm3', 45.00),
            ('MAT-003', 'Piedra chancada 3/4"', 'material', 'm3', 55.00),
            ('MAT-004', 'Fierro corrugado 1/2"', 'material', 'kg', 4.20),
            ('MAT-005', 'Ladrillo King Kong 18 huecos', 'material', 'und', 0.65),
            ('MAT-006', 'Tubo PVC 4" SAP', 'material', 'm', 15.50),
            
            # Mano de obra
            ('MO-001', 'Operario', 'labor', 'hora', 18.50),
            ('MO-002', 'Oficial', 'labor', 'hora', 14.80),
            ('MO-003', 'Peón', 'labor', 'hora', 12.30),
            ('MO-004', 'Capataz', 'labor', 'hora', 22.00),
            ('MO-005', 'Ingeniero residente', 'labor', 'día', 350.00),
            ('MO-006', 'Topógrafo', 'labor', 'día', 180.00),
            
            # Equipos
            ('EQ-001', 'Mezcladora de concreto 9-11 p3', 'equipment', 'hora', 25.00),
            ('EQ-002', 'Vibrador de concreto 4HP', 'equipment', 'hora', 8.50),
            ('EQ-003', 'Compactadora vibratoria tipo plancha', 'equipment', 'hora', 12.00),
            ('EQ-004', 'Teodolito', 'equipment', 'día', 35.00),
            ('EQ-005', 'Nivel de ingeniero', 'equipment', 'día', 25.00),
            ('EQ-006', 'Retroexcavadora sobre orugas 115-165 HP', 'equipment', 'hora', 185.00),
            
            # Transporte
            ('TR-001', 'Camión volquete 15 m3', 'transport', 'hora', 120.00),
            ('TR-002', 'Camioneta pickup 4x4', 'transport', 'día', 180.00),
            
            # Subcontratos
            ('SUB-001', 'Ensayo de compresión de concreto', 'subcontract', 'und', 45.00),
            ('SUB-002', 'Estudio de mecánica de suelos', 'subcontract', 'est', 2500.00),
        ]

        for code, name, resource_type, unit, cost in resources_data:
            rt = ResourceType.objects.get(name=resource_type)
            Resource.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'resource_type': rt,
                    'unit': unit,
                    'unit_cost': Decimal(str(cost)),
                    'created_by': admin_user
                }
            )

        # Crear algunos análisis de precios unitarios de ejemplo
        construction_category = ServiceCategory.objects.get(code='CON')
        
        # Análisis 1: Concreto f'c=210 kg/cm2
        analysis1, created = UnitPriceAnalysis.objects.get_or_create(
            code='APU-001',
            defaults={
                'name': 'Concreto f\'c=210 kg/cm2 en columnas',
                'category': construction_category,
                'description': 'Concreto preparado en obra para columnas, incluye mezclado, vaciado y vibrado',
                'unit': 'm3',
                'performance_factor': Decimal('1.1000'),  # 10% menos rendimiento
                'difficulty_factor': Decimal('1.0000'),
                'profit_margin': Decimal('18.00'),
                'administrative_percentage': Decimal('8.00'),
                'created_by': admin_user
            }
        )

        if created:
            # Agregar items al análisis
            items_data = [
                ('MAT-001', 350.0, 0.85),  # Cemento
                ('MAT-002', 0.54, 45.00),  # Arena
                ('MAT-003', 0.81, 55.00),  # Piedra
                ('MO-001', 2.5, 18.50),    # Operario
                ('MO-002', 2.5, 14.80),    # Oficial
                ('MO-003', 5.0, 12.30),    # Peón
                ('EQ-001', 1.0, 25.00),    # Mezcladora
                ('EQ-002', 0.5, 8.50),     # Vibrador
            ]
            
            for resource_code, quantity, unit_cost in items_data:
                resource = Resource.objects.get(code=resource_code)
                UnitPriceItem.objects.create(
                    analysis=analysis1,
                    resource=resource,
                    quantity=Decimal(str(quantity)),
                    unit_cost=Decimal(str(unit_cost))
                )

        # Análisis 2: Excavación masiva
        analysis2, created = UnitPriceAnalysis.objects.get_or_create(
            code='APU-002',
            defaults={
                'name': 'Excavación masiva con maquinaria',
                'category': construction_category,
                'description': 'Excavación masiva en terreno normal, incluye carga y eliminación',
                'unit': 'm3',
                'performance_factor': Decimal('1.0000'),
                'difficulty_factor': Decimal('1.2000'),  # 20% más difícil
                'profit_margin': Decimal('15.00'),
                'administrative_percentage': Decimal('5.00'),
                'created_by': admin_user
            }
        )

        if created:
            items_data = [
                ('EQ-006', 0.08, 185.00),  # Retroexcavadora
                ('TR-001', 0.05, 120.00),  # Volquete
                ('MO-004', 0.10, 22.00),   # Capataz
                ('MO-001', 0.15, 18.50),   # Operario
            ]
            
            for resource_code, quantity, unit_cost in items_data:
                resource = Resource.objects.get(code=resource_code)
                UnitPriceItem.objects.create(
                    analysis=analysis2,
                    resource=resource,
                    quantity=Decimal(str(quantity)),
                    unit_cost=Decimal(str(unit_cost))
                )

        self.stdout.write(
            self.style.SUCCESS('Datos de ejemplo creados exitosamente para análisis de precios')
        )
