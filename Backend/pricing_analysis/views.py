from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from decimal import Decimal
import logging
from .models import (
    ServiceCategory, ResourceType, Resource, UnitPriceAnalysis, 
    UnitPriceItem, ProjectEstimate, ProjectEstimateItem
)
from .serializers import (
    ServiceCategorySerializer, ResourceTypeSerializer, ResourceSerializer,
    UnitPriceAnalysisSerializer, UnitPriceAnalysisCreateSerializer,
    UnitPriceItemSerializer, ProjectEstimateSerializer, 
    ProjectEstimateCreateSerializer, ProjectEstimateItemSerializer
)

logger = logging.getLogger(__name__)


class ServiceCategoryViewSet(viewsets.ModelViewSet):
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ResourceTypeViewSet(viewsets.ModelViewSet):
    queryset = ResourceType.objects.all()
    serializer_class = ResourceTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['resource_type', 'is_active']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'unit_cost', 'last_updated']
    
    def create(self, request, *args, **kwargs):
        logger.debug(f"Resource creation request data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Resource serializer validation errors: {serializer.errors}")
        return super().create(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        logger.debug(f"Performing resource creation with data: {serializer.validated_data}")
        serializer.save(created_by=self.request.user)


class UnitPriceAnalysisViewSet(viewsets.ModelViewSet):
    queryset = UnitPriceAnalysis.objects.prefetch_related('items__resource__resource_type')
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['category', 'is_active']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'created_at', 'unit_price']
    
    def get_serializer_class(self) -> type:
        if self.action == 'create':
            return UnitPriceAnalysisCreateSerializer
        return UnitPriceAnalysisSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        """Agregar un item/recurso al análisis"""
        analysis = self.get_object()
        # Pass the analysis to the serializer context for validation
        serializer = UnitPriceItemSerializer(data=request.data, context={'analysis': analysis})
        
        print(f"=== ADD ITEM DEBUG ===")
        print(f"Analysis ID: {analysis.id}")
        print(f"Analysis code: {analysis.code}")
        print(f"Request data: {request.data}")
        
        if serializer.is_valid():
            item = serializer.save(analysis=analysis)
            print(f"Item created: {item.id}")
            print(f"Item resource: {item.resource.code}")
            print("====================")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        print(f"Validation errors: {serializer.errors}")
        print("====================")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def cost_breakdown(self, request, pk=None):
        """Obtener el desglose de costos por tipo de recurso"""
        analysis = self.get_object()
        breakdown = analysis.get_cost_breakdown()
        
        # Debug: imprimir el breakdown completo
        print(f"=== DEBUG COST_BREAKDOWN API ===")
        print(f"Analysis ID: {analysis.id}")
        print(f"Analysis name: {analysis.name}")
        print(f"Total direct cost from analysis: {analysis.total_direct_cost}")
        print("Raw breakdown from model:")
        for tipo, data in breakdown.items():
            cost = data.get('cost', 0)
            print(f"  {tipo}: ${cost}")
        print("================================")
        
        # Extraer costos específicos por tipo
        materials_cost = breakdown.get('Material', {}).get('cost', 0)
        labor_cost = breakdown.get('Mano de Obra', {}).get('cost', 0)
        equipment_cost = breakdown.get('Equipo', {}).get('cost', 0)
        subcontract_cost = breakdown.get('Subcontrato', {}).get('cost', 0)
        transport_cost = breakdown.get('Transporte', {}).get('cost', 0)
        overhead_cost = breakdown.get('Gastos Generales', {}).get('cost', 0)
        
        # Los "otros" incluyen transporte y gastos generales
        other_cost = transport_cost + overhead_cost
        
        print(f"Extracted costs:")
        print(f"  Materials: ${materials_cost}")
        print(f"  Labor: ${labor_cost}")
        print(f"  Equipment: ${equipment_cost}")
        print(f"  Subcontract: ${subcontract_cost}")
        print(f"  Other: ${other_cost}")
        
        # Calcular totales
        total_direct_cost = analysis.total_direct_cost
        overhead_amount = total_direct_cost * analysis.administrative_percentage / 100
        total_with_overhead = total_direct_cost + overhead_amount
        profit_amount = total_with_overhead * analysis.profit_margin / 100
        final_price = total_with_overhead + profit_amount
        
        response_data = {
            'materials_cost': str(materials_cost),
            'labor_cost': str(labor_cost),
            'equipment_cost': str(equipment_cost),
            'subcontract_cost': str(subcontract_cost),
            'other_cost': str(other_cost),
            'total_direct_cost': str(total_direct_cost),
            'overhead_amount': str(overhead_amount),
            'total_with_overhead': str(total_with_overhead),
            'profit_amount': str(profit_amount),
            'final_price': str(final_price)
        }
        
        print(f"Response data: {response_data}")
        print("=================================")
        
        return Response(response_data)
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicar un análisis con nuevo código"""
        original = self.get_object()
        new_code = request.data.get('new_code')
        new_name = request.data.get('new_name')
        
        if not new_code:
            return Response(
                {'error': 'Se requiere un nuevo código'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar que el código no exista
        if UnitPriceAnalysis.objects.filter(code=new_code).exists():
            return Response(
                {'error': 'El código ya existe'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            # Crear copia del análisis
            new_analysis = UnitPriceAnalysis.objects.create(
                name=new_name or f"{original.name} (Copia)",
                code=new_code,
                category=original.category,
                description=original.description,
                unit=original.unit,
                performance_factor=original.performance_factor,
                difficulty_factor=original.difficulty_factor,
                profit_margin=original.profit_margin,
                administrative_percentage=original.administrative_percentage,
                created_by=request.user
            )
            
            # Copiar items
            for item in original.items.all():
                UnitPriceItem.objects.create(
                    analysis=new_analysis,
                    resource=item.resource,
                    quantity=item.quantity,
                    unit_cost=item.unit_cost,
                    efficiency=item.efficiency,
                    notes=item.notes
                )
        
        serializer = self.get_serializer(new_analysis)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UnitPriceItemViewSet(viewsets.ModelViewSet):
    queryset = UnitPriceItem.objects.select_related('resource__resource_type', 'analysis')
    serializer_class = UnitPriceItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['analysis', 'resource__resource_type']
    
    def create(self, request, *args, **kwargs):
        """Override create to add detailed logging"""
        print(f"=== DEBUG BACKEND UnitPriceItem CREATE ===")
        print(f"Request data: {request.data}")
        print(f"Request method: {request.method}")
        print(f"Request user: {request.user}")
        
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            print(f"Validation errors: {serializer.errors}")
            print("============================================")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"Validated data: {serializer.validated_data}")
        
        try:
            instance = serializer.save()
            print(f"Created item ID: {instance.id}")
            print(f"Item analysis: {instance.analysis.id}")
            print(f"Item resource: {instance.resource.id}")
            print("============================================")
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error creating item: {str(e)}")
            print("============================================")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def update(self, request, *args, **kwargs):
        """Override update to add detailed logging"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        print(f"=== DEBUG BACKEND UnitPriceItem UPDATE ===")
        print(f"Item ID: {instance.id}")
        print(f"Current analysis: {instance.analysis.id}")
        print(f"Current resource: {instance.resource.id}")
        print(f"Request data: {request.data}")
        print(f"Partial update: {partial}")
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if not serializer.is_valid():
            print(f"Validation errors: {serializer.errors}")
            print("============================================")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"Validated data: {serializer.validated_data}")
        
        try:
            updated_instance = serializer.save()
            print(f"Updated item ID: {updated_instance.id}")
            print(f"New analysis: {updated_instance.analysis.id}")
            print(f"New resource: {updated_instance.resource.id}")
            print("============================================")
            
            return Response(serializer.data)
        except Exception as e:
            print(f"Error updating item: {str(e)}")
            print("============================================")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def list(self, request, *args, **kwargs):
        """Override list to add detailed logging"""
        analysis_id = request.GET.get('analysis')
        
        print(f"=== DEBUG BACKEND UnitPriceItem LIST ===")
        print(f"Request params: {request.GET}")
        print(f"Analysis ID filter: {analysis_id}")
        
        # Get the queryset
        queryset = self.filter_queryset(self.get_queryset())
        
        if analysis_id:
            print(f"Filtering by analysis ID: {analysis_id}")
            queryset = queryset.filter(analysis=analysis_id)
        
        print(f"Queryset count: {queryset.count()}")
        
        # Debug each item in the queryset
        for i, item in enumerate(queryset[:10]):  # Solo los primeros 10 para evitar spam
            print(f"Item {i+1}:")
            print(f"  ID: {item.id}")
            print(f"  Analysis: {item.analysis.id} ({item.analysis.name})")
            print(f"  Resource: {item.resource.id} - {item.resource.code} - {item.resource.name}")
            print(f"  Resource Type: {item.resource.resource_type.get_name_display()}")
            print(f"  Quantity: {item.quantity}")
            print(f"  Unit Cost: {item.unit_cost}")
            print(f"  Total Cost: {item.total_cost}")
            print(f"  Notes: {item.notes}")
        
        # Serialize the data
        serializer = self.get_serializer(queryset, many=True)
        serialized_data = serializer.data
        
        print(f"Serialized data count: {len(serialized_data)}")
        
        # Debug serialized data
        for i, item_data in enumerate(serialized_data[:5]):  # Solo los primeros 5
            print(f"Serialized Item {i+1}: {item_data}")
        
        print("=========================================")
        
        return Response(serialized_data)
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to add logging"""
        instance = self.get_object()
        print(f"=== RETRIEVING UnitPriceItem ID: {instance.id} ===")
        print(f"Analysis: {instance.analysis.id}")
        print(f"Resource: {instance.resource.code} - {instance.resource.name}")
        
        serializer = self.get_serializer(instance)
        print(f"Serialized data: {serializer.data}")
        print("=============================================")
        
        return Response(serializer.data)


class ProjectEstimateViewSet(viewsets.ModelViewSet):
    queryset = ProjectEstimate.objects.prefetch_related('estimate_items__analysis')
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'client']
    search_fields = ['name', 'client', 'description']
    ordering_fields = ['name', 'estimate_date', 'total_estimate']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ProjectEstimateCreateSerializer
        return ProjectEstimateSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        """Agregar un item/análisis a la estimación"""
        _ = pk  # unused
        estimate = self.get_object()
        serializer = ProjectEstimateItemSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(estimate=estimate)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        """Cambiar el estado de la estimación"""
        _ = pk  # unused
        estimate = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(ProjectEstimate.STATUS_CHOICES):
            return Response(
                {'error': 'Estado inválido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        estimate.status = new_status
        estimate.save()
        
        return Response({
            'message': f'Estado cambiado a {estimate.get_status_display()}',
            'status': estimate.status
        })
    @action(detail=True, methods=['get'])
    def generate_report(self, request, pk=None):
        """Generar reporte detallado de la estimación"""
        _ = pk  # unused
        _ = request  # unused
        estimate = self.get_object()
        
        # Calcular totales por categoría
        category_totals = {}
        for item in estimate.estimate_items.all():
            category = item.analysis.category.name
            if category not in category_totals:
                category_totals[category] = {
                    'items': [],
                    'subtotal': 0
                }
            
            category_totals[category]['items'].append({
                'analysis': item.analysis.name,
                'code': item.analysis.code,
                'quantity': float(item.quantity),
                'unit': item.analysis.unit,
                'unit_price': float(item.unit_price),
                'total': float(item.total_amount)
            })
            category_totals[category]['subtotal'] += float(item.total_amount)
        
        return Response({
            'estimate': ProjectEstimateSerializer(estimate).data,
            'category_breakdown': category_totals,
            'summary': {
                'subtotal': float(sum(item.total_amount for item in estimate.estimate_items.all())),
                'site_factor': float(estimate.site_factor),
                'season_factor': float(estimate.season_factor),
                'total_estimate': float(estimate.total_estimate)
            }
        })


class ProjectEstimateItemViewSet(viewsets.ModelViewSet):
    queryset = ProjectEstimateItem.objects.select_related('estimate', 'analysis')
    serializer_class = ProjectEstimateItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['estimate', 'analysis__category']
