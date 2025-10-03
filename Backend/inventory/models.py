from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()


class InventoryCategory(models.Model):
    """Categorías para la gestión de inventario"""
    
    name = models.CharField(max_length=100, verbose_name="Nombre de la Categoría")
    description = models.TextField(blank=True, verbose_name="Descripción")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Categoría de Inventario"
        verbose_name_plural = "Categorías de Inventario"
        ordering = ['name']

    def __str__(self):
        return self.name


class Supplier(models.Model):
    """Proveedores de inventario"""
    
    name = models.CharField(max_length=200, verbose_name="Nombre del Proveedor")
    contact_person = models.CharField(max_length=100, blank=True, verbose_name="Persona de Contacto")
    email = models.EmailField(blank=True, verbose_name="Email")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Teléfono")
    address = models.TextField(blank=True, verbose_name="Dirección")
    tax_id = models.CharField(max_length=20, blank=True, verbose_name="RUC/DNI")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Proveedor"
        verbose_name_plural = "Proveedores"
        ordering = ['name']

    def __str__(self):
        return self.name


class InventoryLocation(models.Model):
    """Ubicaciones físicas del inventario"""
    
    name = models.CharField(max_length=100, verbose_name="Nombre de la Ubicación")
    description = models.TextField(blank=True, verbose_name="Descripción")
    address = models.TextField(blank=True, verbose_name="Dirección Física")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Ubicación de Inventario"
        verbose_name_plural = "Ubicaciones de Inventario"
        ordering = ['name']

    def __str__(self):
        return self.name


class InventoryItem(models.Model):
    """Artículos del inventario"""
    
    STATUS_CHOICES = [
        ('in_stock', 'En Stock'),
        ('low_stock', 'Stock Bajo'),
        ('out_of_stock', 'Sin Stock'),
        ('overstock', 'Sobre Stock'),
    ]

    name = models.CharField(max_length=200, verbose_name="Nombre del Artículo")
    description = models.TextField(blank=True, verbose_name="Descripción")
    category = models.ForeignKey(
        InventoryCategory, 
        on_delete=models.CASCADE, 
        verbose_name="Categoría"
    )
    sku = models.CharField(
        max_length=50, 
        unique=True, 
        verbose_name="Código SKU"
    )
    barcode = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name="Código de Barras"
    )
    
    # Stock levels
    current_stock = models.DecimalField(
        max_digits=15, 
        decimal_places=3, 
        default=0, 
        verbose_name="Stock Actual"
    )
    min_stock = models.DecimalField(
        max_digits=15, 
        decimal_places=3, 
        default=0, 
        verbose_name="Stock Mínimo"
    )
    max_stock = models.DecimalField(
        max_digits=15, 
        decimal_places=3, 
        default=0, 
        verbose_name="Stock Máximo"
    )
    
    # Costing
    unit_cost = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0, 
        verbose_name="Costo Unitario"
    )
    average_cost = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0, 
        verbose_name="Costo Promedio"
    )
    last_cost = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0, 
        verbose_name="Último Costo"
    )
    
    # Supplier and location
    primary_supplier = models.ForeignKey(
        Supplier, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        verbose_name="Proveedor Principal"
    )
    primary_location = models.ForeignKey(
        InventoryLocation, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        verbose_name="Ubicación Principal"
    )
    
    # Units
    unit_measure = models.CharField(
        max_length=20, 
        default="UND", 
        verbose_name="Unidad de Medida"
    )
    
    # Status and tracking
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='in_stock', 
        verbose_name="Estado"
    )
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        verbose_name="Creado por"
    )

    class Meta:
        verbose_name = "Artículo de Inventario"
        verbose_name_plural = "Artículos de Inventario"
        ordering = ['name']
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['status']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return f"{self.sku} - {self.name}"

    @property
    def total_value(self):
        """Valor total del inventario (cantidad * costo unitario)"""
        return self.current_stock * self.unit_cost

    @property
    def stock_status(self):
        """Determina el estado del stock automáticamente"""
        if self.current_stock <= 0:
            return 'out_of_stock'
        elif self.current_stock <= self.min_stock:
            return 'low_stock'
        elif self.current_stock > self.max_stock:
            return 'overstock'
        else:
            return 'in_stock'

    def update_stock_status(self):
        """Actualiza el estado del stock basado en niveles actuales"""
        self.status = self.stock_status
        self.save(update_fields=['status'])

    def calculate_average_cost(self):
        """Calcula el costo promedio basado en movimientos"""
        from django.db.models import Sum, F
        
        movements = self.inventory_movements.filter(
            movement_type__in=['entry', 'adjustment']
        ).aggregate(
            total_cost=Sum(F('quantity') * F('unit_cost')),
            total_quantity=Sum('quantity')
        )
        
        if movements['total_quantity'] and movements['total_quantity'] > 0:
            self.average_cost = movements['total_cost'] / movements['total_quantity']
        else:
            self.average_cost = self.unit_cost
        
        self.save(update_fields=['average_cost'])


