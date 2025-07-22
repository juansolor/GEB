from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
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
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class UnitPriceAnalysisViewSet(viewsets.ModelViewSet):
    queryset = UnitPriceAnalysis.objects.prefetch_related('items__resource__resource_type')
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['category', 'is_active']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'created_at', 'unit_price']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UnitPriceAnalysisCreateSerializer
        return UnitPriceAnalysisSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        """Agregar un item/recurso al análisis"""
        analysis = self.get_object()
        serializer = UnitPriceItemSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(analysis=analysis)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def cost_breakdown(self, request, pk=None):
        """Obtener el desglose de costos por tipo de recurso"""
        analysis = self.get_object()
        breakdown = analysis.get_cost_breakdown()
        return Response({
            'analysis_id': analysis.id,
            'analysis_name': analysis.name,
            'total_direct_cost': analysis.total_direct_cost,
            'unit_price': analysis.unit_price,
            'breakdown': breakdown
        })
    
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
        estimate = self.get_object()
        serializer = ProjectEstimateItemSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(estimate=estimate)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        """Cambiar el estado de la estimación"""
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
