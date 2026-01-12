# Chedoparti Padel — Frontend

Sistema de gestión de reservas de canchas de pádel construido con **Vite + React + Tailwind CSS**.

## 🚀 Características

- **Autenticación JWT** con refresh token automático
- **Dashboard multi-rol** (Admin, Socio, Coach) con calendario interactivo
- **Sistema de reservas** en tiempo real con WebSocket
- **Gestión de precios** dinámica con reglas especiales
- **Integración MercadoPago** para pagos online
- **Internacionalización** (ES/EN) con i18next
- **Notificaciones por email** con EmailJS
- **Responsive design** optimizado para mobile y desktop

## 📋 Requisitos Previos

- **Node.js** 20.x o superior
- **npm** 9.x o superior
- Backend API corriendo (ver repositorio backend)

## ⚙️ Configuración

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd chedoparti-react-app
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiar el archivo de ejemplo y configurar tus valores:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
# API Configuration
VITE_API_BASE_URL=/api
VITE_WS_URL=ws://localhost:8989

# MercadoPago (obtener en https://www.mercadopago.com.ar/developers)
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-your-public-key

# EmailJS (obtener en https://dashboard.emailjs.com)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# Development
VITE_USE_MOCK_API=false
```

Ver `.env.example` para documentación completa de cada variable.

## 🛠️ Desarrollo

### Iniciar servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Otros comandos útiles

```bash
# Ejecutar linter
npm run lint

# Formatear código
npm run format

# Ejecutar tests
npm run test

# Tests con UI
npm run test:ui

# Cobertura de tests
npm run test:coverage

# Build de producción
npm run build

# Preview del build
npm run preview
```

## 🐳 Docker

### Build de la imagen

```bash
docker build -t chedoparti-frontend .
```

### Ejecutar contenedor

```bash
docker run -p 8081:80 --name chedoparti-frontend chedoparti-frontend
```

### Docker Compose

Si usás Docker Compose con el backend:

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "8081:80"
    depends_on:
      - api-gateway
    networks:
      - chedoparti-network
```

El nginx.conf está configurado para hacer proxy de `/api` al API Gateway.

## 📁 Estructura del Proyecto

```
src/
├── api/              # Cliente Axios y configuración
├── components/       # Componentes reutilizables
│   ├── Layout/      # Sidebar, Header, etc.
│   ├── pricing/     # Componentes de precios
│   └── ui/          # Componentes UI genéricos
├── config/          # Configuraciones de la app
├── context/         # React Context (Auth, UI)
├── hooks/           # Custom hooks
├── locales/         # Traducciones i18n
├── pages/           # Páginas/Vistas principales
│   ├── Admin/       # Dashboard Admin
│   ├── Coach/       # Dashboard Coach
│   ├── Socio/       # Dashboard Socio
│   ├── Courts/      # Gestión de canchas
│   ├── Reservations/# Gestión de reservas
│   └── ...
├── services/        # Servicios (API, email, etc.)
├── store/           # Zustand stores
├── utils/           # Utilidades y helpers
└── App.jsx          # Componente principal
```

## 🔐 Autenticación

El sistema usa JWT con refresh token automático:

1. Login en `/login` obtiene token
2. Token se guarda en localStorage
3. Interceptor de Axios agrega token a requests
4. Si token expira (401), intenta refresh automático
5. Si refresh falla, redirige a login

## 🌐 Rutas Principales

| Ruta | Descripción | Roles |
|------|-------------|-------|
| `/login` | Página de login | Público |
| `/signup` | Registro de usuarios | Público |
| `/dashboard` | Dashboard principal | Todos |
| `/reservations` | Lista de reservas | Todos |
| `/courts` | Gestión de canchas | Admin |
| `/schedules` | Configuración de horarios | Admin |
| `/pricing` | Gestión de precios | Admin |
| `/users` | Gestión de usuarios | Admin |
| `/stats` | Estadísticas | Admin |
| `/profile` | Perfil de usuario | Todos |

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Cobertura
npm run test:coverage
```

Tests ubicados en `/tests` y archivos `*.test.js`

## 🚀 Deployment

### Netlify

El proyecto incluye `netlify.toml` configurado:

```bash
npm run build
# Subir carpeta dist/ a Netlify
```

Configurar variables de entorno en Netlify dashboard.

### Vercel

```bash
npm run build
vercel --prod
```

### Servidor propio con Nginx

1. Build del proyecto:
```bash
npm run build
```

2. Copiar `dist/` al servidor

3. Configurar Nginx (ver `nginx.conf` como referencia)

## 📝 Notas Importantes

- **Variables de entorno**: Todas deben tener prefijo `VITE_` para ser accesibles
- **Cambios en .env**: Requieren reiniciar el dev server
- **Proxy API**: En desarrollo, Vite hace proxy de `/api` al backend
- **WebSocket**: Conexión en tiempo real para actualizaciones de reservas
- **Cache**: Assets estáticos cacheados por 30 días en producción

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Ver archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para issues y preguntas, abrir un issue en GitHub.
