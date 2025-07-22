from django.contrib import admin
from .models import (
    ServiceCategory, ResourceType, Resource, UnitPriceAnalysis, 
    UnitPriceItem, ProjectEstimate, ProjectEstimateItem
)


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'code', 'description']
    ordering = ['name']


@admin.register(ResourceType)
class ResourceTypeAdmin(admin.ModelAdmin):
    list_display = ['get_name_display', 'overhead_percentage']
    list_editable = ['overhead_percentage']


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'resource_type', 'unit', 'unit_cost', 'cost_with_overhead', 'is_active']
    list_filter = ['resource_type', 'is_active', 'last_updated']
    search_fields = ['name', 'code', 'description', 'supplier']
    ordering = ['resource_type', 'name']
    readonly_fields = ['cost_with_overhead', 'last_updated']


class UnitPriceItemInline(admin.TabularInline):
    model = UnitPriceItem
    extra = 1
    readonly_fields = ['total_cost']


@admin.register(UnitPriceAnalysis)
class UnitPriceAnalysisAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'category', 'unit', 'unit_price', 'is_active', 'version']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['name', 'code', 'description']
    ordering = ['-created_at']
    readonly_fields = ['total_direct_cost', 'administrative_cost', 'profit_amount', 'unit_price', 'created_at', 'updated_at']
    inlines = [UnitPriceItemInline]
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'code', 'category', 'description', 'unit')
        }),
        ('Factores y Márgenes', {
            'fields': ('performance_factor', 'difficulty_factor', 'profit_margin', 'administrative_percentage')
        }),
        ('Cálculos (Solo Lectura)', {
            'fields': ('total_direct_cost', 'administrative_cost', 'profit_amount', 'unit_price'),
            'classes': ('collapse',)
        }),
        ('Metadatos', {
            'fields': ('is_active', 'version', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(UnitPriceItem)
class UnitPriceItemAdmin(admin.ModelAdmin):
    list_display = ['analysis', 'resource', 'quantity', 'unit_cost', 'efficiency', 'total_cost']
    list_filter = ['resource__resource_type', 'analysis__category']
    search_fields = ['analysis__name', 'resource__name']
    readonly_fields = ['total_cost']


class ProjectEstimateItemInline(admin.TabularInline):
    model = ProjectEstimateItem
    extra = 1
    readonly_fields = ['total_amount']


@admin.register(ProjectEstimate)
class ProjectEstimateAdmin(admin.ModelAdmin):
    list_display = ['name', 'client', 'status', 'estimate_date', 'total_estimate', 'validity_end_date']
    list_filter = ['status', 'estimate_date', 'created_at']
    search_fields = ['name', 'client', 'description', 'location']
    ordering = ['-created_at']
    readonly_fields = ['total_estimate', 'validity_end_date', 'created_at', 'updated_at']
    inlines = [ProjectEstimateItemInline]
    
    fieldsets = (
        ('Información del Proyecto', {
            'fields': ('name', 'client', 'description', 'location')
        }),
        ('Fechas y Validez', {
            'fields': ('estimate_date', 'validity_days', 'validity_end_date')
        }),
        ('Factores del Proyecto', {
            'fields': ('site_factor', 'season_factor')
        }),
        ('Estado y Totales', {
            'fields': ('status', 'total_estimate')
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(ProjectEstimateItem)
class ProjectEstimateItemAdmin(admin.ModelAdmin):
    list_display = ['estimate', 'analysis', 'quantity', 'unit_price', 'total_amount']
    list_filter = ['estimate__status', 'analysis__category']
    search_fields = ['estimate__name', 'analysis__name']
    readonly_fields = ['total_amount']
