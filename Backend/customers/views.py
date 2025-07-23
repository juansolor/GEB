from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Customer
from .serializers import CustomerSerializer, CustomerCreateUpdateSerializer, CustomerListSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Customer model providing CRUD operations
    """
    queryset = Customer.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CustomerListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CustomerCreateUpdateSerializer
        return CustomerSerializer
    
    def get_queryset(self):
        queryset = Customer.objects.all()
        search = self.request.query_params.get('search', None)
        customer_type = self.request.query_params.get('customer_type', None)
        is_active = self.request.query_params.get('is_active', None)
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(document_number__icontains=search) |
                Q(phone__icontains=search)
            )
        
        if customer_type:
            queryset = queryset.filter(customer_type=customer_type)
            
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Override create to return full customer data with dates"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Get the created instance and serialize with full data
        instance = serializer.instance
        full_serializer = CustomerSerializer(instance)
        headers = self.get_success_headers(full_serializer.data)
        return Response(full_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        """Override update to return full customer data with dates"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Return full customer data
        full_serializer = CustomerSerializer(instance)
        return Response(full_serializer.data)
    
    @action(detail=True, methods=['patch'])
    def toggle_active(self, request, pk=None):
        """Toggle customer active status"""
        customer = self.get_object()
        customer.is_active = not customer.is_active
        customer.save()
        serializer = self.get_serializer(customer)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get customer statistics"""
        total_customers = Customer.objects.count()
        active_customers = Customer.objects.filter(is_active=True).count()
        individual_customers = Customer.objects.filter(customer_type='individual').count()
        business_customers = Customer.objects.filter(customer_type='business').count()
        
        return Response({
            'total_customers': total_customers,
            'active_customers': active_customers,
            'inactive_customers': total_customers - active_customers,
            'individual_customers': individual_customers,
            'business_customers': business_customers
        })
