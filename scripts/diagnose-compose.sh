#!/bin/bash
# Diagnostic script for Docker Compose setup
# This script helps troubleshoot the Chedoparti Docker Compose setup

set -e

echo "=========================================="
echo "Chedoparti Docker Compose Diagnostics"
echo "=========================================="
echo ""

# Check if docker compose is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
fi

echo "✅ Docker is available"
echo ""

# Validate docker-compose configuration
echo "📋 Validating docker-compose.yml configuration..."
if docker compose config > /dev/null 2>&1; then
    echo "✅ docker-compose.yml is valid"
else
    echo "❌ docker-compose.yml has errors"
    docker compose config
    exit 1
fi
echo ""

# Show container status
echo "📊 Container Status:"
echo "-------------------"
docker compose ps
echo ""

# Check service health
echo "🏥 Service Health Status:"
echo "------------------------"
SERVICES=("postgres" "redis" "user-service" "institution-service" "reservation-service" "payment-service" "api-gateway" "whatsapp-service")

for service in "${SERVICES[@]}"; do
    status=$(docker compose ps $service --format json 2>/dev/null | grep -o '"Health":"[^"]*"' | cut -d'"' -f4 || echo "N/A")
    state=$(docker compose ps $service --format json 2>/dev/null | grep -o '"State":"[^"]*"' | cut -d'"' -f4 || echo "N/A")
    
    if [ "$status" = "healthy" ]; then
        echo "✅ $service: $state ($status)"
    elif [ "$status" = "N/A" ]; then
        echo "⚠️  $service: $state (no healthcheck)"
    else
        echo "❌ $service: $state ($status)"
    fi
done
echo ""

# Test health endpoints
echo "🔍 Testing Health Endpoints:"
echo "----------------------------"

test_endpoint() {
    local name=$1
    local url=$2
    
    if curl -f -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null | grep -q "200"; then
        echo "✅ $name is responding: $url"
    else
        echo "❌ $name is not responding: $url"
    fi
}

test_endpoint "User Service" "http://localhost:8081/actuator/health"
test_endpoint "Institution Service" "http://localhost:8082/actuator/health"
test_endpoint "Reservation Service" "http://localhost:8083/actuator/health"
test_endpoint "Payment Service" "http://localhost:8084/actuator/health"
test_endpoint "API Gateway" "http://localhost:8989/actuator/health"
test_endpoint "WhatsApp Service" "http://localhost:8000/health"
test_endpoint "React Frontend" "http://localhost:5173"

echo ""

# Show recent logs for failed services
echo "📜 Recent logs for potentially failing services:"
echo "------------------------------------------------"

for service in "${SERVICES[@]}"; do
    state=$(docker compose ps $service --format json 2>/dev/null | grep -o '"State":"[^"]*"' | cut -d'"' -f4 || echo "N/A")
    health=$(docker compose ps $service --format json 2>/dev/null | grep -o '"Health":"[^"]*"' | cut -d'"' -f4 || echo "N/A")
    
    if [ "$state" != "running" ] || ([ "$health" != "healthy" ] && [ "$health" != "N/A" ]); then
        echo ""
        echo "=== $service logs (last 20 lines) ==="
        docker compose logs --tail=20 $service
    fi
done

echo ""
echo "=========================================="
echo "Diagnostic complete!"
echo "=========================================="
echo ""
echo "💡 Tips:"
echo "  - To view all logs: docker compose logs"
echo "  - To view specific service: docker compose logs <service-name>"
echo "  - To follow logs: docker compose logs -f"
echo "  - To rebuild: docker compose up -d --build"
echo "  - To restart: docker compose restart <service-name>"
echo ""
