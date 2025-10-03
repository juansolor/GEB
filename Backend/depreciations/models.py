from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal
from datetime import datetime, date
from dateutil.relativedelta import relativedelta

User = get_user_model()


class AssetCategory(models.Model):
    """Categorías de activos fijos"""
    
    name = models.CharField(max_length=100, verbose_name="Nombre de la Categoría")
    description = models.TextField(blank=True, verbose_name="Descripción")
    default_useful_life = models.IntegerField(
        default=5, 
        verbose_name="Vida Útil por Defecto (años)"
    )
    default_depreciation_method = models.CharField(
        max_length=30,
        default='straight_line',
        verbose_name="Método de Depreciación por Defecto"
    )
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Categoría de Activo"
        verbose_name_plural = "Categorías de Activos"
        ordering = ['name']

    def __str__(self):
        return self.name


class Asset(models.Model):
    """Activos fijos de la empresa"""
    
    DEPRECIATION_METHOD_CHOICES = [
        ('straight_line', 'Línea Recta'),
        ('declining_balance', 'Saldo Decreciente'),
        ('units_of_production', 'Unidades de Producción'),
        ('sum_of_years', 'Suma de Dígitos de los Años'),
    ]

    STATUS_CHOICES = [
        ('active', 'Activo'),
        ('fully_depreciated', 'Totalmente Depreciado'),
        ('disposed', 'Dado de Baja'),
        ('impaired', 'Deteriorado'),
        ('under_maintenance', 'En Mantenimiento'),
    ]

    # Basic Information
    name = models.CharField(max_length=200, verbose_name="Nombre del Activo")
    description = models.TextField(blank=True, verbose_name="Descripción")
    category = models.ForeignKey(
        AssetCategory, 
        on_delete=models.CASCADE, 
        verbose_name="Categoría"
    )
    asset_code = models.CharField(
        max_length=50, 
        unique=True, 
        verbose_name="Código de Activo"
    )
    serial_number = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name="Número de Serie"
    )
    
    # Purchase Information
    purchase_date = models.DateField(verbose_name="Fecha de Compra")
    purchase_cost = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        verbose_name="Costo de Compra"
    )
    supplier = models.CharField(
        max_length=200, 
        blank=True, 
        verbose_name="Proveedor"
    )
    invoice_number = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name="Número de Factura"
    )
    
    # Depreciation Information
    useful_life_years = models.IntegerField(verbose_name="Vida Útil (años)")
    useful_life_months = models.IntegerField(
        default=0, 
        verbose_name="Vida Útil Adicional (meses)"
    )
    salvage_value = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0, 
        verbose_name="Valor Residual/Salvamento"
    )
    depreciation_method = models.CharField(
        max_length=30,
        choices=DEPRECIATION_METHOD_CHOICES,
        default='straight_line',
        verbose_name="Método de Depreciación"
    )
    
    # Current Status
    current_value = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0, 
        verbose_name="Valor Actual"
    )
    accumulated_depreciation = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0, 
        verbose_name="Depreciación Acumulada"
    )
    annual_depreciation = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0, 
        verbose_name="Depreciación Anual"
    )
    monthly_depreciation = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0, 
        verbose_name="Depreciación Mensual"
    )
    
    # Location and Assignment
    location = models.CharField(
        max_length=200, 
        blank=True, 
        verbose_name="Ubicación"
    )
    department = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name="Departamento Asignado"
    )
    responsible_person = models.CharField(
        max_length=200, 
        blank=True, 
        verbose_name="Persona Responsable"
    )
    
    # Maintenance
    last_maintenance = models.DateField(
        null=True, 
        blank=True, 
        verbose_name="Última Mantenimiento"
    )
    next_maintenance = models.DateField(
        null=True, 
        blank=True, 
        verbose_name="Próximo Mantenimiento"
    )
    maintenance_cost_accumulated = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0, 
        verbose_name="Costo de Mantenimiento Acumulado"
    )
    
    # Status and Control
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='active', 
        verbose_name="Estado"
    )
    disposal_date = models.DateField(
        null=True, 
        blank=True, 
        verbose_name="Fecha de Baja"
    )
    disposal_value = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0, 
        verbose_name="Valor de Disposición"
    )
    
    # Additional Information
    warranty_expiry = models.DateField(
        null=True, 
        blank=True, 
        verbose_name="Vencimiento de Garantía"
    )
    insurance_policy = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name="Póliza de Seguro"
    )
    notes = models.TextField(blank=True, verbose_name="Notas")
    
    # Metadata
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        verbose_name="Creado por"
    )

    class Meta:
        verbose_name = "Activo Fijo"
        verbose_name_plural = "Activos Fijos"
        ordering = ['-purchase_date', 'name']
        indexes = [
            models.Index(fields=['asset_code']),
            models.Index(fields=['status']),
            models.Index(fields=['category']),
            models.Index(fields=['purchase_date']),
        ]

    def __str__(self):
        return f"{self.asset_code} - {self.name}"

    @property
    def total_useful_life_months(self):
        """Vida útil total en meses"""
        return (self.useful_life_years * 12) + self.useful_life_months

    @property
    def depreciable_amount(self):
        """Monto depreciable (costo - valor residual)"""
        return self.purchase_cost - self.salvage_value

    @property
    def remaining_useful_life_months(self):
        """Meses restantes de vida útil"""
        if self.status == 'fully_depreciated':
            return 0
        
        months_elapsed = self.months_since_purchase
        total_months = self.total_useful_life_months
        
        return max(0, total_months - months_elapsed)

    @property
    def months_since_purchase(self):
        """Meses transcurridos desde la compra"""
        today = date.today()
        months = (today.year - self.purchase_date.year) * 12 + (today.month - self.purchase_date.month)
        return max(0, months)

    @property
    def depreciation_percentage(self):
        """Porcentaje de depreciación acumulada"""
        if self.purchase_cost > 0:
            return (self.accumulated_depreciation / self.purchase_cost) * 100
        return 0

    @property
    def is_fully_depreciated(self):
        """Determina si el activo está totalmente depreciado"""
        return self.current_value <= self.salvage_value or self.remaining_useful_life_months <= 0

    def calculate_depreciation(self):
        """Calcula la depreciación basada en el método seleccionado"""
        if self.depreciation_method == 'straight_line':
            return self._calculate_straight_line_depreciation()
        elif self.depreciation_method == 'declining_balance':
            return self._calculate_declining_balance_depreciation()
        elif self.depreciation_method == 'sum_of_years':
            return self._calculate_sum_of_years_depreciation()
        else:
            return self._calculate_straight_line_depreciation()

    def _calculate_straight_line_depreciation(self):
        """Método de línea recta"""
        if self.total_useful_life_months == 0:
            return {'monthly': 0, 'annual': 0}
        
        monthly_depreciation = self.depreciable_amount / self.total_useful_life_months
        annual_depreciation = monthly_depreciation * 12
        
        return {
            'monthly': monthly_depreciation,
            'annual': annual_depreciation
        }

    def _calculate_declining_balance_depreciation(self):
        """Método de saldo decreciente"""
        # Typically uses double declining balance (2/useful_life)
        annual_rate = 2 / self.useful_life_years if self.useful_life_years > 0 else 0
        monthly_rate = annual_rate / 12
        
        current_book_value = max(self.current_value, self.salvage_value)
        monthly_depreciation = current_book_value * monthly_rate
        annual_depreciation = current_book_value * annual_rate
        
        # Don't depreciate below salvage value
        max_monthly = max(0, current_book_value - self.salvage_value)
        max_annual = max_monthly * 12
        
        return {
            'monthly': min(monthly_depreciation, max_monthly),
            'annual': min(annual_depreciation, max_annual)
        }

    def _calculate_sum_of_years_depreciation(self):
        """Método de suma de dígitos de los años"""
        sum_of_years = sum(range(1, self.useful_life_years + 1))
        
        if sum_of_years == 0:
            return {'monthly': 0, 'annual': 0}
        
        current_year = min(
            self.months_since_purchase // 12 + 1, 
            self.useful_life_years
        )
        remaining_years = max(0, self.useful_life_years - current_year + 1)
        
        annual_depreciation = (self.depreciable_amount * remaining_years) / sum_of_years
        monthly_depreciation = annual_depreciation / 12
        
        return {
            'monthly': monthly_depreciation,
            'annual': annual_depreciation
        }

    def update_depreciation_values(self):
        """Actualiza los valores de depreciación calculados"""
        depreciation = self.calculate_depreciation()
        
        self.monthly_depreciation = depreciation['monthly']
        self.annual_depreciation = depreciation['annual']
        
        # Calculate accumulated depreciation
        months_elapsed = self.months_since_purchase
        
        if self.depreciation_method == 'straight_line':
            self.accumulated_depreciation = min(
                self.monthly_depreciation * months_elapsed,
                self.depreciable_amount
            )
        elif self.depreciation_method == 'declining_balance':
            # More complex calculation for declining balance
            accumulated = 0
            current_value = self.purchase_cost
            
            for month in range(months_elapsed):
                if current_value <= self.salvage_value:
                    break
                
                annual_rate = 2 / self.useful_life_years if self.useful_life_years > 0 else 0
                monthly_rate = annual_rate / 12
                monthly_dep = current_value * monthly_rate
                monthly_dep = min(monthly_dep, current_value - self.salvage_value)
                
                accumulated += monthly_dep
                current_value -= monthly_dep
            
            self.accumulated_depreciation = accumulated
        else:
            # For sum of years and other methods
            self.accumulated_depreciation = min(
                self.monthly_depreciation * months_elapsed,
                self.depreciable_amount
            )
        
        # Update current value
        self.current_value = max(
            self.purchase_cost - self.accumulated_depreciation,
            self.salvage_value
        )
        
        # Update status
        if self.is_fully_depreciated and self.status == 'active':
            self.status = 'fully_depreciated'

    def save(self, *args, **kwargs):
        """Override save to calculate depreciation"""
        self.update_depreciation_values()
        super().save(*args, **kwargs)

    def generate_depreciation_schedule(self):
        """Genera el cronograma completo de depreciación"""
        schedule = []
        
        if self.depreciation_method == 'straight_line':
            return self._generate_straight_line_schedule()
        elif self.depreciation_method == 'declining_balance':
            return self._generate_declining_balance_schedule()
        elif self.depreciation_method == 'sum_of_years':
            return self._generate_sum_of_years_schedule()
        else:
            return self._generate_straight_line_schedule()

    def _generate_straight_line_schedule(self):
        """Cronograma para método de línea recta"""
        schedule = []
        annual_depreciation = self.depreciable_amount / self.useful_life_years if self.useful_life_years > 0 else 0
        
        opening_value = self.purchase_cost
        accumulated_depreciation = 0
        
        for year in range(1, self.useful_life_years + 1):
            depreciation_expense = min(annual_depreciation, opening_value - self.salvage_value)
            accumulated_depreciation += depreciation_expense
            closing_value = max(opening_value - depreciation_expense, self.salvage_value)
            
            schedule.append({
                'year': year,
                'opening_value': opening_value,
                'depreciation_expense': depreciation_expense,
                'accumulated_depreciation': accumulated_depreciation,
                'closing_value': closing_value
            })
            
            opening_value = closing_value
            
            if closing_value <= self.salvage_value:
                break
        
        return schedule

    def _generate_declining_balance_schedule(self):
        """Cronograma para método de saldo decreciente"""
        schedule = []
        annual_rate = 2 / self.useful_life_years if self.useful_life_years > 0 else 0
        
        opening_value = self.purchase_cost
        accumulated_depreciation = 0
        
        for year in range(1, self.useful_life_years + 1):
            depreciation_expense = opening_value * annual_rate
            depreciation_expense = min(depreciation_expense, opening_value - self.salvage_value)
            
            accumulated_depreciation += depreciation_expense
            closing_value = max(opening_value - depreciation_expense, self.salvage_value)
            
            schedule.append({
                'year': year,
                'opening_value': opening_value,
                'depreciation_expense': depreciation_expense,
                'accumulated_depreciation': accumulated_depreciation,
                'closing_value': closing_value
            })
            
            opening_value = closing_value
            
            if closing_value <= self.salvage_value:
                break
        
        return schedule

    def _generate_sum_of_years_schedule(self):
        """Cronograma para método de suma de dígitos"""
        schedule = []
        sum_of_years = sum(range(1, self.useful_life_years + 1))
        
        opening_value = self.purchase_cost
        accumulated_depreciation = 0
        
        for year in range(1, self.useful_life_years + 1):
            remaining_years = self.useful_life_years - year + 1
            depreciation_expense = (self.depreciable_amount * remaining_years) / sum_of_years
            
            accumulated_depreciation += depreciation_expense
            closing_value = max(opening_value - depreciation_expense, self.salvage_value)
            
            schedule.append({
                'year': year,
                'opening_value': opening_value,
                'depreciation_expense': depreciation_expense,
                'accumulated_depreciation': accumulated_depreciation,
                'closing_value': closing_value
            })
            
            opening_value = closing_value
        
        return schedule


