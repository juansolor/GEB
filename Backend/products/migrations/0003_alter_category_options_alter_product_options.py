# Generated by Django 5.2.4 on 2025-07-23 16:00

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0002_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='category',
            options={'ordering': ['name'], 'verbose_name_plural': 'categories'},
        ),
        migrations.AlterModelOptions(
            name='product',
            options={'ordering': ['-created_at', 'name']},
        ),
    ]
