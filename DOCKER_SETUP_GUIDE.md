# Docker Compose Setup Guide

This guide explains how to start, troubleshoot, and debug the Chedoparti Docker Compose environment.

## Quick Start

### Prerequisites
- Docker Engine 24.0+ and Docker Compose V2
- Ports available: 5432 (PostgreSQL), 6379 (Redis), 8081-8084 (microservices), 8989 (API Gateway), 8000 (WhatsApp), 5173 (React)

### Starting the Services

```bash
# Start all services with build
docker compose up -d --build

# Wait for services to become healthy (usually 2-3 minutes)
docker compose ps

# Check logs if needed
docker compose logs -f
```

### Accessing the Application

Once all services are **healthy**:

- **React Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:8989
- **API Gateway Health**: http://localhost:8989/actuator/health
- **WhatsApp Service**: http://localhost:8000 (Health: http://localhost:8000/health)

Individual microservices:
- **User Service**: http://localhost:8081 (Health: http://localhost:8081/actuator/health)
- **Institution Service**: http://localhost:8082 (Health: http://localhost:8082/actuator/health)
- **Reservation Service**: http://localhost:8083 (Health: http://localhost:8083/actuator/health)
- **Payment Service**: http://localhost:8084 (Health: http://localhost:8084/actuator/health)

## Service Architecture

```
┌─────────────────┐
│  React Frontend │ :5173
│   (web-dev)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Gateway    │ :8989
│                 │
└────┬────────────┘
     │
     ├──► User Service         :8081
     ├──► Institution Service  :8082
     ├──► Reservation Service  :8083
     └──► Payment Service      :8084
     
┌─────────────────┐
│ WhatsApp Service│ :8000
│   (Python)      │
└─────────────────┘
     │
     ├──► Redis    :6379
     └──► API Gateway

All services connect to PostgreSQL :5432
```

## Health Checks

All Spring Boot services use **Spring Boot Actuator** endpoints:
- Path: `/actuator/health`
- Services: user-service, institution-service, reservation-service, payment-service, api-gateway

WhatsApp service (FastAPI):
- Path: `/health`

## Troubleshooting

### Using the Diagnostic Script

```bash
./scripts/diagnose-compose.sh
```

This script will:
- Validate docker-compose.yml
- Show container status
- Check service health
- Test health endpoints
- Show logs for failing services

### Manual Troubleshooting

#### Check Service Status
```bash
docker compose ps
```

Look for services that are not in `healthy` state.

#### View Logs

```bash
# All services
docker compose logs

# Specific service
docker compose logs api-gateway

# Follow logs
docker compose logs -f api-gateway

# Last N lines
docker compose logs --tail=100 api-gateway
```

#### Common Issues

**1. Microservice not starting (unhealthy)**

Check logs:
```bash
docker compose logs <service-name>
```

Common causes:
- Database connection issues (check PostgreSQL is healthy)
- Missing environment variables
- Build failed (check Dockerfile)

Solution:
```bash
# Rebuild specific service
docker compose up -d --build <service-name>
```

**2. API Gateway can't reach microservices**

The gateway needs all microservices to be healthy before starting.

Check dependencies:
```bash
docker compose ps user-service institution-service reservation-service payment-service
```

All should show `healthy` status.

**3. React frontend not starting**

Check logs:
```bash
docker compose logs web-dev
```

Common causes:
- npm install/ci failed
- Node modules permission issues

Solution:
```bash
# Remove volume and restart
docker volume rm chedoparti_web_node_modules
docker compose up -d --build web-dev
```

**4. WhatsApp service failing**

Check logs:
```bash
docker compose logs whatsapp-service
```

The service should start even without real WhatsApp credentials (uses defaults).

**5. Port conflicts**

Check if ports are already in use:
```bash
# Linux/Mac
sudo netstat -tlnp | grep -E "5432|6379|8081|8082|8083|8084|8989|8000|5173"

# Or using lsof
lsof -i :8989
```

