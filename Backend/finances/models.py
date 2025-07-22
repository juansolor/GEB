from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ExpenseCategory(models.Model):
    """
    Categories for expenses
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'expense_categories'
        verbose_name_plural = 'expense categories'


class Transaction(models.Model):
    """
    Financial transactions (income and expenses)
    """
    TRANSACTION_TYPES = [
        ('income', 'Ingreso'),
        ('expense', 'Egreso'),
    ]
    
    PAYMENT_METHODS = [
        ('cash', 'Efectivo'),
        ('card', 'Tarjeta'),
        ('transfer', 'Transferencia'),
        ('check', 'Cheque'),
    ]
    
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    description = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='cash')
    category = models.ForeignKey(ExpenseCategory, on_delete=models.SET_NULL, null=True, blank=True)
    transaction_date = models.DateField()
    receipt_number = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    attachment = models.FileField(upload_to='receipts/', blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.get_transaction_type_display()}: {self.description} - ${self.amount}"
    
    class Meta:
        db_table = 'transactions'
        ordering = ['-transaction_date', '-created_at']


class Budget(models.Model):
    """
    Monthly budgets for expense categories
    """
    category = models.ForeignKey(ExpenseCategory, on_delete=models.CASCADE)
    year = models.IntegerField()
    month = models.IntegerField()
    budgeted_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.category.name} - {self.year}/{self.month:02d}"
    
    @property
    def spent_amount(self):
        return Transaction.objects.filter(
            category=self.category,
            transaction_type='expense',
            transaction_date__year=self.year,
            transaction_date__month=self.month
        ).aggregate(total=models.Sum('amount'))['total'] or 0
    
    @property
    def remaining_amount(self):
        return self.budgeted_amount - self.spent_amount
    
    class Meta:
        db_table = 'budgets'
        unique_together = ['category', 'year', 'month']
