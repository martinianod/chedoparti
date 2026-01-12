# 🚀 Quick Start Guide

Get Chedoparti running in under 5 minutes!

## Prerequisites

- Docker 24.0+
- Docker Compose V2
- Maven 3.9+ (for building Java services)
- Java 17+ JDK
- 8GB RAM available
- Ports available: 5173, 8000, 8081-8084, 8989, 5432, 6379

## Step 1: Clone & Setup

```bash
git clone https://github.com/martinianod/chedoparti.git
cd chedoparti
cp .env.example .env
```

## Step 2: Build Services

Build all Java microservices (this takes 2-3 minutes):

```bash
./build-all.sh
```

Or build manually:

```bash
cd backend/chedoparti-user-service/user-service && mvn clean package -DskipTests
cd ../../../chedoparti-institution-service/institution-service && mvn clean package -DskipTests
cd ../../../chedoparti-reservation-service/reservation-service && mvn clean package -DskipTests
cd ../../../chedoparti-payment-service/payment-service && mvn clean package -DskipTests
cd ../../../chedoparti-api-gateway/api-gateway && mvn clean package -DskipTests
cd ../../../..
```

## Step 3: Start Docker Services

```bash
docker compose up -d
```

Wait for services to be healthy (30-60 seconds):

```bash
docker compose ps
```

All services should show status as "Up" and healthy.

## Step 4: Access the Application

Open your browser to: **http://localhost:5173**

### Demo Credentials

- **Email**: `demo@chedoparti.com`
- **Password**: `demo123`

## Step 5: Test the Setup

### Check Service Health

```bash
# API Gateway
curl http://localhost:8989/actuator/health

# User Service
curl http://localhost:8081/health

# All services
make health
```

### Test Authentication

```bash
curl -X POST http://localhost:8989/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@chedoparti.com","password":"demo123"}'
```

Should return:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "email": "demo@chedoparti.com",
  "name": "Demo User"
}
```

## Common Issues

### Port Already in Use

```bash
# Check what's using the port
lsof -i :5173
lsof -i :8989

# Kill the process
kill -9 <PID>
```

### Maven Build Fails

Make sure you have Java 17+ JDK installed:

```bash
java -version
# Should show version 17 or higher

mvn --version
# Should show Maven 3.9+
```

### Docker Services Won't Start

```bash
# Check logs
docker compose logs -f

# Restart everything
docker compose down -v
docker compose up -d
```

### Database Connection Issues

```bash
# Check Postgres is healthy
docker compose ps postgres

# Restart Postgres
docker compose restart postgres

# Check logs
docker compose logs postgres
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [Makefile](Makefile) for helpful commands
- Explore the API routes in [docker-compose.yml](docker-compose.yml)
- Configure the mobile app to connect to the API

## Useful Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Restart a single service
docker compose restart user-service

# Rebuild and restart
docker compose up -d --build

# Clean everything (including volumes)
docker compose down -v
```

## Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | React web app |
| API Gateway | http://localhost:8989 | Main API entry point |
| User Service | http://localhost:8081 | Direct access (dev only) |
| Institution Service | http://localhost:8082 | Direct access (dev only) |
| Reservation Service | http://localhost:8083 | Direct access (dev only) |
| Payment Service | http://localhost:8084 | Direct access (dev only) |
| WhatsApp Service | http://localhost:8000 | Direct access (dev only) |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache |

## Support

If you encounter issues:

1. Check [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) (coming soon)
2. Open an issue on GitHub
3. Check Docker logs: `docker compose logs`

---

**Happy coding! 🎾**
