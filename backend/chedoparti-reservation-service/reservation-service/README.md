# Reservation Service

ChedoParti Reservation Service - Manages court reservations, users, and related operations.

## Configuration

### OpenAPI/Swagger Configuration

The service provides OpenAPI documentation at `/v3/api-docs` and Swagger UI (if enabled).

**OpenAPI Service URL Configuration:**

The OpenAPI documentation server URL can be configured via the `openapi.service.url` property:

- **Local Development**: Defaults to `http://localhost:8080`
- **Docker Environment**: Set to `http://api-gateway:8989` (configured in `application-docker.properties`)
- **Custom Environment**: Override via environment variable `OPENAPI_SERVICE_URL`

Example for Docker Compose:
```yaml
environment:
  OPENAPI_SERVICE_URL: http://api-gateway:8989
```

If not specified, the service falls back to `http://localhost:8080` and logs a warning.

## Running the Service

### Local Development
```bash
mvn spring-boot:run
```

### Docker
```bash
docker compose up -d reservation-service
```

## Endpoints

- **Health Check**: `GET /health`
- **OpenAPI Docs**: `GET /v3/api-docs`
- **Swagger UI**: `GET /swagger-ui.html` (if enabled)
