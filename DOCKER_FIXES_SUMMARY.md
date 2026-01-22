# Docker Compose Fixes - Summary

## Changes Made

### 1. Fixed Health Check Endpoints ✅

**Problem**: Docker Compose was checking `/health` but Spring Boot Actuator exposes `/actuator/health`

**Solution**: Updated docker-compose.yml for all Spring Boot services:
- user-service
- institution-service  
- reservation-service
- payment-service
- api-gateway (already correct)

Changed from:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
```

To:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
```

### 2. Fixed WhatsApp Service Healthcheck ✅

**Problem**: WhatsApp service needs curl for Docker healthcheck but didn't have it installed

**Solution**: Added curl installation to Dockerfile:
```dockerfile
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
```

### 3. Fixed Frontend Node Modules Volume ✅

**Problem**: Anonymous volume `/app/node_modules` can cause permission and persistence issues

**Solution**: 
- Changed to named volume `web_node_modules`
- Changed from `npm install` to `npm ci` for more reliable builds
```yaml
volumes:
  - ./frontend/chedoparti-react-app:/app
  - web_node_modules:/app/node_modules
command: sh -c "npm ci && npm run dev -- --host 0.0.0.0 --port 5173"
```

### 4. Migrated Build System from Maven to Gradle ✅

**Problem**: Services have both Maven and Gradle but Dockerfiles only used Maven

**Solution**: Updated Dockerfiles to use Gradle (faster, better caching):
- user-service
- institution-service
- reservation-service
- api-gateway
- payment-service (kept Maven as it only has Maven files)

### 5. Added CA Certificate Updates ✅

**Problem**: SSL certificate validation failures during Docker builds

**Solution**: Added CA certificate updates in all Dockerfiles:
```dockerfile
RUN apt-get update && apt-get install -y ca-certificates && update-ca-certificates
```

### 6. Created Diagnostic Tools ✅

**Added**:
- `scripts/diagnose-compose.sh` - Automated diagnostic script
- `DOCKER_SETUP_GUIDE.md` - Comprehensive setup and troubleshooting guide

## Testing Instructions

### Quick Start
```bash
# Clean any existing containers
docker compose down -v

# Build and start all services
docker compose up -d --build

# Wait for services to become healthy (2-3 minutes)
watch docker compose ps

# Check service health
./scripts/diagnose-compose.sh
```

### Expected Results

After startup, `docker compose ps` should show:

```
NAME                     STATUS
postgres                 Up (healthy)
redis                    Up (healthy)  
user-service             Up (healthy)
institution-service      Up (healthy)
reservation-service      Up (healthy)
payment-service          Up (healthy)
api-gateway              Up (healthy)
whatsapp-service         Up (healthy)
chedoparti-react-dev     Up
```

### Accessing Services

- **React Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:8989
- **API Gateway Health**: http://localhost:8989/actuator/health
- **WhatsApp Health**: http://localhost:8000/health

### Troubleshooting

If services don't start:

1. **Check logs**: `docker compose logs <service-name>`
2. **Run diagnostics**: `./scripts/diagnose-compose.sh`
3. **Check specific service**: `docker compose logs -f api-gateway`
4. **Rebuild specific service**: `docker compose up -d --build <service-name>`

## Known Issues

### Build Environment Certificate Issues

In some CI/CD or restricted network environments, you may encounter SSL certificate errors during Docker builds:

```
unable to find valid certification path to requested target
```

**Workarounds**:

1. **Pre-build JARs locally** (if you have a working environment):
   ```bash
   # Build all services locally first
   cd backend/chedoparti-user-service/user-service
   ./gradlew clean bootJar
   # Repeat for other services
   ```

2. **Use local Docker registry with pre-built images**

3. **Configure corporate proxy/certificates** if in enterprise environment

4. **Use host network during build** (Linux only):
   ```bash
   docker compose build --build-arg BUILDKIT_INLINE_CACHE=1
   ```

### Service-Specific Issues

- **User Service**: May have MapStruct compilation errors - these are existing code issues
- **Payment Service**: Uses Maven (others use Gradle) due to project structure

## Architecture

```
Frontend (React+Vite) :5173
    ↓
API Gateway :8989
    ↓
    ├── User Service :8081
    ├── Institution Service :8082  
    ├── Reservation Service :8083
    └── Payment Service :8084

WhatsApp Service :8000 → Redis :6379 + API Gateway

All services → PostgreSQL :5432
```

## Service Health Endpoints

- **Spring Boot Services**: `/actuator/health`
  - user-service: http://localhost:8081/actuator/health
  - institution-service: http://localhost:8082/actuator/health
  - reservation-service: http://localhost:8083/actuator/health
  - payment-service: http://localhost:8084/actuator/health
  - api-gateway: http://localhost:8989/actuator/health

- **WhatsApp Service (FastAPI)**: `/health`
  - whatsapp-service: http://localhost:8000/health

- **React Frontend**: http://localhost:5173

## Files Modified

1. `docker-compose.yml` - Updated healthchecks and volumes
2. `backend/chedoparti-whatsapp-service/Dockerfile` - Added curl
3. `backend/chedoparti-user-service/user-service/Dockerfile` - Gradle + CA certs
4. `backend/chedoparti-institution-service/institution-service/Dockerfile` - Gradle + CA certs
5. `backend/chedoparti-reservation-service/reservation-service/Dockerfile` - Gradle + CA certs
6. `backend/chedoparti-api-gateway/api-gateway/Dockerfile` - Gradle + CA certs
7. `backend/chedoparti-payment-service/payment-service/Dockerfile` - CA certs
8. `scripts/diagnose-compose.sh` - New diagnostic script
9. `DOCKER_SETUP_GUIDE.md` - New comprehensive guide

## Next Steps

1. Test the complete Docker Compose startup
2. Verify all services reach healthy state
3. Test React frontend connectivity to API Gateway
4. Run code review and security scans
5. Update main README with Docker setup instructions

## Validation Checklist

- [ ] `docker compose config` validates successfully
- [ ] `docker compose up -d --build` completes without errors
- [ ] All services show "healthy" status in `docker compose ps`
- [ ] API Gateway responds at http://localhost:8989/actuator/health
- [ ] React frontend loads at http://localhost:5173
- [ ] Frontend can communicate with API Gateway
- [ ] WhatsApp service is healthy
- [ ] No errors in `docker compose logs`