### Restarting Services

```bash
# Restart single service
docker compose restart api-gateway

# Restart all services
docker compose restart

# Stop and start (recreate containers)
docker compose down
docker compose up -d
```

### Rebuilding Services

```bash
# Rebuild specific service
docker compose up -d --build api-gateway

# Rebuild all services
docker compose up -d --build

# Force rebuild (no cache)
docker compose build --no-cache
docker compose up -d
```

### Cleaning Up

```bash
# Stop all services
docker compose down

# Stop and remove volumes (⚠️  deletes database data)
docker compose down -v

# Remove all containers, networks, images
docker compose down --rmi all --volumes
```

## Development Workflow

### Making Code Changes

**Backend (Spring Boot services):**
1. Make code changes
2. Rebuild service: `docker compose up -d --build <service-name>`
3. Check logs: `docker compose logs -f <service-name>`

**Frontend (React):**
- Changes are reflected automatically (hot reload via Vite)
- If not working, check: `docker compose logs web-dev`

**WhatsApp Service (Python):**
1. Make code changes
2. Rebuild: `docker compose up -d --build whatsapp-service`
3. Check logs: `docker compose logs -f whatsapp-service`

### Database Migrations

Flyway is configured for database migrations.

Migration scripts location:
- User Service: `backend/chedoparti-user-service/user-service/src/main/resources/db/migration/`
- Institution Service: `backend/chedoparti-institution-service/institution-service/src/main/resources/db/migration/`
- Reservation Service: `backend/chedoparti-reservation-service/reservation-service/src/main/resources/db/migration/`
- Payment Service: `backend/chedoparti-payment-service/payment-service/src/main/resources/db/migration/`

After adding a migration:
```bash
# Restart the service to apply migrations
docker compose restart <service-name>
```

### Accessing Databases

```bash
# PostgreSQL
docker compose exec postgres psql -U chedoparti -d user_service_db

# Redis CLI
docker compose exec redis redis-cli
```

## Environment Variables

Key environment variables (set in docker-compose.yml):

**Spring Boot Services:**
- `SPRING_PROFILES_ACTIVE=docker` - Activates docker profile
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Database connection
- `JWT_SECRET` - JWT signing secret

**API Gateway:**
- `USER_ROUTE_URI`, `INSTITUTIONS_ROUTE_URI`, etc. - Microservice URLs

**WhatsApp Service:**
- `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` - WhatsApp API credentials
- `REDIS_HOST`, `REDIS_PORT` - Redis connection
- `API_GATEWAY_URL` - Gateway URL
- `OPENAI_API_KEY`, `OPENAI_MODEL` - OpenAI configuration

**Frontend:**
- `VITE_API_BASE_URL=http://localhost:8989` - API Gateway URL

To override defaults, create a `.env` file (see `.env.example`).

## CI/CD Integration

The setup is designed to work in CI/CD pipelines:

```bash
# CI workflow example
docker compose up -d --build
docker compose ps
./scripts/diagnose-compose.sh

# Wait for services to be healthy
timeout 300 bash -c 'until docker compose ps | grep -q "healthy"; do sleep 5; done'

# Run tests against running services
# ... your test commands ...

# Cleanup
docker compose down -v
```

## Performance Tips

1. **Build cache**: Docker caches layers. Only changed layers are rebuilt.
2. **Named volumes**: `web_node_modules` volume persists node_modules across rebuilds
3. **Health checks**: Configured with appropriate intervals and start periods
4. **Parallel builds**: Docker Compose builds services in parallel when possible

## Getting Help

If you encounter issues:

1. Run the diagnostic script: `./scripts/diagnose-compose.sh`
2. Check service logs: `docker compose logs <service-name>`
3. Verify configuration: `docker compose config`
4. Check Docker resources: `docker system df`
5. Review this guide's troubleshooting section

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)
- [Vite Documentation](https://vitejs.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
