from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from django.db.models.query import QuerySet
from .models import Sale
from .serializers import (
    SaleSerializer, SaleCreateSerializer, SaleListSerializer
)


class SaleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing sales
    """
    queryset = Sale.objects.all().order_by('-created_at')
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self) -> type:
        if self.action == 'create':
            return SaleCreateSerializer
        elif self.action == 'list':
            return SaleListSerializer
        return SaleSerializer
    
    def get_queryset(self) -> QuerySet[Sale]:  # type: ignore
        queryset = Sale.objects.all().order_by('-created_at')
        request = getattr(self, 'request', None)
        if request:
            # Filter by status
            status_filter = request.query_params.get('status', None)
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            # Filter by customer
            customer_id = request.query_params.get('customer', None)
            if customer_id:
                queryset = queryset.filter(customer_id=customer_id)
            
            # Filter by date range
            start_date = request.query_params.get('start_date', None)
            end_date = request.query_params.get('end_date', None)
            if start_date:
                queryset = queryset.filter(sale_date__gte=start_date)
            if end_date:
                queryset = queryset.filter(sale_date__lte=end_date)
        return queryset
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get sales statistics"""
        queryset = self.get_queryset()
        
        total_sales = queryset.count()
        total_revenue = queryset.aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        
        pending_sales = queryset.filter(status='pending').count()
        completed_sales = queryset.filter(status='completed').count()
        
        # Monthly statistics
        from django.utils import timezone
        current_month = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        monthly_sales = queryset.filter(sale_date__gte=current_month)
        monthly_revenue = monthly_sales.aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        
        return Response({
            'total_sales': total_sales,
            'total_revenue': float(total_revenue),
            'pending_sales': pending_sales,
            'completed_sales': completed_sales,
            'monthly_sales': monthly_sales.count(),
            'monthly_revenue': float(monthly_revenue)
        })
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark sale as completed"""
        sale = self.get_object()
        if sale.status == 'pending':
            sale.status = 'completed'
            sale.save()
            return Response({'message': 'Venta marcada como completada'})
        return Response(
            {'error': 'Solo se pueden completar ventas pendientes'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel sale and restore stock"""
        sale = self.get_object()
        if sale.status in ['pending']:
            # Restore stock for products
            for item in sale.items.all():
                if item.product.type == 'product':
                    item.product.stock_quantity += item.quantity
                    item.product.save()
            
            sale.status = 'cancelled'
            sale.save()
            return Response({'message': 'Venta cancelada y stock restaurado'})
        return Response(
            {'error': 'Solo se pueden cancelar ventas pendientes'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
