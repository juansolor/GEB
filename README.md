# GEB - Sistema de Gestión Empresarial

Una plataforma completa para la gestión de microempresas que incluye control de productos, ventas, clientes, finanzas y reportes.

## 🚀 Características

- **Gestión de Productos/Servicios**: Control de inventario, precios y categorías
- **Control Financiero**: Registro de ingresos y egresos con categorización
- **Gestión de Ventas**: Registro de ventas y seguimiento de pagos
- **Base de Clientes**: Administración de información de clientes
- **Reportes**: Generación de reportes básicos de ventas, inventario y finanzas
- **Control de Usuarios**: Sistema de roles y permisos (admin, gerente, empleado)

## 🛠️ Tecnologías

### Backend
- **Django 5.2.4**: Framework web de Python
- **Django REST Framework**: API REST
- **PostgreSQL/SQLite**: Base de datos
- **Django CORS Headers**: Manejo de CORS para el frontend

### Frontend
- **React 18**: Biblioteca de JavaScript para interfaces de usuario
- **TypeScript**: Tipado estático para JavaScript
- **TailwindCSS**: Framework de CSS utilitario
- **React Router**: Enrutamiento en React
- **Axios**: Cliente HTTP para consumir la API

## 📁 Estructura del Proyecto

```
GEB/
├── Backend/                 # API Django REST Framework
│   ├── geb_backend/        # Configuración principal
│   ├── users/              # Gestión de usuarios y autenticación
│   ├── products/           # Gestión de productos y categorías
│   ├── customers/          # Gestión de clientes
│   ├── sales/              # Gestión de ventas
│   ├── finances/           # Gestión financiera
│   ├── reports/            # Generación de reportes
│   ├── requirements.txt    # Dependencias de Python
│   └── manage.py           # Script de gestión de Django
├── Frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── contexts/       # Contextos de React (Auth, etc.)
│   │   ├── pages/          # Páginas principales
│   │   └── App.tsx         # Componente principal
│   ├── public/             # Archivos estáticos
│   ├── package.json        # Dependencias de Node.js
│   └── tailwind.config.js  # Configuración de TailwindCSS
└── README.md              # Este archivo
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Python 3.8+
- Node.js 16+
- PostgreSQL (opcional, se puede usar SQLite para desarrollo)

### Backend (Django)

1. **Navegar al directorio del backend**:
   ```bash
   cd Backend
   ```

2. **Crear y activar entorno virtual**:
   ```bash
   python -m venv venv
   # En Windows:
   venv\Scripts\activate
   # En macOS/Linux:
   source venv/bin/activate
   ```

3. **Instalar dependencias**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurar variables de entorno**:
   - Copiar `.env.example` a `.env`
   - Configurar las variables según tu entorno

5. **Ejecutar migraciones**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Crear superusuario**:
   ```bash
   python manage.py createsuperuser
   ```

7. **Iniciar servidor de desarrollo**:
   ```bash
   python manage.py runserver
   ```

   El backend estará disponible en `http://localhost:8000`

### Frontend (React)

1. **Navegar al directorio del frontend**:
   ```bash
   cd Frontend
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo**:
   ```bash
   npm start
   ```

   El frontend estará disponible en `http://localhost:3000`

## 📊 Uso del Sistema

### Roles de Usuario

- **Administrador**: Acceso completo a todas las funcionalidades
- **Gerente**: Acceso a reportes y gestión operativa
- **Empleado**: Acceso básico para operaciones diarias

### Funcionalidades Principales

1. **Dashboard**: Vista general con métricas importantes
2. **Productos**: Gestión de inventario y catálogo
3. **Clientes**: Base de datos de clientes
4. **Ventas**: Registro y seguimiento de ventas
5. **Finanzas**: Control de ingresos y gastos
6. **Reportes**: Análisis y reportes del negocio
7. **Usuarios**: Gestión de usuarios del sistema (solo admin)

## 🔧 Configuración Avanzada

### Base de Datos PostgreSQL

Para usar PostgreSQL en lugar de SQLite:

1. Instalar PostgreSQL
2. Crear base de datos
3. Configurar variables en `.env`:
   ```
   DB_NAME=geb_database
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_HOST=localhost
   DB_PORT=5432
   ```

### Despliegue en Producción

1. **Backend**:
   - Configurar `DEBUG=False`
   - Usar PostgreSQL
   - Configurar servidor web (nginx + gunicorn)
   - Configurar archivos estáticos

2. **Frontend**:
   - Ejecutar `npm run build`
   - Servir archivos estáticos
   - Configurar dominio y SSL

## 🤝 Contribuciones

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo

---

**GEB - Gestión Empresarial** - Simplificando la administración de tu negocio
