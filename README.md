# 🎾 Chedoparti - Production-Grade Docker Setup

Sistema completo de reservas de canchas deportivas con arquitectura de microservicios, completamente dockerizado y listo para desarrollo.

## 🚀 Quick Start

```bash
docker compose up -d --build    # Build and start all services
```

**📚 Documentation:**
- **[DOCKER_SETUP_GUIDE.md](DOCKER_SETUP_GUIDE.md)** - Comprehensive Docker setup and troubleshooting guide
- **[QUICK_START.md](QUICK_START.md)** - Detailed quick start guide
- **[DOCKER_FIXES_SUMMARY.md](DOCKER_FIXES_SUMMARY.md)** - Recent Docker fixes and improvements

La aplicación estará disponible en:
- **Frontend Web**: http://localhost:5173
- **API Gateway**: http://localhost:8989
- **Usuario demo**: `demo@chedoparti.com` / `demo123`

## 📋 Requisitos

- Docker 24.0+
- Docker Compose V2
- 8GB RAM disponible
- Puertos disponibles: 5173, 8000, 8081-8084, 8989, 5432, 6379

## 🏗️ Arquitectura

```
┌─────────────┐     ┌──────────────┐
│   React     │────▶│ API Gateway  │
│  Frontend   │     │   :8989      │
└─────────────┘     └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    ┌───▼────┐      ┌──────▼──────┐   ┌──────▼──────┐
    │  User  │      │Institution  │   │ Reservation │
    │Service │      │  Service    │   │  Service    │
    │ :8081  │      │   :8082     │   │   :8083     │
    └───┬────┘      └──────┬──────┘   └──────┬──────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │  PostgreSQL │
                    │    :5432    │
                    └─────────────┘
```

### Servicios

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| **web-dev** | 5173 | Frontend React con hot-reload |
| **api-gateway** | 8989 | Enrutador principal (Spring Cloud Gateway) |
| **user-service** | 8081 | Autenticación y usuarios (Spring Boot) |
| **institution-service** | 8082 | Gestión de clubes/canchas (Spring Boot) |
| **reservation-service** | 8083 | Reservas y turnos (Spring Boot) |
| **payment-service** | 8084 | Procesamiento de pagos (Spring Boot) |
| **whatsapp-service** | 8000 | Integración WhatsApp (FastAPI/Python) |
| **postgres** | 5432 | Base de datos principal |
| **redis** | 6379 | Cache y sesiones |

## 📦 Building Services

### Why Build Before Docker?

The Java services are built on the host before Docker containerization to avoid SSL certificate issues in Docker build environments and to speed up the build process.

### Build All Services

```bash
./build-all.sh
```

This script builds all 5 microservices (User, Institution, Reservation, Payment, API Gateway).

### Build Individual Services

```bash
cd backend/chedoparti-user-service/user-service
mvn clean package -DskipTests
```

### What Gets Built

Each service creates a JAR file in its `target/` directory:
- `user-service-1.0.0.jar`
- `institution-service-1.0.0.jar`
- `reservation-service-1.0.0.jar`
- `payment-service-1.0.0.jar`
- `api-gateway-1.0.0.jar`

These JARs are then copied into Docker images.

## 🛠️ Comandos Disponibles

### Gestión de Servicios

```bash
make up          # Iniciar todos los servicios
make down        # Detener todos los servicios
make restart     # Reiniciar todos los servicios
make logs        # Ver logs de todos los servicios
make status      # Ver estado de servicios
make health      # Verificar salud de servicios
```

### Desarrollo

```bash
make logs-api    # Ver logs del API Gateway
make logs-user   # Ver logs del User Service
make logs-web    # Ver logs del frontend
```

### Testing

```bash
make test-api    # Probar endpoint de login
make health      # Verificar todos los endpoints de health
```

### Limpieza

```bash
make clean       # Eliminar contenedores y volúmenes
make clean-all   # Eliminar todo incluyendo imágenes
```