class DepreciationEntry(models.Model):
    """Entradas mensuales de depreciación"""
    
    asset = models.ForeignKey(
        Asset, 
        on_delete=models.CASCADE, 
        related_name='depreciation_entries',
        verbose_name="Activo"
    )
    period_year = models.IntegerField(verbose_name="Año del Período")
    period_month = models.IntegerField(verbose_name="Mes del Período")
    depreciation_amount = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        verbose_name="Monto de Depreciación"
    )
    accumulated_depreciation = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        verbose_name="Depreciación Acumulada"
    )
    book_value = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        verbose_name="Valor en Libros"
    )
    notes = models.TextField(blank=True, verbose_name="Notas")
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        verbose_name="Creado por"
    )

    class Meta:
        verbose_name = "Entrada de Depreciación"
        verbose_name_plural = "Entradas de Depreciación"
        ordering = ['-period_year', '-period_month']
        unique_together = ['asset', 'period_year', 'period_month']

    def __str__(self):
        return f"{self.asset.name} - {self.period_year}/{self.period_month:02d}"


class MaintenanceRecord(models.Model):
    """Registro de mantenimientos de activos"""
    
    MAINTENANCE_TYPE_CHOICES = [
        ('preventive', 'Preventivo'),
        ('corrective', 'Correctivo'),
        ('emergency', 'Emergencia'),
        ('inspection', 'Inspección'),
    ]

    asset = models.ForeignKey(
        Asset, 
        on_delete=models.CASCADE, 
        related_name='maintenance_records',
        verbose_name="Activo"
    )
    maintenance_type = models.CharField(
        max_length=20, 
        choices=MAINTENANCE_TYPE_CHOICES, 
        verbose_name="Tipo de Mantenimiento"
    )
    description = models.TextField(verbose_name="Descripción")
    maintenance_date = models.DateField(verbose_name="Fecha de Mantenimiento")
    cost = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0, 
        verbose_name="Costo"
    )
    supplier = models.CharField(
        max_length=200, 
        blank=True, 
        verbose_name="Proveedor"
    )
    technician = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name="Técnico"
    )
    next_maintenance_date = models.DateField(
        null=True, 
        blank=True, 
        verbose_name="Próximo Mantenimiento"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        verbose_name="Creado por"
    )

    class Meta:
        verbose_name = "Registro de Mantenimiento"
        verbose_name_plural = "Registros de Mantenimiento"
        ordering = ['-maintenance_date']

    def __str__(self):
        return f"{self.asset.name} - {self.maintenance_type} - {self.maintenance_date}"