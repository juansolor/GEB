from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()


class ServiceCategory(models.Model):
    """Categorías de servicios de ingeniería"""
    name = models.CharField(max_length=100, verbose_name="Nombre")
    description = models.TextField(blank=True, verbose_name="Descripción")
    code = models.CharField(max_length=20, unique=True, verbose_name="Código")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    class Meta:
        verbose_name = "Categoría de Servicio"
        verbose_name_plural = "Categorías de Servicios"
        ordering = ['name']

    def __str__(self):
        return f"{self.code} - {self.name}"


class ResourceType(models.Model):
    """Tipos de recursos (Material, Mano de obra, Equipo, etc.)"""
    RESOURCE_TYPES = [
        ('material', 'Material'),
        ('labor', 'Mano de Obra'),
        ('equipment', 'Equipo'),
        ('subcontract', 'Subcontrato'),
        ('transport', 'Transporte'),
        ('overhead', 'Gastos Generales'),
    ]
    
    name = models.CharField(max_length=50, choices=RESOURCE_TYPES, unique=True)
    description = models.TextField(blank=True)
    overhead_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=0,
        help_text="Porcentaje de overhead aplicado a este tipo de recurso"
    )
    
    class Meta:
        verbose_name = "Tipo de Recurso"
        verbose_name_plural = "Tipos de Recursos"
    
    def __str__(self):
        return self.get_name_display()


class Resource(models.Model):
    """Recursos específicos (materiales, trabajadores, equipos, etc.)"""
    name = models.CharField(max_length=200, verbose_name="Nombre")
    code = models.CharField(max_length=50, unique=True, verbose_name="Código")
    resource_type = models.ForeignKey(ResourceType, on_delete=models.CASCADE, verbose_name="Tipo")
    unit = models.CharField(max_length=20, verbose_name="Unidad", help_text="ej: m3, kg, hora, día")
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Costo Unitario")
    description = models.TextField(blank=True, verbose_name="Descripción")
    supplier = models.CharField(max_length=200, blank=True, verbose_name="Proveedor")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    last_updated = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    class Meta:
        verbose_name = "Recurso"
        verbose_name_plural = "Recursos"
        ordering = ['resource_type', 'name']

    def __str__(self):
        return f"{self.code} - {self.name} ({self.unit})"

    @property
    def cost_with_overhead(self):
        """Calcula el costo incluyendo overhead"""
        overhead = self.resource_type.overhead_percentage / 100
        return self.unit_cost * (1 + overhead)


class UnitPriceAnalysis(models.Model):
    """Análisis de precio unitario para un servicio específico"""
    name = models.CharField(max_length=200, verbose_name="Nombre del Análisis")
    code = models.CharField(max_length=50, unique=True, verbose_name="Código")
    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE, verbose_name="Categoría")
    description = models.TextField(verbose_name="Descripción del Servicio")
    unit = models.CharField(max_length=20, verbose_name="Unidad", help_text="ej: m2, m3, pieza, global")
    
    # Rendimientos y factores
    performance_factor = models.DecimalField(
        max_digits=8, decimal_places=4, default=1.0000,
        verbose_name="Factor de Rendimiento",
        help_text="Factor que afecta la productividad (1.0 = rendimiento estándar)"
    )
    difficulty_factor = models.DecimalField(
        max_digits=5, decimal_places=3, default=1.000,
        verbose_name="Factor de Dificultad",
        help_text="Factor por condiciones especiales o dificultad del trabajo"
    )
    
    # Márgenes
    profit_margin = models.DecimalField(
        max_digits=5, decimal_places=2, default=15.00,
        verbose_name="Margen de Ganancia (%)"
    )
    administrative_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=5.00,
        verbose_name="Gastos Administrativos (%)"
    )
    
    # Metadatos
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    version = models.CharField(max_length=10, default="1.0", verbose_name="Versión")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    class Meta:
        verbose_name = "Análisis de Precio Unitario"
        verbose_name_plural = "Análisis de Precios Unitarios"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} - {self.name}"

    @property
    def total_direct_cost(self):
        """Calcula el costo directo total"""
        total = Decimal('0.00')
        for item in self.items.all():
            total += item.total_cost
        return total

    @property
    def administrative_cost(self):
        """Calcula los gastos administrativos"""
        return self.total_direct_cost * (self.administrative_percentage / 100)

    @property
    def subtotal_with_admin(self):
        """Subtotal incluyendo gastos administrativos"""
        return self.total_direct_cost + self.administrative_cost

    @property
    def profit_amount(self):
        """Calcula el monto de ganancia"""
        return self.subtotal_with_admin * (self.profit_margin / 100)

    @property
    def unit_price(self):
        """Precio unitario final"""
        base_cost = self.total_direct_cost * self.performance_factor * self.difficulty_factor
        admin_cost = base_cost * (self.administrative_percentage / 100)
        subtotal = base_cost + admin_cost
        profit = subtotal * (self.profit_margin / 100)
        return subtotal + profit

    def get_cost_breakdown(self):
        """Retorna el desglose de costos por tipo de recurso"""
        breakdown = {}
        for resource_type in ResourceType.objects.all():
            type_name = resource_type.get_name_display()
            breakdown[type_name] = {
                'cost': Decimal('0.00'),
                'percentage': Decimal('0.00')
            }
        
        total_cost = self.total_direct_cost
        if total_cost > 0:
            for item in self.items.all():
                type_name = item.resource.resource_type.get_name_display()
                breakdown[type_name]['cost'] += item.total_cost
            
            # Calcular porcentajes
            for type_name in breakdown:
                if total_cost > 0:
                    breakdown[type_name]['percentage'] = (
                        breakdown[type_name]['cost'] / total_cost * 100
                    ).quantize(Decimal('0.01'))
        
        return breakdown


