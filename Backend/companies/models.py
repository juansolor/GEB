from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()


class Company(models.Model):
    """Modelo extendido para empresas/clientes corporativos"""
    
    COMPANY_SIZES = [
        ('startup', 'Startup (1-10 empleados)'),
        ('small', 'Pequeña (11-50 empleados)'),
        ('medium', 'Mediana (51-250 empleados)'),
        ('large', 'Grande (251-1000 empleados)'),
        ('enterprise', 'Corporación (1000+ empleados)'),
    ]
    
    INDUSTRY_TYPES = [
        ('construction', 'Construcción'),
        ('infrastructure', 'Infraestructura'),
        ('mining', 'Minería'),
        ('energy', 'Energía'),
        ('telecommunications', 'Telecomunicaciones'),
        ('manufacturing', 'Manufactura'),
        ('real_estate', 'Inmobiliario'),
        ('government', 'Gobierno'),
        ('education', 'Educación'),
        ('healthcare', 'Salud'),
        ('other', 'Otro'),
    ]
    
    RISK_LEVELS = [
        ('low', 'Bajo Riesgo'),
        ('medium', 'Riesgo Medio'),
        ('high', 'Alto Riesgo'),
        ('premium', 'Cliente Premium'),
    ]
    
    # Información básica
    name = models.CharField(max_length=200, verbose_name="Nombre de la Empresa")
    trade_name = models.CharField(max_length=200, blank=True, verbose_name="Nombre Comercial")
    tax_id = models.CharField(max_length=50, unique=True, verbose_name="RUC/NIT")
    industry = models.CharField(max_length=30, choices=INDUSTRY_TYPES, verbose_name="Industria")
    company_size = models.CharField(max_length=20, choices=COMPANY_SIZES, verbose_name="Tamaño")
    
    # Información de contacto
    email = models.EmailField(verbose_name="Email Principal")
    phone = models.CharField(max_length=20, verbose_name="Teléfono")
    website = models.URLField(blank=True, verbose_name="Sitio Web")
    
    # Dirección
    address = models.TextField(verbose_name="Dirección")
    city = models.CharField(max_length=100, verbose_name="Ciudad")
    state = models.CharField(max_length=100, verbose_name="Estado/Región")
    postal_code = models.CharField(max_length=20, verbose_name="Código Postal")
    country = models.CharField(max_length=100, default="Perú", verbose_name="País")
    
    # Información comercial
    credit_limit = models.DecimalField(
        max_digits=15, decimal_places=2, default=Decimal('0.00'),
        verbose_name="Límite de Crédito"
    )
    payment_terms = models.IntegerField(default=30, verbose_name="Términos de Pago (días)")
    risk_level = models.CharField(max_length=20, choices=RISK_LEVELS, default='medium')
    
    # Factores de pricing dinámico
    volume_discount = models.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal('0.00'),
        verbose_name="Descuento por Volumen (%)",
        help_text="Descuento automático por volumen de proyectos"
    )
    loyalty_discount = models.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal('0.00'),
        verbose_name="Descuento por Lealtad (%)"
    )
    risk_premium = models.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal('0.00'),
        verbose_name="Prima de Riesgo (%)",
        help_text="Sobrecosto por nivel de riesgo"
    )
    
    # Preferencias de servicio
    preferred_categories = models.ManyToManyField(
        'pricing_analysis.ServiceCategory',
        blank=True,
        verbose_name="Categorías Preferidas"
    )
    
    # Métricas históricas
    total_projects_value = models.DecimalField(
        max_digits=15, decimal_places=2, default=Decimal('0.00'),
        verbose_name="Valor Total de Proyectos"
    )
    average_project_margin = models.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal('20.00'),
        verbose_name="Margen Promedio Histórico (%)"
    )
    
    # Control
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Empresa"
        verbose_name_plural = "Empresas"
        ordering = ['-total_projects_value', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.tax_id})"
    
    @property
    def effective_discount(self):
        """Calcula el descuento efectivo total"""
        return self.volume_discount + self.loyalty_discount
    
    @property
    def risk_adjusted_margin(self):
        """Margen ajustado por riesgo"""
        base_margin = Decimal('20.00')  # Margen base
        return base_margin + self.risk_premium
    
    def get_dynamic_pricing_factors(self):
        """Retorna factores de pricing dinámico para esta empresa"""
        return {
            'volume_discount': float(self.volume_discount),
            'loyalty_discount': float(self.loyalty_discount),
            'risk_premium': float(self.risk_premium),
            'effective_discount': float(self.effective_discount),
            'risk_adjusted_margin': float(self.risk_adjusted_margin),
            'payment_terms': self.payment_terms,
            'risk_level': self.risk_level,
        }


class CompanyContact(models.Model):
    """Contactos específicos dentro de la empresa"""
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='contacts')
    name = models.CharField(max_length=200, verbose_name="Nombre Completo")
    position = models.CharField(max_length=100, verbose_name="Cargo")
    department = models.CharField(max_length=100, blank=True, verbose_name="Departamento")
    email = models.EmailField(verbose_name="Email")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Teléfono")
    mobile = models.CharField(max_length=20, blank=True, verbose_name="Celular")
    is_primary = models.BooleanField(default=False, verbose_name="Contacto Principal")
    is_billing = models.BooleanField(default=False, verbose_name="Contacto de Facturación")
    is_technical = models.BooleanField(default=False, verbose_name="Contacto Técnico")
    
    class Meta:
        verbose_name = "Contacto de Empresa"
        verbose_name_plural = "Contactos de Empresa"
    
    def __str__(self):
        return f"{self.name} - {self.company.name}"


class CompanyPricingRule(models.Model):
    """Reglas de pricing específicas por empresa"""
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='pricing_rules')
    category = models.ForeignKey(
        'pricing_analysis.ServiceCategory', 
        on_delete=models.CASCADE,
        verbose_name="Categoría"
    )
    
    # Ajustes específicos
    margin_adjustment = models.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal('0.00'),
        verbose_name="Ajuste de Margen (%)",
        help_text="Ajuste específico del margen para esta categoría"
    )
    cost_adjustment = models.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal('0.00'),
        verbose_name="Ajuste de Costo (%)",
        help_text="Ajuste en los costos para esta empresa/categoría"
    )
    
    # Condiciones especiales
    minimum_quantity = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal('0.00'),
        verbose_name="Cantidad Mínima"
    )
    maximum_discount = models.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal('10.00'),
        verbose_name="Descuento Máximo Permitido (%)"
    )
    
    # Vigencia
    valid_from = models.DateField(verbose_name="Válido Desde")
    valid_until = models.DateField(null=True, blank=True, verbose_name="Válido Hasta")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        verbose_name = "Regla de Pricing por Empresa"
        verbose_name_plural = "Reglas de Pricing por Empresa"
        unique_together = ['company', 'category']
    
    def __str__(self):
        return f"{self.company.name} - {self.category.name}"
    
    def is_valid(self):
        """Verifica si la regla está vigente"""
        from django.utils import timezone
        today = timezone.now().date()
        
        if not self.is_active:
            return False
        
        if today < self.valid_from:
            return False
            
        if self.valid_until and today > self.valid_until:
            return False
            
        return True