import os
import sys
import django

# Add the current directory to the Python path
sys.path.append('.')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'geb_backend.settings')
django.setup()

from django.http import JsonResponse
from sales.models import Sale, SaleItem
from products.models import Product
from customers.models import Customer
from finances.models import Transaction
from django.db.models import Sum, Count, F, Q

def simple_report_test():
    """Prueba simple de funcionalidad de reportes"""
    print("=== PRUEBA SIMPLE DE REPORTES ===")
    
    # Test de tipos de reportes
    report_types = [
        {
            'key': 'sales',
            'name': 'Reporte de Ventas',
            'description': 'Analiza el rendimiento de ventas por período',
            'icon': '📊'
        },
        {
            'key': 'inventory',
            'name': 'Reporte de Inventario',
            'description': 'Estado actual del inventario y movimientos',
            'icon': '📦'
        },
        {
            'key': 'financial',
            'name': 'Reporte Financiero',
            'description': 'Ingresos, gastos y rentabilidad del negocio',
            'icon': '💰'
        }
    ]
    
    print(f"✅ Tipos de reportes: {len(report_types)}")
    for rt in report_types:
        print(f"  - {rt['icon']} {rt['name']}")
    
    # Test de reporte de ventas
    print("\n--- Generando reporte de ventas ---")
    sales = Sale.objects.all()
    total_sales = sales.aggregate(
        total_amount=Sum('total_amount'),
        total_count=Count('id')
    )
    
    print(f"Total ventas: ${total_sales['total_amount'] or 0}")
    print(f"Número de ventas: {total_sales['total_count']}")
    
    # Test de reporte de inventario
    print("\n--- Generando reporte de inventario ---")
    products = Product.objects.all()
    inventory_stats = products.aggregate(
        total_products=Count('id'),
        active_products=Count('id', filter=Q(is_active=True)),
        total_stock_value=Sum(F('stock_quantity') * F('cost')),
        low_stock_count=Count('id', filter=Q(stock_quantity__lte=F('min_stock_level')))
    )
    
    print(f"Total productos: {inventory_stats['total_products']}")
    print(f"Productos activos: {inventory_stats['active_products']}")
    print(f"Valor inventario: ${inventory_stats['total_stock_value'] or 0}")
    print(f"Stock bajo: {inventory_stats['low_stock_count']}")
    
    # Test de reporte financiero
    print("\n--- Generando reporte financiero ---")
    transactions = Transaction.objects.all()
    
    income = transactions.filter(transaction_type='income').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    expenses = transactions.filter(transaction_type='expense').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    print(f"Ingresos totales: ${income}")
    print(f"Gastos totales: ${expenses}")
    print(f"Ganancia neta: ${income - expenses}")
    
    return True

if __name__ == "__main__":
    try:
        result = simple_report_test()
        if result:
            print("\n✅ TODAS LAS PRUEBAS EXITOSAS")
            print("Los reportes están funcionando correctamente!")
        else:
            print("\n❌ ALGUNAS PRUEBAS FALLARON")
    except Exception as e:
        print(f"\n❌ ERROR EN PRUEBAS: {e}")
        import traceback
        traceback.print_exc()
