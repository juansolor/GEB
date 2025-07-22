from rest_framework import serializers
from .models import Sale, SaleItem
from products.models import Product
from customers.models import Customer
from products.serializers import ProductListSerializer
from customers.serializers import CustomerListSerializer


class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)

    class Meta:
        model = SaleItem
        fields = ['id', 'product', 'product_name', 'product_sku', 'quantity', 'unit_price', 'total_price']
        read_only_fields = ['id', 'total_price']


class SaleItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleItem
        fields = ['product', 'quantity', 'unit_price']

    def validate_product(self, value):
        if not value.is_active:
            raise serializers.ValidationError("Producto no está activo")
        return value

    def validate(self, attrs):
        product = attrs['product']
        quantity = attrs['quantity']
        
        if product.type == 'product' and product.stock_quantity < quantity:
            raise serializers.ValidationError(f"Stock insuficiente. Disponible: {product.stock_quantity}")
        
        return attrs


class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Sale
        fields = [
            'id', 'sale_number', 'customer', 'customer_name', 'sale_date',
            'payment_method', 'status', 'subtotal', 'tax_amount',
            'discount_amount', 'total_amount', 'notes', 'items',
            'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'sale_number', 'sale_date', 'created_at', 'updated_at']


class SaleCreateSerializer(serializers.ModelSerializer):
    items = SaleItemCreateSerializer(many=True, write_only=True)

    class Meta:
        model = Sale
        fields = [
            'customer', 'payment_method', 'subtotal', 'tax_amount',
            'discount_amount', 'total_amount', 'notes', 'items'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        validated_data['created_by'] = self.context['request'].user
        sale = Sale.objects.create(**validated_data)
        
        for item_data in items_data:
            item_data['sale'] = sale
            SaleItem.objects.create(**item_data)
            
            # Update stock for products
            product = item_data['product']
            if product.type == 'product':
                product.stock_quantity -= item_data['quantity']
                product.save()
        
        return sale


class SaleListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Sale
        fields = [
            'id', 'sale_number', 'customer_name', 'sale_date',
            'payment_method', 'status', 'total_amount', 'items_count'
        ]

    def get_items_count(self, obj):
        return obj.items.count()
