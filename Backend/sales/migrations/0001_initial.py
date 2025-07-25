# Generated by Django 5.2.4 on 2025-07-22 21:56

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Sale',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sale_number', models.CharField(max_length=50, unique=True)),
                ('sale_date', models.DateTimeField(auto_now_add=True)),
                ('payment_method', models.CharField(choices=[('cash', 'Efectivo'), ('card', 'Tarjeta'), ('transfer', 'Transferencia'), ('credit', 'Crédito')], default='cash', max_length=20)),
                ('status', models.CharField(choices=[('pending', 'Pendiente'), ('completed', 'Completada'), ('cancelled', 'Cancelada')], default='pending', max_length=20)),
                ('subtotal', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('tax_amount', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('discount_amount', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('total_amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'sales',
            },
        ),
        migrations.CreateModel(
            name='SaleItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.IntegerField()),
                ('unit_price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('total_price', models.DecimalField(decimal_places=2, max_digits=10)),
            ],
            options={
                'db_table': 'sale_items',
            },
        ),
    ]
