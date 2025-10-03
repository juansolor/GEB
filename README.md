# 🏢 GEB - Sistema de Gestión Empresarial Integral# 🏢 GEB - Sistema de Gestión Empresarial Integral



![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)

![Django](https://img.shields.io/badge/Django-5.2.4-green.svg)![Django](https://img.shields.io/badge/Django-5.2.4-green.svg)

![React](https://img.shields.io/badge/React-19.0.0-blue.svg)![React](https://img.shields.io/badge/React-19.0.0-blue.svg)

![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)

![Python](https://img.shields.io/badge/Python-3.11+-green.svg)![Python](https://img.shields.io/badge/Python-3.11+-green.svg)



## 📋 Descripción## 📋 Descripción



GEB es un sistema integral de gestión empresarial que incluye módulos de CRM, ERP, análisis de precios, business intelligence, **marketing analytics** y gestión financiera. Diseñado para empresas de construcción y servicios, pero adaptable a cualquier sector empresarial.GEB es un sistema integral de gestión empresarial que incluye módulos de CRM, ERP, análisis de precios, business intelligence, **marketing analytics** y gestión financiera. Diseñado para empresas de construcción y servicios, pero adaptable a cualquier sector empresarial.



## ✨ Características Principales## � **CARACTERÍSTICAS PRINCIPALES**



### 🎯 **Módulos del Sistema**### 🎯 **Core Features**

- ✅ **Dynamic Pricing Matrix** - Matriz de costos inteligente y automática  

#### **📊 Core Business**- ✅ **Business Intelligence** - Dashboards interactivos con KPIs en tiempo real

- **Dashboard Principal**: KPIs en tiempo real, gráficos interactivos y métricas clave- ✅ **Machine Learning** - Modelos predictivos y análisis de tendencias

- **Gestión de Productos**: Catálogo completo con categorías y control de stock- ✅ **Smart Insights** - Recomendaciones automáticas basadas en IA

- **Inventario Avanzado**: Control de stock, movimientos automáticos y alertas- ✅ **Advanced Analytics** - Análisis profundo de rentabilidad y competencia

- **Clientes (CRM)**: Gestión completa de clientes y seguimiento de ventas- ✅ **Real-time Monitoring** - Monitoreo continuo de métricas críticas

- **Ventas**: Sistema completo de facturación y gestión de pedidos

- **Finanzas**: Contabilidad, presupuestos y análisis financiero### 💼 **Business Modules**

- 🏢 **Gestión de Empresas** - CRM avanzado con scoring dinámico

#### **🧠 Business Intelligence & Analytics**- 💰 **Análisis Financiero** - Control de márgenes y rentabilidad

- **BI Dashboard**: Análisis predictivo con machine learning- 📈 **Reportes Inteligentes** - Informes automatizados con insights

- **Análisis de Precios**: Matrices de costos dinámicas por empresa- 🎯 **Pricing Intelligence** - Motor de recomendaciones de precios

- **Pricing Inteligente**: Optimización automática de precios- 📊 **Competitive Analysis** - Análisis de competencia en tiempo real

- **Marketing Analytics**: Integración con Google Ads e Instagram ⭐ **NUEVO**

- **Advanced Analytics**: Tendencias, forecasting y recomendaciones## ⚙️ **INSTALACIÓN Y CONFIGURACIÓN**



#### **💰 Gestión Financiera Avanzada**### **🔧 Backend Setup**

- **Depreciaciones**: Múltiples métodos de cálculo automático

- **Análisis de Recursos**: Control de materiales y mano de obra```bash

- **Reportes Financieros**: Informes detallados y exportación# 1. Clonar repositorio

git clone https://github.com/juansolor/GEB.git

### 🎨 **Características de Diseño**cd GEB/Backend



#### **Paleta de Colores Mejorada** ⭐ **NUEVO**# 2. Crear entorno virtual

- **Colores Primarios**: Azul profesional (#2563eb a #172554)python -m venv venv

- **Colores Secundarios**: Verde esmeralda (#10b981 a #022c22) venv\Scripts\activate  # Windows

- **Colores de Acento**: Ámbar (#f59e0b a #451a03)

- **Colores de Error**: Rojo (#ef4444 a #450a0a)# 3. Instalar dependencias

- **Neutros**: Grises mejorados para mejor contrastepip install -r requirements.txt



#### **Mejoras de Accesibilidad**# 4. Configurar variables de entorno

- ✅ **Contraste WCAG AA/AAA**: Todos los textos cumplen estándarescopy .env.example .env

- ✅ **Variables CSS**: Sistema consistente de colores y espaciado

- ✅ **Efectos Modernos**: Glass morphism, gradientes y sombras# 5. Configurar base de datos

- ✅ **Transiciones Suaves**: Animaciones optimizadaspython manage.py makemigrations

python manage.py migrate

## 🚀 Instalación y Configuración

# 6. Crear superusuario

### **Prerrequisitos**python manage.py createsuperuser



```bash# 7. Ejecutar servidor

# Backend Requirementspython manage.py runserver

- Python 3.11+```

- Django 5.2.4

- PostgreSQL (opcional, SQLite por defecto)### **🎨 Frontend Setup**



# Frontend Requirements  ```bash

- Node.js 18+# 1. Navegar al frontend

- npm o yarncd ../Frontend

- React 19.0.0

```# 2. Instalar dependencias

npm install --legacy-peer-deps

### **🔧 Instalación Backend**

# 3. Configurar variables de entorno

```bashcopy .env.example .env

# 1. Clonar repositorio

git clone https://github.com/juansolor/GEB.git# 4. Ejecutar en desarrollo

cd GEB/Backendnpm start

```

# 2. Crear entorno virtual- **Reportes**: Generación de reportes básicos de ventas, inventario y finanzas

python -m venv venv- **Control de Usuarios**: Sistema de roles y permisos (admin, gerente, empleado)

venv\Scripts\activate  # Windows

source venv/bin/activate  # Linux/Mac## 🛠️ Tecnologías



# 3. Instalar dependencias### Backend

pip install -r requirements.txt- **Django 5.2.4**: Framework web de Python

- **Django REST Framework**: API REST

# 4. Configurar base de datos- **PostgreSQL/SQLite**: Base de datos

python manage.py makemigrations- **Django CORS Headers**: Manejo de CORS para el frontend

python manage.py migrate

### Frontend

# 5. Crear superusuario- **React 18**: Biblioteca de JavaScript para interfaces de usuario

python manage.py createsuperuser- **TypeScript**: Tipado estático para JavaScript

- **TailwindCSS**: Framework de CSS utilitario

# 6. Iniciar servidor- **React Router**: Enrutamiento en React

python manage.py runserver- **Axios**: Cliente HTTP para consumir la API

```

## 📁 Estructura del Proyecto

### **🎨 Instalación Frontend**

```

```bashGEB/

# 1. Navegar al frontend├── Backend/                 # API Django REST Framework

cd ../Frontend│   ├── geb_backend/        # Configuración principal

│   ├── users/              # Gestión de usuarios y autenticación

# 2. Instalar dependencias│   ├── products/           # Gestión de productos y categorías

npm install│   ├── customers/          # Gestión de clientes

│   ├── sales/              # Gestión de ventas

# 3. Configurar variables de entorno│   ├── finances/           # Gestión financiera

# Crear .env con:│   ├── reports/            # Generación de reportes

REACT_APP_API_URL=http://localhost:8000│   ├── requirements.txt    # Dependencias de Python

│   └── manage.py           # Script de gestión de Django

# 4. Iniciar desarrollo├── Frontend/               # Aplicación React

npm start│   ├── src/

│   │   ├── components/     # Componentes reutilizables

# 5. Build para producción│   │   ├── contexts/       # Contextos de React (Auth, etc.)

npm run build│   │   ├── pages/          # Páginas principales

```│   │   └── App.tsx         # Componente principal

│   ├── public/             # Archivos estáticos

## 🏗️ Arquitectura del Sistema│   ├── package.json        # Dependencias de Node.js

│   └── tailwind.config.js  # Configuración de TailwindCSS

### **Backend (Django REST Framework)**└── README.md              # Este archivo

```

```

Backend/## 🚀 Instalación y Configuración

├── geb_backend/          # Configuración principal

├── users/                # Gestión de usuarios### Prerrequisitos

├── products/             # Catálogo de productos- Python 3.8+

├── customers/            # CRM y clientes- Node.js 16+

├── sales/                # Ventas y facturación- PostgreSQL (opcional, se puede usar SQLite para desarrollo)

├── finances/             # Módulo financiero

├── reports/              # Reportes y analytics### Backend (Django)

├── pricing_analysis/     # Análisis de precios

├── marketing_analytics/  # 🆕 Marketing digital1. **Navegar al directorio del backend**:

├── inventory/            # Gestión de inventario   ```bash

└── depreciations/        # Cálculo depreciaciones   cd Backend

```   ```



### **Frontend (React + TypeScript)**2. **Crear y activar entorno virtual**:

   ```bash

```   python -m venv venv

Frontend/src/   # En Windows:

├── components/           # Componentes reutilizables   venv\Scripts\activate

├── pages/               # Páginas principales   # En macOS/Linux:

├── contexts/            # Context API (Auth, etc.)   source venv/bin/activate

├── types/               # Definiciones TypeScript   ```

├── utils/               # Utilidades y APIs

└── styles/              # Estilos CSS mejorados3. **Instalar dependencias**:

```   ```bash

   pip install -r requirements.txt

## 📊 Módulo Marketing Analytics ⭐ **NUEVO**   ```



### **🎯 Funcionalidades**4. **Configurar variables de entorno**:

   - Copiar `.env.example` a `.env`

#### **Integración con Plataformas**   - Configurar las variables según tu entorno

- ✅ **Google Ads API**: Métricas de campañas, CTR, CPC, conversiones

- ✅ **Instagram Business API**: Engagement, reach, followers, insights5. **Ejecutar migraciones**:

- ✅ **Facebook Ads** (Preparado): Listo para implementar   ```bash

- ✅ **LinkedIn Ads** (Preparado): Estructura creada   python manage.py makemigrations

   python manage.py migrate

#### **Dashboard Interactivo**   ```

- 📈 **KPIs en Tiempo Real**: ROAS, CTR, conversiones, gasto total

- 📊 **Gráficos Avanzados**: Tendencias con Chart.js, comparativas6. **Crear superusuario**:

- 🎯 **Análisis por Plataforma**: Rendimiento individual y comparativo   ```bash

- 📋 **Exportación Excel**: Reportes detallados automatizados   python manage.py createsuperuser

   ```

#### **Sistema de Insights Automáticos**

- 🤖 **Recomendaciones AI**: Optimización automática de campañas7. **Iniciar servidor de desarrollo**:

- ⚠️ **Alertas Inteligentes**: CTR bajo, presupuesto subutilizado   ```bash

- 📈 **Análisis Predictivo**: Forecasting de rendimiento   python manage.py runserver

- 💡 **Sugerencias de Mejora**: Acciones específicas por campaña   ```



### **🔧 Configuración de APIs**   El backend estará disponible en `http://localhost:8000`



#### **Google Ads Setup**### Frontend (React)

```python

# En settings.py o .env1. **Navegar al directorio del frontend**:

GOOGLE_ADS_DEVELOPER_TOKEN = 'tu_developer_token'   ```bash

GOOGLE_ADS_CLIENT_ID = 'tu_client_id'     cd Frontend

GOOGLE_ADS_CLIENT_SECRET = 'tu_client_secret'   ```

```

2. **Instalar dependencias**:

#### **Instagram Business Setup**   ```bash

```python   npm install

# Configuración Facebook/Instagram   ```

FACEBOOK_APP_ID = 'tu_app_id'

FACEBOOK_APP_SECRET = 'tu_app_secret'3. **Iniciar servidor de desarrollo**:

INSTAGRAM_BUSINESS_ACCOUNT_ID = 'tu_account_id'   ```bash

```   npm start

   ```

### **📈 Uso del Módulo**

   El frontend estará disponible en `http://localhost:3000`

1. **Acceder al Módulo**: Menú → "🎯 Marketing Analytics"

2. **Configurar Plataformas**: Tab "Plataformas" → "Agregar Plataforma"## 📊 Uso del Sistema

3. **Sincronizar Datos**: Botón "🔄 Sincronizar" en cada plataforma

4. **Analizar Resultados**: Dashboard con métricas automáticas### Roles de Usuario

5. **Revisar Insights**: Tab "💡 Insights" para recomendaciones

- **Administrador**: Acceso completo a todas las funcionalidades

## 🔄 Próximos Pasos y Roadmap- **Gerente**: Acceso a reportes y gestión operativa

- **Empleado**: Acceso básico para operaciones diarias

### **🚀 Implementación Inmediata (Sprint 1)**

### Funcionalidades Principales

#### **Marketing Analytics - Configuración**

- [ ] **Obtener credenciales Google Ads API**1. **Dashboard**: Vista general con métricas importantes

  - Crear proyecto en Google Cloud Console2. **Productos**: Gestión de inventario y catálogo

  - Habilitar Google Ads API3. **Clientes**: Base de datos de clientes

  - Generar developer token y OAuth credentials4. **Ventas**: Registro y seguimiento de ventas

- [ ] **Configurar Instagram Business API**5. **Finanzas**: Control de ingresos y gastos

  - Crear Facebook App6. **Reportes**: Análisis y reportes del negocio

  - Obtener permisos Instagram Business7. **Usuarios**: Gestión de usuarios del sistema (solo admin)

  - Configurar webhooks para updates automáticos

- [ ] **Implementar OAuth2 flow**## 🔧 Configuración Avanzada

  - Flujo de autorización seguro

  - Refresh tokens automático### Base de Datos PostgreSQL

  - Manejo de errores y reautenticación

Para usar PostgreSQL en lugar de SQLite:

#### **Testing y Validación**

- [ ] **Crear datos de prueba** para todas las funcionalidades1. Instalar PostgreSQL

- [ ] **Testing de integración** con APIs externas2. Crear base de datos

- [ ] **Validación de cálculos** de métricas y insights3. Configurar variables en `.env`:

- [ ] **Pruebas de rendimiento** con grandes volúmenes de datos   ```

   DB_NAME=geb_database

### **📈 Mejoras a Mediano Plazo (Sprint 2-3)**   DB_USER=tu_usuario

   DB_PASSWORD=tu_contraseña

#### **Inteligencia Artificial y ML**   DB_HOST=localhost

- [ ] **Implementar modelos predictivos**   DB_PORT=5432

  ```python   ```

  # Forecasting con Prophet/TensorFlow

  - Predicción de ROI por campaña### Despliegue en Producción

  - Análisis de estacionalidad

  - Detección de anomalías en métricas1. **Backend**:

  ```   - Configurar `DEBUG=False`

- [ ] **Optimización automática de pujas**   - Usar PostgreSQL

  - Algoritmos de machine learning para bid management   - Configurar servidor web (nginx + gunicorn)

  - A/B testing automatizado   - Configurar archivos estáticos

  - Recomendaciones de palabras clave

- [ ] **Análisis de sentimientos**2. **Frontend**:

  - Procesamiento de comentarios y reviews   - Ejecutar `npm run build`

  - Análisis de brand mention   - Servir archivos estáticos

  - Score de reputación online   - Configurar dominio y SSL



#### **Funcionalidades Avanzadas**## 🤝 Contribuciones

- [ ] **Dashboard personalizable**

  - Widgets arrastrables1. Fork el proyecto

  - Filtros avanzados personalizados2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)

  - Alertas configurables por usuario3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)

- [ ] **Reportes automáticos**4. Push a la rama (`git push origin feature/AmazingFeature`)

  - Envío por email programado5. Abrir un Pull Request

  - Reportes PDF profesionales

  - Comparativas período anterior## 📝 Licencia

- [ ] **Integración con más plataformas**

  - TikTok Ads ManagerEste proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

  - YouTube Ads (Google Ads Video)

  - Pinterest Business## 📞 Soporte

  - Snapchat Ads

Si tienes preguntas o necesitas ayuda:

### **🔄 Optimizaciones Técnicas**- Crear un issue en GitHub

- Contactar al equipo de desarrollo

#### **Performance y Escalabilidad**

- [ ] **Implementar Redis para caché**---

  ```python

  # Caché de métricas frecuentes**GEB - Gestión Empresarial** - Simplificando la administración de tu negocio

  - Datos de dashboard (TTL 5 min)
  - Insights calculados (TTL 1 hora)
  - Configuración de plataformas
  ```
- [ ] **Background tasks con Celery**
  - Sincronización de datos en background
  - Cálculo de insights programado
  - Generación de reportes asíncrona
- [ ] **Optimización de queries**
  - Indexación de base de datos
  - Agregaciones eficientes
  - Paginación de grandes datasets

#### **Seguridad y Compliance**
- [ ] **Encriptación de credenciales API**
  ```python
  # Usar django-cryptography o similar
  - Tokens API encriptados en DB
  - Rotation automática de secrets
  - Audit log de accesos
  ```
- [ ] **GDPR Compliance**
  - Anonimización de datos de audiencia
  - Right to be forgotten
  - Data export para usuarios
- [ ] **API Rate Limiting**
  - Throttling inteligente
  - Queue de requests
  - Fallback a datos cached

### **🎨 Mejoras de UX/UI**

#### **Interface Avanzada**
- [ ] **Modo oscuro/claro**
  - Toggle en header
  - Persistencia en localStorage
  - Variables CSS dinámicas
- [ ] **Mobile responsive avanzado**
  - Progressive Web App (PWA)
  - Offline functionality básica
  - Touch gestures optimizados
- [ ] **Visualizaciones avanzadas**
  - D3.js para gráficos complejos
  - Mapas de calor interactivos
  - Timelines de campañas

#### **Workflow Optimization**
- [ ] **Onboarding interactivo**
  - Tour guiado para nuevos usuarios
  - Tooltips contextuales
  - Progressive disclosure
- [ ] **Atajos de teclado**
  - Navegación rápida
  - Acciones frecuentes
  - Command palette (Cmd+K)
- [ ] **Colaboración en equipo**
  - Comentarios en insights
  - Assignments de tareas
  - Historial de cambios

### **🏢 Expansión de Módulos**

#### **CRM Avanzado**
- [ ] **Lead scoring automático**
  - ML para calificación de leads
  - Integración con marketing automation
  - Attribution modeling
- [ ] **Customer journey mapping**
  - Funnel analysis completo
  - Touchpoint tracking
  - Conversion path analysis
- [ ] **Segmentación dinámica**
  - Behavioral segmentation
  - RFM analysis automatizado
  - Lifetime value prediction

#### **Financial Intelligence**
- [ ] **Cash flow forecasting**
  - Predicción de flujo de caja
  - Scenario planning
  - Budget variance analysis
- [ ] **Cost center analytics**
  - Profitability por departamento
  - Resource allocation optimization
  - Activity-based costing
- [ ] **Risk assessment**
  - Credit risk scoring
  - Market risk analysis
  - Operational risk monitoring

## 🛠️ Comandos Útiles

### **🔧 Desarrollo**

```bash
# Backend - Crear nueva app
python manage.py startapp nombre_app

# Frontend - Agregar dependencia
npm install package-name

# Linting y formato
npm run lint
npm run format

# Tests
python manage.py test
npm test
```

### **🚀 Deployment**

```bash
# Build producción
npm run build

# Collect static files
python manage.py collectstatic

# Migraciones en producción
python manage.py migrate --run-syncdb
```

### **📊 Monitoreo**

```bash
# Logs Django
tail -f django.log

# Performance profiling
python manage.py runserver --settings=geb_backend.settings.profile

# Database queries
python manage.py debugsqlshell
```

## 🚀 Inicio Rápido

### **Ejecutar el Sistema Completo**

#### **Usando VS Code Task**
```bash
# En VS Code, ejecutar tarea:
Ctrl+Shift+P → "Tasks: Run Task" → "Start Django Backend"
```

#### **Manual**
```bash
# Terminal 1 - Backend
cd Backend
venv\Scripts\activate
python manage.py runserver

# Terminal 2 - Frontend  
cd Frontend
npm start
```

### **Acceso al Sistema**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Django**: http://localhost:8000/admin

### **Credenciales por defecto**:
- **Usuario**: Crear con `python manage.py createsuperuser`

## 🤝 Contribución

### **📋 Guidelines de Desarrollo**

1. **Branching Strategy**
   ```
   main          # Producción
   ├── develop   # Desarrollo principal
   ├── feature/* # Nuevas características
   ├── hotfix/*  # Correcciones urgentes
   └── release/* # Preparación releases
   ```

2. **Commit Convention**
   ```
   feat: agregar nuevo módulo de marketing analytics
   fix: corregir cálculo de ROAS en dashboard
   docs: actualizar README con instrucciones API
   style: mejorar contraste de colores en sidebar
   refactor: optimizar queries de métricas
   test: agregar tests para insights automáticos
   ```

3. **Code Review Checklist**
   - [ ] Funcionalidad probada manualmente
   - [ ] Tests unitarios agregados/actualizados
   - [ ] Documentación actualizada
   - [ ] No breaking changes sin migración
   - [ ] Performance considerado
   - [ ] Seguridad validada

## 📞 Soporte y Contacto

### **🐛 Reporte de Bugs**

Usar GitHub Issues con template:
```markdown
**Descripción del Bug**
Descripción clara del problema

**Pasos para Reproducir**
1. Ir a '...'
2. Hacer click en '....'
3. Scroll hasta '....'
4. Ver error

**Comportamiento Esperado**
Qué debería suceder

**Screenshots**
Si aplica, agregar capturas

**Información del Sistema:**
 - OS: [e.g. Windows 11]
 - Browser [e.g. Chrome 118]
 - Version [e.g. 2.0.0]
```

### **💡 Feature Requests**

Template para nuevas funcionalidades:
```markdown
**¿Tu feature request está relacionado con un problema?**
Descripción clara del problema

**Describe la solución que te gustaría**
Descripción clara de lo que quieres que suceda

**Describe alternativas consideradas**
Alternativas que has considerado

**Contexto adicional**
Cualquier otro contexto sobre la feature request
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 🙏 Reconocimientos

- **Chart.js** - Gráficos interactivos hermosos
- **Django REST Framework** - API backend poderosa
- **React + TypeScript** - Frontend moderno y tipado
- **Google Ads API** - Integración con Google Ads
- **Instagram Business API** - Integración con Instagram
- **Comunidad Open Source** - Por las librerías increíbles

---

## 📈 Estadísticas del Proyecto

- **Líneas de código**: ~15,000+ (Backend: 8,000, Frontend: 7,000)
- **Módulos**: 12 módulos principales
- **APIs**: 6 integraciones externas (Google Ads, Instagram, etc.)
- **Componentes React**: 50+ componentes reutilizables
- **Modelos Django**: 25+ modelos de datos
- **Endpoints API**: 80+ endpoints RESTful

---

**🚀 ¡GEB está listo para potenciar tu negocio!** 

*Desarrollado con ❤️ para empresas que buscan excelencia operativa y crecimiento sostenible.*