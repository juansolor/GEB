from rest_framework import serializers
from .models import Transaction, ExpenseCategory, Budget


class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = ['id', 'name', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_type', 'description', 'amount', 'payment_method',
            'category', 'category_name', 'transaction_date', 'receipt_number',
            'notes', 'attachment', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class TransactionCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            'transaction_type', 'description', 'amount', 'payment_method',
            'category', 'transaction_date', 'receipt_number', 'notes', 'attachment'
        ]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("El monto debe ser mayor a 0")
        return value


class TransactionListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_type', 'description', 'amount',
            'category_name', 'transaction_date', 'payment_method'
        ]


class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    spent_amount = serializers.ReadOnlyField()
    remaining_amount = serializers.ReadOnlyField()
    percentage_used = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = [
            'id', 'category', 'category_name', 'year', 'month',
            'budgeted_amount', 'spent_amount', 'remaining_amount',
            'percentage_used', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_percentage_used(self, obj):
        if obj.budgeted_amount > 0:
            return round((obj.spent_amount / obj.budgeted_amount) * 100, 2)
        return 0

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class BudgetCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ['category', 'year', 'month', 'budgeted_amount']

    def validate_budgeted_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("El monto presupuestado debe ser mayor a 0")
        return value

    def validate(self, attrs):
        category = attrs.get('category')
        year = attrs.get('year')
        month = attrs.get('month')
        
        instance = getattr(self, 'instance', None)
        if instance:
            # Skip validation for updates of the same instance
            if (instance.category == category and 
                instance.year == year and 
                instance.month == month):
                return attrs
        
        if Budget.objects.filter(category=category, year=year, month=month).exists():
            raise serializers.ValidationError("Ya existe un presupuesto para esta categoría en este período")
        
        return attrs