### Base de Datos

```bash
make shell-postgres  # Abrir shell de PostgreSQL
make shell-redis     # Abrir Redis CLI
```

## 📝 Variables de Entorno

Copiar `.env.example` a `.env` y ajustar según necesidad:

```bash
cp .env.example .env
```

### Variables Obligatorias

- `DB_USER`, `DB_PASSWORD`: Credenciales de PostgreSQL
- `JWT_SECRET`: Secreto para tokens JWT (cambiar en producción!)

### Variables Opcionales

- `WHATSAPP_*`: Solo si se usa integración con WhatsApp
- `OPENAI_API_KEY`: Solo si se usan features de IA
- `VITE_API_BASE_URL`: URL del API Gateway para el frontend

## 🔐 Autenticación

El sistema usa JWT para autenticación. Flujo:

1. **Login**: `POST /api/auth/login`
   ```json
   {
     "email": "demo@chedoparti.com",
     "password": "demo123"
   }
   ```

2. **Respuesta**:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIs...",
     "email": "demo@chedoparti.com",
     "name": "Demo User"
   }
   ```

3. **Uso del Token**: Incluir en headers:
   ```
   Authorization: Bearer {token}
   ```

### Usuario Demo

- **Email**: `demo@chedoparti.com`
- **Password**: `demo123`

## 🔌 Endpoints Principales

### API Gateway (`:8989`)

- `GET /actuator/health` - Health check del gateway
- `POST /api/auth/login` - Login de usuario
- `POST /api/auth/register` - Registro de usuario
- `GET /api/institutions/**` - Endpoints de instituciones
- `GET /api/reservations/**` - Endpoints de reservas
- `GET /api/payments/**` - Endpoints de pagos

### Servicios Directos (Solo en desarrollo)

- User Service: `http://localhost:8081/actuator/health`
- Institution Service: `http://localhost:8082/actuator/health`
- Reservation Service: `http://localhost:8083/actuator/health`
- Payment Service: `http://localhost:8084/actuator/health`
- WhatsApp Service: `http://localhost:8000/health`

## 🎨 Frontend

### Desarrollo (Hot Reload)

Por defecto, `docker compose up` levanta el frontend en modo desarrollo con hot-reload:

```bash
# Frontend disponible en http://localhost:5173
# Los cambios en ./frontend/chedoparti-react-app se reflejan automáticamente
```

### Producción (Nginx)

Para modo producción (build estático):

```bash
docker compose --profile production up
```

## 📱 Mobile App (Expo React Native)

La app mobile no corre en Docker pero puede conectarse a los servicios:

```bash
cd frontend/chedoparti-app/chedoparti_app
npm install
npx expo start
```

Configurar en `constants/config.ts`:
```typescript
export const API_BASE_URL = 'http://localhost:8989'
```

## 🗄️ Base de Datos

### Conexión Directa

```bash
# Vía Docker
docker compose exec postgres psql -U chedoparti -d user_service_db

# Vía localhost (si puerto expuesto)
psql -h localhost -p 5432 -U chedoparti -d user_service_db
```

### Bases de Datos

- `user_service_db` - Usuarios y autenticación
- `institution_service_db` - Clubes y canchas
- `reservation_service_db` - Reservas
- `payment_service_db` - Pagos

### Migraciones

Las migraciones se ejecutan automáticamente con Flyway al iniciar cada servicio.
Scripts en: `backend/chedoparti-*/*/src/main/resources/db/migration/`

## 🐛 Troubleshooting

### Quick Diagnostics

```bash
# Run automated diagnostic script
./scripts/diagnose-compose.sh

# Check detailed troubleshooting guide
cat DOCKER_SETUP_GUIDE.md
```

### Puertos en Uso

```bash
# Verificar puertos en uso
lsof -i :5173  # React
lsof -i :8989  # API Gateway
lsof -i :5432  # PostgreSQL

