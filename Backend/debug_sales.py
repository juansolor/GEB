import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'geb_backend.settings')
django.setup()

from sales.models import Sale, SaleItem
# from datetime import datetime
# from django.utils import timezone

def debug_sales_report():
    """Debug para encontrar el problema en el reporte de ventas"""
    print("=== DEBUG REPORTE DE VENTAS ===")
    
    # 1. Verificar si existen ventas
    sales_count = Sale.objects.count()
    print(f"Total de ventas en la DB: {sales_count}")
    
    if sales_count > 0:
        # Mostrar una venta de ejemplo
        sample_sale = Sale.objects.first()
        print(f"Venta de ejemplo: {sample_sale}")
        if sample_sale is not None:
            print(f"  - ID: {getattr(sample_sale, 'id', 'N/A')}")
            print(f"  - Customer: {getattr(sample_sale, 'customer', 'N/A')}")
            print(f"  - Total: {getattr(sample_sale, 'total_amount', 'N/A')}")
            print(f"  - Created at: {getattr(sample_sale, 'created_at', 'N/A')}")
        else:
            print("No se encontró una venta de ejemplo.")
        
        # Verificar items de venta
        items_count = SaleItem.objects.count()
        print(f"Total de items de venta: {items_count}")
        
        if items_count > 0:
            sample_item = SaleItem.objects.first()
            print(f"Item de ejemplo: {sample_item}")
            if sample_item is not None:
                print(f"  - Product: {getattr(sample_item, 'product', 'N/A')}")
                print(f"  - Quantity: {getattr(sample_item, 'quantity', 'N/A')}")
                print(f"  - Unit price: {getattr(sample_item, 'unit_price', 'N/A')}")
            else:
                print("No se encontró un item de ejemplo.")
    
    # 2. Probar la consulta que está fallando
    try:
        print("\n=== PROBANDO CONSULTA DE VENTAS ===")
        
        # Sin filtros de fecha primero
        sales = Sale.objects.all().select_related('customer').order_by('-created_at')
        print(f"Ventas sin filtro: {sales.count()}")
        
        # Probar agregación
        from django.db.models import Sum, Count
        total_sales = sales.aggregate(
            total_amount=Sum('total_amount'),
            total_count=Count('id')
        )
        print(f"Agregación total: {total_sales}")
        
        # Probar consulta de productos
        from django.db.models import F
        products_data = SaleItem.objects.filter(
            sale__in=sales
        ).values(
            'product__name', 'product__sku'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum(F('quantity') * F('unit_price')),
            sales_count=Count('sale', distinct=True)
        ).order_by('-total_revenue')
        
        print(f"Datos de productos: {list(products_data)}")
        
    except Exception as e:
        print(f"❌ Error en consulta: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    debug_sales_report()
