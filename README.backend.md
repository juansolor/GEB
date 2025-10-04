## Backend (Django REST API)

### Requisitos
- Python 3.11+
- pip

### Instalación Rápida
```bash
cd Backend
python -m venv venv
venv\\Scripts\\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
cp .env.example .env 2>NUL || copy .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

API en: http://localhost:8000

### Endpoints Principales
- `POST /api/users/login/`  (token + sesión)
- `GET  /api/users/profile/`
- `GET  /api/products/`
- `GET  /api/customers/`
- `GET  /api/sales/`
- `GET  /api/reports/...`

### Autenticación
Token simple (DRF TokenAuthentication). Enviar:
```
Authorization: Token <token>
```

### CORS
Configurado para `http://localhost:3000` y `http://localhost:3001`. Ajustar en `geb_backend/settings.py` (sección CORS) para despliegue.

### Estructura Clave
```
Backend/
  geb_backend/      # settings, urls
  users/            # auth y perfiles
  products/         # catálogo
  customers/        # CRM
  sales/            # ventas
  finances/         # transacciones y presupuestos
  pricing_analysis/ # matrices de costos
  marketing_analytics/ # integraciones externas
  reports/          # endpoints de reportes
```

### Tests
```bash
pytest -q
```

### Variables .env (ejemplo)
```
DEBUG=True
SECRET_KEY=dev-secret
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Próximas Mejoras Sugeridas
- SimpleJWT (refresh tokens)
- drf-spectacular (OpenAPI)
- Rate limiting dinámico
