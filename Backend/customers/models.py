from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Customer(models.Model):
    """
    Customer management model
    """
    CUSTOMER_TYPES = [
        ('individual', 'Persona Natural'),
        ('business', 'Empresa'),
    ]
    
    name = models.CharField(max_length=200)
    customer_type = models.CharField(max_length=20, choices=CUSTOMER_TYPES, default='individual')
    document_number = models.CharField(max_length=50, unique=True, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    @property
    def total_purchases(self):
        from sales.models import Sale
        return Sale.objects.filter(customer=self).aggregate(
            total=models.Sum('total_amount')
        )['total'] or 0
    
    class Meta:
        db_table = 'customers'
