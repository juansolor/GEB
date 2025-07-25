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
    resource_code = serializers.CharField(source='resource.code', read_only=True)
    resource_unit = serializers.CharField(source='resource.unit', read_only=True)
    resource_type = serializers.CharField(source='resource.resource_type.get_name_display', read_only=True)
    performance_factor = serializers.DecimalField(source='efficiency', max_digits=5, decimal_places=3)
    total_cost = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    analysis = serializers.PrimaryKeyRelatedField(read_only=True)  # Incluir el analysis ID en la respuesta
    
    class Meta:
        model = UnitPriceItem
        fields = [
            'id', 'analysis', 'resource', 'resource_name', 'resource_code', 'resource_unit', 'resource_type',
            'quantity', 'unit_cost', 'efficiency', 'performance_factor', 'total_cost', 'notes'
        ]
    
    def validate(self, attrs):
        """Validación personalizada"""
        print(f"=== SERIALIZER VALIDATION ===")
        print(f"Raw input data: {attrs}")
        
        # Import at the top level to avoid unbound errors
        from .models import Resource, UnitPriceItem
        
        # Verificar que el recurso existe
        resource = attrs.get('resource')
        if resource:
            try:
                # Check if resource is already a model instance (during update)
                if isinstance(resource, Resource):
                    print(f"Resource is already an instance: {resource.code} - {resource.name}")
                else:
                    # It's an ID, so we need to fetch the instance
                    resource_id = resource
                    resource = Resource.objects.get(id=resource_id)
                    print(f"Resource found: {resource.code} - {resource.name}")
                
                # For create operations only, we need to get the analysis from the context
                # which is set in the add_item view
                if self.instance is None:  # Creating a new item
                    # We could get the analysis from the view context
                    analysis = self.context.get('analysis')
                    if analysis and UnitPriceItem.objects.filter(analysis=analysis, resource=resource).exists():
                        print(f"Resource {resource.code} already exists in analysis {analysis.code}")
                        raise serializers.ValidationError({
                            "non_field_errors": [
                                f"El recurso '{resource.code} - {resource.name}' ya existe en este análisis. Por favor edite el item existente."
                            ]
                        })
                
            except Resource.DoesNotExist:
                # Handle the case where we're trying to get a resource that doesn't exist
                resource_identifier = str(resource)
                print(f"Resource with ID {resource_identifier} not found")
                raise serializers.ValidationError({
                    "resource": [f"Resource with ID {resource_identifier} does not exist"]
                })
            except Exception as e:
                print(f"Error checking resource: {str(e)}")
                raise serializers.ValidationError({
                    "resource": [f"Error validating resource: {str(e)}"]
                })
        
        # Verificar que la cantidad es válida
        quantity = attrs.get('quantity')
        if quantity is not None and quantity <= 0:
            print(f"Invalid quantity: {quantity}")
            raise serializers.ValidationError({"quantity": ["La cantidad debe ser mayor que 0"]})
        
        # Verificar que el factor de eficiencia es válido
        efficiency = attrs.get('efficiency')
        if efficiency is not None and efficiency <= 0:
            print(f"Invalid efficiency: {efficiency}")
            raise serializers.ValidationError({"efficiency": ["La eficiencia debe ser mayor que 0"]})
        
        # Verificar que el costo unitario es válido
        unit_cost = attrs.get('unit_cost')
        if unit_cost is not None and unit_cost <= 0:
            print(f"Invalid unit cost: {unit_cost}")
            raise serializers.ValidationError({"unit_cost": ["El costo unitario debe ser mayor que 0"]})
        
        # If we're updating an existing item, make sure that we're not trying to change the analysis
        if self.instance and hasattr(self.instance, 'analysis'):
            # For safety, we don't allow changing the analysis of an existing item
            # The analysis shouldn't be in attrs during update since it's read-only
            if 'analysis' in attrs and attrs['analysis'] != self.instance.analysis:
                print(f"Attempt to change analysis from {self.instance.analysis.id} to {attrs['analysis'].id}")
                raise serializers.ValidationError({
                    "analysis": ["No se permite cambiar el análisis de un item existente"]
                })
        
        print(f"Validation passed for data: {attrs}")
        print("=============================")
        
        return attrs


class UnitPriceAnalysisSerializer(serializers.ModelSerializer):
    items = UnitPriceItemSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    total_direct_cost = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    # Campos con nombres que espera el frontend
    overhead_percentage = serializers.DecimalField(source='administrative_percentage', max_digits=5, decimal_places=2, read_only=True)
    efficiency_factor = serializers.DecimalField(source='performance_factor', max_digits=8, decimal_places=4, read_only=True)
    total_cost_with_overhead = serializers.SerializerMethodField()
    final_unit_price = serializers.SerializerMethodField()
    
    # Campos adicionales
    administrative_cost = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    profit_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    unit_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    cost_breakdown = serializers.SerializerMethodField()
    
    class Meta:
        model = UnitPriceAnalysis
        fields = [
            'id', 'name', 'code', 'category', 'category_name', 'description', 'unit',
            'performance_factor', 'difficulty_factor', 'profit_margin', 'administrative_percentage',
            'overhead_percentage', 'efficiency_factor', 'total_cost_with_overhead', 'final_unit_price',
            'is_active', 'version', 'total_direct_cost', 'administrative_cost', 
            'profit_amount', 'unit_price', 'cost_breakdown', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_total_cost_with_overhead(self, obj):
        """Calcula el costo total con gastos generales"""
        total_direct = obj.total_direct_cost
        overhead_amount = total_direct * obj.administrative_percentage / 100
        return total_direct + overhead_amount
    
    def get_final_unit_price(self, obj):
        """Calcula el precio final unitario con utilidad"""
        total_direct = obj.total_direct_cost
        overhead_amount = total_direct * obj.administrative_percentage / 100
        total_with_overhead = total_direct + overhead_amount
        profit_amount = total_with_overhead * obj.profit_margin / 100
        return total_with_overhead + profit_amount
    
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