class InventoryMovement(models.Model):
    """Movimientos de inventario (entradas, salidas, ajustes)"""
    
    MOVEMENT_TYPE_CHOICES = [
        ('entry', 'Entrada'),
        ('exit', 'Salida'), 
        ('adjustment', 'Ajuste'),
        ('transfer', 'Transferencia'),
    ]

    item = models.ForeignKey(
        InventoryItem, 
        on_delete=models.CASCADE, 
        related_name='inventory_movements',
        verbose_name="Artículo"
    )
    movement_type = models.CharField(
        max_length=20, 
        choices=MOVEMENT_TYPE_CHOICES, 
        verbose_name="Tipo de Movimiento"
    )
    
    # Quantity and costing
    quantity = models.DecimalField(
        max_digits=15, 
        decimal_places=3, 
        verbose_name="Cantidad"
    )
    unit_cost = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0, 
        verbose_name="Costo Unitario"
    )
    
    # Location and reference
    location = models.ForeignKey(
        InventoryLocation, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        verbose_name="Ubicación"
    )
    reference = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name="Referencia"
    )
    
    # Transaction details
    transaction_date = models.DateTimeField(verbose_name="Fecha de Transacción")
    notes = models.TextField(blank=True, verbose_name="Notas")
    
    # User tracking
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        verbose_name="Usuario"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Movimiento de Inventario"
        verbose_name_plural = "Movimientos de Inventario"
        ordering = ['-transaction_date', '-created_at']
        indexes = [
            models.Index(fields=['item', 'movement_type']),
            models.Index(fields=['transaction_date']),
            models.Index(fields=['movement_type']),
        ]

    def __str__(self):
        return f"{self.movement_type} - {self.item.name} - {self.quantity}"

    @property
    def total_cost(self):
        """Costo total del movimiento"""
        return abs(self.quantity) * self.unit_cost

    def save(self, *args, **kwargs):
        """Override save to update item stock"""
        # Get previous quantity if updating
        previous_quantity = 0
        if self.pk:
            try:
                old_movement = InventoryMovement.objects.get(pk=self.pk)
                previous_quantity = old_movement.quantity
            except InventoryMovement.DoesNotExist:
                pass

        super().save(*args, **kwargs)
        
        # Update item stock
        self.update_item_stock(previous_quantity)

    def update_item_stock(self, previous_quantity=0):
        """Actualiza el stock del artículo basado en el movimiento"""
        item = self.item
        
        # Revert previous quantity if updating
        if previous_quantity:
            if self.movement_type in ['entry', 'adjustment']:
                item.current_stock -= previous_quantity
            elif self.movement_type == 'exit':
                item.current_stock += abs(previous_quantity)

        # Apply new quantity
        if self.movement_type in ['entry', 'adjustment']:
            if self.movement_type == 'adjustment':
                # For adjustments, quantity can be positive or negative
                item.current_stock += self.quantity
            else:
                # For entries, quantity is always added
                item.current_stock += abs(self.quantity)
        elif self.movement_type == 'exit':
            # For exits, quantity is always subtracted
            item.current_stock -= abs(self.quantity)

        # Ensure stock doesn't go below zero
        item.current_stock = max(item.current_stock, 0)
        
        # Update last cost for entries
        if self.movement_type == 'entry' and self.unit_cost > 0:
            item.last_cost = self.unit_cost
            item.unit_cost = self.unit_cost

        item.save(update_fields=['current_stock', 'last_cost', 'unit_cost'])
        
        # Update stock status
        item.update_stock_status()
        
        # Recalculate average cost
        item.calculate_average_cost()


class StockAlert(models.Model):
    """Alertas automáticas de inventario"""
    
    ALERT_TYPE_CHOICES = [
        ('low_stock', 'Stock Bajo'),
        ('out_of_stock', 'Sin Stock'),
        ('overstock', 'Sobre Stock'),
        ('expiring', 'Próximo a Vencer'),
    ]

    item = models.ForeignKey(
        InventoryItem, 
        on_delete=models.CASCADE, 
        verbose_name="Artículo"
    )
    alert_type = models.CharField(
        max_length=20, 
        choices=ALERT_TYPE_CHOICES, 
        verbose_name="Tipo de Alerta"
    )
    message = models.TextField(verbose_name="Mensaje")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    acknowledged = models.BooleanField(default=False, verbose_name="Reconocido")
    acknowledged_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        verbose_name="Reconocido por"
    )
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Alerta de Stock"
        verbose_name_plural = "Alertas de Stock"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.alert_type} - {self.item.name}"