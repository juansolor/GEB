from rest_framework import serializers
from .models import (
    ServiceCategory, ResourceType, Resource, UnitPriceAnalysis, 
    UnitPriceItem, ProjectEstimate, ProjectEstimateItem
)


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'description', 'code', 'is_active', 'created_at']
        read_only_fields = ['created_at']


class ResourceTypeSerializer(serializers.ModelSerializer):
    name_display = serializers.CharField(source='get_name_display', read_only=True)
    
    class Meta:
        model = ResourceType
        fields = ['id', 'name', 'name_display', 'description', 'overhead_percentage']


class ResourceSerializer(serializers.ModelSerializer):
    resource_type_name = serializers.CharField(source='resource_type.get_name_display', read_only=True)
    cost_with_overhead = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = Resource
        fields = [
            'id', 'name', 'code', 'resource_type', 'resource_type_name', 
            'unit', 'unit_cost', 'cost_with_overhead', 'description', 
            'supplier', 'is_active', 'last_updated'
        ]
        read_only_fields = ['last_updated', 'cost_with_overhead']


class UnitPriceItemSerializer(serializers.ModelSerializer):
    resource_name = serializers.CharField(source='resource.name', read_only=True)
    resource_unit = serializers.CharField(source='resource.unit', read_only=True)
    resource_type = serializers.CharField(source='resource.resource_type.get_name_display', read_only=True)
    total_cost = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = UnitPriceItem
        fields = [
            'id', 'resource', 'resource_name', 'resource_unit', 'resource_type',
            'quantity', 'unit_cost', 'efficiency', 'total_cost', 'notes'
        ]


class UnitPriceAnalysisSerializer(serializers.ModelSerializer):
    items = UnitPriceItemSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    total_direct_cost = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    administrative_cost = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    profit_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    unit_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    cost_breakdown = serializers.SerializerMethodField()
    
    class Meta:
        model = UnitPriceAnalysis
        fields = [
            'id', 'name', 'code', 'category', 'category_name', 'description', 'unit',
            'performance_factor', 'difficulty_factor', 'profit_margin', 'administrative_percentage',
            'is_active', 'version', 'total_direct_cost', 'administrative_cost', 
            'profit_amount', 'unit_price', 'cost_breakdown', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_cost_breakdown(self, obj):
        return obj.get_cost_breakdown()


class UnitPriceAnalysisCreateSerializer(serializers.ModelSerializer):
    """Serializador simplificado para crear análisis sin items"""
    class Meta:
        model = UnitPriceAnalysis
        fields = [
            'name', 'code', 'category', 'description', 'unit',
            'performance_factor', 'difficulty_factor', 'profit_margin', 'administrative_percentage'
        ]


class ProjectEstimateItemSerializer(serializers.ModelSerializer):
    analysis_name = serializers.CharField(source='analysis.name', read_only=True)
    analysis_unit = serializers.CharField(source='analysis.unit', read_only=True)
    analysis_code = serializers.CharField(source='analysis.code', read_only=True)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = ProjectEstimateItem
        fields = [
            'id', 'analysis', 'analysis_name', 'analysis_code', 'analysis_unit',
            'quantity', 'unit_price', 'total_amount', 'description'
        ]


class ProjectEstimateSerializer(serializers.ModelSerializer):
    estimate_items = ProjectEstimateItemSerializer(many=True, read_only=True)
    total_estimate = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    validity_end_date = serializers.DateField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = ProjectEstimate
        fields = [
            'id', 'name', 'client', 'description', 'location', 'estimate_date', 
            'validity_days', 'validity_end_date', 'site_factor', 'season_factor',
            'status', 'status_display', 'total_estimate', 'estimate_items',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ProjectEstimateCreateSerializer(serializers.ModelSerializer):
    """Serializador simplificado para crear estimaciones sin items"""
    class Meta:
        model = ProjectEstimate
        fields = [
            'name', 'client', 'description', 'location', 'estimate_date',
            'validity_days', 'site_factor', 'season_factor'
        ]
