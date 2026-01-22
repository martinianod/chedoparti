#!/bin/bash
# Build script for Chedoparti microservices
# This script builds all Java services before Docker containerization

set -e

echo "🏗️  Building Chedoparti Microservices..."
echo "==========================================="

# Build function
build_service() {
    local service_name=$1
    local service_path=$2
    
    echo ""
    echo "📦 Building $service_name..."
    cd "$service_path"
    
    if mvn clean package -Dmaven.test.skip=true -q; then
        echo "✅ $service_name built successfully"
        return 0
    else
        echo "❌ $service_name build failed"
        return 1
    fi
}

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR"

# Build all services
build_service "User Service" "$PROJECT_ROOT/backend/chedoparti-user-service/user-service"
build_service "Institution Service" "$PROJECT_ROOT/backend/chedoparti-institution-service/institution-service"
build_service "Reservation Service" "$PROJECT_ROOT/backend/chedoparti-reservation-service/reservation-service"
build_service "Payment Service" "$PROJECT_ROOT/backend/chedoparti-payment-service/payment-service"
build_service "API Gateway" "$PROJECT_ROOT/backend/chedoparti-api-gateway/api-gateway"

echo ""
echo "==========================================="
echo "✅ All services built successfully!"
echo "==========================================="
echo ""
echo "Next steps:"
echo "1. Run: docker compose up -d"
echo "2. Wait for services to be healthy (30-60 seconds)"
echo "3. Open: http://localhost:5173"
echo ""