# Detener servicio que ocupa el puerto
kill -9 <PID>
```

### Servicios No Inician

```bash
# Ver logs detallados
docker compose logs -f <service-name>

# Verificar health checks
make health

# Reiniciar servicio específico
docker compose restart <service-name>
```

### Error de Conexión a Base de Datos

```bash
# Verificar que PostgreSQL esté healthy
docker compose ps postgres

# Reiniciar PostgreSQL
docker compose restart postgres

# Ver logs
docker compose logs postgres
```

### CORS Errors

Los servicios están configurados para aceptar requests de:
- `http://localhost:5173`
- `http://localhost:3000`
- `http://web-dev:5173`

Para agregar más orígenes, editar `WebConfig.java` en cada servicio.

### Volúmenes de Node Modules

Si hay problemas con dependencias del frontend:

```bash
# Eliminar volumen de node_modules
docker compose down -v
docker compose up --build
```

## 🔒 Seguridad

### Para Desarrollo

- JWT Secret incluido (cambiar en producción)
- Usuario demo con password conocido
- Puertos expuestos en localhost
- CORS permisivo para desarrollo local

### Para Producción

1. **Cambiar JWT_SECRET** en `.env` a un valor aleatorio fuerte
2. **Eliminar usuario demo** o cambiar contraseña
3. **Configurar CORS** específico por dominio
4. **Usar HTTPS** con certificados válidos
5. **Secrets** mediante Docker secrets o vault
6. **No exponer** puertos de servicios internos
7. **Habilitar** rate limiting en API Gateway

## 📊 Observabilidad

### Health Checks

Todos los servicios exponen `/health`:

```bash
curl http://localhost:8989/actuator/health  # Gateway
curl http://localhost:8081/health           # User Service
# etc...
```

### Métricas (Prometheus)

WhatsApp Service expone métricas en:
```
http://localhost:8000/metrics
```

Para agregar Prometheus/Grafana (opcional):

```bash
# Descomentar servicios en docker-compose.yml
docker compose --profile monitoring up
```

### Logs

```bash
# Logs en tiempo real
make logs

# Logs de servicio específico
docker compose logs -f user-service

# Últimas 100 líneas
docker compose logs --tail=100 api-gateway
```

## 🏃 CI/CD

El proyecto está listo para CI/CD. Ejemplo con GitHub Actions:

```yaml
name: Build and Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build services
        run: docker compose build
      - name: Start services
        run: docker compose up -d
      - name: Wait for services
        run: sleep 30
      - name: Run health checks
        run: make health
```

## 📦 Estructura del Proyecto

```
chedoparti/
├── backend/
│   ├── chedoparti-api-gateway/
│   │   └── api-gateway/
│   │       ├── src/main/java/com/chedoparti/gateway/
│   │       ├── Dockerfile
│   │       └── pom.xml
│   ├── chedoparti-user-service/
│   │   └── user-service/
│   │       ├── src/main/java/com/chedoparti/user/
│   │       ├── src/main/resources/db/migration/
│   │       ├── Dockerfile
│   │       └── pom.xml
│   ├── chedoparti-institution-service/
│   ├── chedoparti-reservation-service/
│   ├── chedoparti-payment-service/
│   └── chedoparti-whatsapp-service/
│       ├── app/
│       ├── Dockerfile
│       └── requirements.txt
├── frontend/
│   ├── chedoparti-react-app/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── vite.config.js
│   │   └── package.json
│   └── chedoparti-app/
│       └── chedoparti_app/  # Expo React Native
├── init-db/
│   └── init.sql
├── docker-compose.yml
├── Makefile
├── .env.example
└── README.md
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Equipo

- **Backend**: Spring Boot + PostgreSQL + Redis
- **Frontend Web**: React + Vite
- **Mobile**: Expo (React Native)
- **DevOps**: Docker + Docker Compose

---

**¿Problemas?** Abre un issue en el repositorio.

**¿Sugerencias?** Pull requests son bienvenidos!
