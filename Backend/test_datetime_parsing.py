import os
import django
from datetime import datetime
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'geb_backend.settings')
django.setup()

# Test the specific functions that are causing issues
def test_datetime_parsing():
    """Test the datetime parsing logic"""
    print("=== TEST DATETIME PARSING ===")
    
    try:
        # Test the problematic datetime parsing from the view
        start_date = '2025-07-24'
        end_date = '2025-07-25'
        
        print(f"Start date: {start_date}")
        print(f"End date: {end_date}")
        
        # This is the problematic line from the view
        if start_date:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            print(f"Parsed start_dt (naive): {start_dt}")
            # This should be timezone-aware
            start_dt_aware = timezone.make_aware(start_dt, timezone.get_current_timezone())
            print(f"Timezone-aware start_dt: {start_dt_aware}")
            
        if end_date:
            end_dt = datetime.strptime(end_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
            print(f"Parsed end_dt (naive): {end_dt}")
            # This should be timezone-aware
            end_dt_aware = timezone.make_aware(end_dt, timezone.get_current_timezone())
            print(f"Timezone-aware end_dt: {end_dt_aware}")
        
        print("✓ Datetime parsing works correctly")
        
        # Now test database queries
        from sales.models import Sale, SaleItem
        from sales.models import Sale
        print("\n--- Testing database queries ---")
        
        filter_kwargs = {}
        if start_date:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            filter_kwargs['created_at__gte'] = timezone.make_aware(start_dt, timezone.get_current_timezone())
        if end_date:
            end_dt = datetime.strptime(end_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
            filter_kwargs['created_at__lte'] = timezone.make_aware(end_dt, timezone.get_current_timezone())
        
        print(f"Filter kwargs: {filter_kwargs}")
        
        # Test the query
        sales = Sale.objects.filter(**filter_kwargs).select_related('customer').order_by('-created_at')
        print(f"Sales count: {sales.count()}")
        
        for sale in sales:
            print(f"Sale: {sale.pk} - {sale.created_at} - ${sale.total_amount}")
            print(f"Sale: {sale.pk} - {sale.created_at} - ${sale.total_amount}")
        print("✓ Database queries work correctly")
        
    except Exception as e:
        print(f"✗ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_datetime_parsing()
