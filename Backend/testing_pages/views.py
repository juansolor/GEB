from django.shortcuts import render


def index(request):
    """Página principal con enlaces a todas las páginas de testing"""
    return render(request, 'testing_pages/index.html')


def test_register(request):
    """Página para probar el registro de usuarios"""
    return render(request, 'testing_pages/test_register.html')


def test_login(request):
    """Página para probar el login de usuarios"""
    return render(request, 'testing_pages/test_login.html')


def test_api(request):
    """Página para probar endpoints de la API"""
    return render(request, 'testing_pages/test_api.html')


def test_pricing(request):
    """Página para probar el análisis de precios unitarios"""
    return render(request, 'testing_pages/test_pricing.html')