class UnitPriceItem(models.Model):
    """Items/recursos que componen un análisis de precio unitario"""
    analysis = models.ForeignKey(UnitPriceAnalysis, on_delete=models.CASCADE, related_name='items')
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, verbose_name="Recurso")
    quantity = models.DecimalField(max_digits=12, decimal_places=6, verbose_name="Cantidad")
    unit_cost = models.DecimalField(
        max_digits=12, decimal_places=2, 
        verbose_name="Costo Unitario",
        help_text="Se llena automáticamente del recurso, pero puede ser modificado"
    )
    efficiency = models.DecimalField(
        max_digits=5, decimal_places=3, default=1.000,
        verbose_name="Eficiencia",
        help_text="Factor de eficiencia específico para este recurso en este análisis"
    )
    notes = models.TextField(blank=True, verbose_name="Observaciones")
    
    class Meta:
        verbose_name = "Item de Análisis"
        verbose_name_plural = "Items de Análisis"
        unique_together = ['analysis', 'resource']

    def __str__(self):
        return f"{self.resource.name} - {self.quantity} {self.resource.unit}"

    def save(self, *args, **kwargs):
        # Auto-llenar el costo unitario del recurso si no se especifica
        if not self.unit_cost:
            self.unit_cost = self.resource.cost_with_overhead
        super().save(*args, **kwargs)

    @property
    def total_cost(self):
        """Costo total de este item"""
        return self.quantity * self.unit_cost * self.efficiency


class ProjectEstimate(models.Model):
    """Estimación de proyecto usando análisis de precios unitarios"""
    name = models.CharField(max_length=200, verbose_name="Nombre del Proyecto")
    client = models.CharField(max_length=200, verbose_name="Cliente")
    description = models.TextField(verbose_name="Descripción")
    location = models.CharField(max_length=200, blank=True, verbose_name="Ubicación")
    
    # Fechas
    estimate_date = models.DateField(verbose_name="Fecha de Estimación")
    validity_days = models.IntegerField(default=30, verbose_name="Validez (días)")
    
    # Factores generales del proyecto
    site_factor = models.DecimalField(
        max_digits=5, decimal_places=3, default=1.000,
        verbose_name="Factor de Sitio",
        help_text="Factor por condiciones específicas del sitio"
    )
    season_factor = models.DecimalField(
        max_digits=5, decimal_places=3, default=1.000,
        verbose_name="Factor Estacional",
        help_text="Factor por época del año"
    )
    
    # Estado
    STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('pending', 'Pendiente de Aprobación'),
        ('approved', 'Aprobado'),
        ('rejected', 'Rechazado'),
        ('executed', 'Ejecutado'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    class Meta:
        verbose_name = "Estimación de Proyecto"
        verbose_name_plural = "Estimaciones de Proyectos"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.client}"

    @property
    def total_estimate(self):
        """Valor total estimado del proyecto"""
        total = Decimal('0.00')
        for item in self.estimate_items.all():
            total += item.total_amount
        
        # Aplicar factores generales
        total *= self.site_factor * self.season_factor
        return total

    @property
    def validity_end_date(self):
        """Fecha de vencimiento de la estimación"""
        from datetime import timedelta
        return self.estimate_date + timedelta(days=self.validity_days)


class ProjectEstimateItem(models.Model):
    """Items de una estimación de proyecto"""
    estimate = models.ForeignKey(ProjectEstimate, on_delete=models.CASCADE, related_name='estimate_items')
    analysis = models.ForeignKey(UnitPriceAnalysis, on_delete=models.CASCADE, verbose_name="Análisis")
    quantity = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Cantidad")
    unit_price = models.DecimalField(
        max_digits=12, decimal_places=2,
        verbose_name="Precio Unitario",
        help_text="Se toma del análisis, pero puede ser ajustado"
    )
    description = models.TextField(blank=True, verbose_name="Descripción Específica")
    
    class Meta:
        verbose_name = "Item de Estimación"
        verbose_name_plural = "Items de Estimación"

    def save(self, *args, **kwargs):
        # Auto-llenar el precio unitario del análisis si no se especifica
        if not self.unit_price:
            self.unit_price = self.analysis.unit_price
        super().save(*args, **kwargs)

    @property
    def total_amount(self):
        """Monto total de este item"""
        return self.quantity * self.unit_price

    def __str__(self):
        return f"{self.analysis.name} - {self.quantity} {self.analysis.unit}"
