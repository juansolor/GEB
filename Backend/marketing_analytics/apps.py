from django.apps import AppConfig


class MarketingAnalyticsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'marketing_analytics'
    verbose_name = 'Marketing Analytics'

    def ready(self):
        # Import signals here if needed
        pass