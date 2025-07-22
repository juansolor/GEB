from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Report(models.Model):
    """
    Generated reports model
    """
    REPORT_TYPES = [
        ('sales', 'Reporte de Ventas'),
        ('products', 'Reporte de Productos'),
        ('customers', 'Reporte de Clientes'),
        ('finances', 'Reporte Financiero'),
        ('inventory', 'Reporte de Inventario'),
    ]
    
    name = models.CharField(max_length=200)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    description = models.TextField(blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    filters = models.JSONField(default=dict, blank=True)
    file_path = models.FileField(upload_to='reports/', blank=True, null=True)
    is_scheduled = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'reports'
        ordering = ['-created_at']
