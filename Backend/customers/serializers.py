from rest_framework import serializers
from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    total_purchases = serializers.ReadOnlyField()

    class Meta:
        model = Customer
        fields = [
            'id', 'name', 'customer_type', 'document_number', 'email',
            'phone', 'address', 'city', 'state', 'postal_code',
            'notes', 'is_active', 'total_purchases', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class CustomerCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'name', 'customer_type', 'document_number', 'email',
            'phone', 'address', 'city', 'state', 'postal_code',
            'notes', 'is_active'
        ]

    def validate_document_number(self, value):
        if value:
            instance = getattr(self, 'instance', None)
            if instance and instance.document_number == value:
                return value
            if Customer.objects.filter(document_number=value).exists():
                raise serializers.ValidationError("Número de documento ya existe")
        return value


class CustomerListSerializer(serializers.ModelSerializer):
    total_purchases = serializers.ReadOnlyField()

    class Meta:
        model = Customer
        fields = ['id', 'name', 'customer_type', 'email', 'phone', 'total_purchases', 'is_active', 'created_at', 'updated_at']
