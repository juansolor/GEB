from rest_framework import serializers
from .models import Product, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_low_stock = serializers.ReadOnlyField()
    profit_margin = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'type', 'category', 'category_name',
            'sku', 'price', 'cost', 'stock_quantity', 'min_stock_level',
            'is_active', 'image', 'is_low_stock', 'profit_margin',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'name', 'description', 'type', 'category', 'sku', 'price',
            'cost', 'stock_quantity', 'min_stock_level', 'is_active', 'image'
        ]

    def validate_sku(self, value):
        if value:
            instance = getattr(self, 'instance', None)
            if instance and instance.sku == value:
                return value
            if Product.objects.filter(sku=value).exists():
                raise serializers.ValidationError("SKU ya existe")
        return value


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_low_stock = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'type', 'category_name', 'sku', 'price',
            'stock_quantity', 'is_active', 'is_low_stock'
        ]
