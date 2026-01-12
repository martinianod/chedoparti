.PHONY: help build up down restart logs clean status test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build all Java services (requires Maven & Java 17+)
	@echo "Building all services..."
	@./build-all.sh

up: ## Start all services (build required first)
	docker compose up -d

build-up: ## Build JARs and start all services
	@./build-all.sh
	@docker compose up -d

down: ## Stop all services
	docker compose down

restart: ## Restart all services
	docker compose restart

logs: ## Show logs from all services
	docker compose logs -f

logs-api: ## Show logs from API gateway
	docker compose logs -f api-gateway

logs-user: ## Show logs from user service
	docker compose logs -f user-service

logs-web: ## Show logs from web frontend
	docker compose logs -f web-dev

status: ## Show status of all services
	docker compose ps

clean: ## Stop and remove all containers, networks, and volumes
	docker compose down -v --remove-orphans

clean-all: ## Remove everything including images
	docker compose down -v --rmi all --remove-orphans

health: ## Check health of all services
	@echo "Checking services health..."
	@echo "\n=== Postgres ==="
	@docker compose exec postgres pg_isready -U chedoparti || echo "Postgres is down"
	@echo "\n=== Redis ==="
	@docker compose exec redis redis-cli ping || echo "Redis is down"
	@echo "\n=== API Gateway ==="
	@curl -s http://localhost:8989/actuator/health | jq '.' || echo "API Gateway is down"
	@echo "\n=== User Service ==="
	@curl -s http://localhost:8081/health | jq '.' || echo "User Service is down"
	@echo "\n=== Institution Service ==="
	@curl -s http://localhost:8082/health | jq '.' || echo "Institution Service is down"
	@echo "\n=== Reservation Service ==="
	@curl -s http://localhost:8083/health | jq '.' || echo "Reservation Service is down"
	@echo "\n=== Payment Service ==="
	@curl -s http://localhost:8084/health | jq '.' || echo "Payment Service is down"
	@echo "\n=== WhatsApp Service ==="
	@curl -s http://localhost:8000/health | jq '.' || echo "WhatsApp Service is down"

test-api: ## Test API endpoints
	@echo "Testing authentication..."
	@curl -X POST http://localhost:8989/api/auth/login \
		-H "Content-Type: application/json" \
		-d '{"email":"demo@chedoparti.com","password":"demo123"}' | jq '.'

shell-postgres: ## Open PostgreSQL shell
	docker compose exec postgres psql -U chedoparti

shell-redis: ## Open Redis CLI
	docker compose exec redis redis-cli

install: ## First time setup
	@echo "Creating .env file from .env.example..."
	@cp -n .env.example .env || true
	@echo "Building all services..."
	@./build-all.sh
	@echo "Starting services..."
	@docker compose up -d
	@echo "\nWaiting for services to be healthy..."
	@sleep 30
	@make health
	@echo "\n✅ Setup complete! Access the app at http://localhost:5173"
