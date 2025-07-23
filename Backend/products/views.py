from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, F
import logging
from .models import Product, Category
from .serializers import (
    ProductSerializer, ProductCreateUpdateSerializer, ProductListSerializer,
    CategorySerializer
)

logger = logging.getLogger(__name__)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        logger.info(f"Creating category with data: {request.data}")
        logger.info(f"Request user: {request.user}")
        logger.info(f"Request headers: {dict(request.headers)}")
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            logger.info(f"Category data is valid: {serializer.validated_data}")
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            logger.info(f"Category created successfully: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            logger.error(f"Category creation failed. Errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-created_at', 'name')
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductSerializer
    
    def create(self, request, *args, **kwargs):
        logger.info(f"Creating product with data: {request.data}")
        logger.info(f"Request user: {request.user}")
        logger.info(f"Content-Type: {request.content_type}")
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            logger.info(f"Product data is valid: {serializer.validated_data}")
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            logger.info(f"Product created successfully: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            logger.error(f"Product creation failed. Errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get_queryset(self):
        queryset = Product.objects.all()
        
        # Filter by search query
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(sku__icontains=search) |
                Q(description__icontains=search)
            )
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by type
        product_type = self.request.query_params.get('type', None)
        if product_type:
            queryset = queryset.filter(type=product_type)
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Filter by low stock
        low_stock = self.request.query_params.get('low_stock', None)
        if low_stock and low_stock.lower() == 'true':
            queryset = queryset.filter(stock_quantity__lte=F('min_stock_level'))
        
        return queryset.order_by('-created_at', 'name')
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get products with low stock"""
        low_stock_products = self.get_queryset().filter(
            stock_quantity__lte=F('min_stock_level'),
            type='product',
            is_active=True
        )
        serializer = ProductListSerializer(low_stock_products, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        """Update product stock"""
        product = self.get_object()
        quantity = request.data.get('quantity', 0)
        operation = request.data.get('operation', 'add')  # 'add' or 'subtract'
        
        try:
            quantity = int(quantity)
        except (ValueError, TypeError):
            return Response(
                {'error': 'Cantidad debe ser un número válido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if operation == 'add':
            product.stock_quantity += quantity
        elif operation == 'subtract':
            if product.stock_quantity < quantity:
                return Response(
                    {'error': 'No hay suficiente stock disponible'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            product.stock_quantity -= quantity
        else:
            return Response(
                {'error': 'Operación debe ser "add" o "subtract"'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        product.save()
        serializer = ProductSerializer(product)
        return Response(serializer.data)
