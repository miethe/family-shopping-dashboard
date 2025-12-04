# Family Gifting Dashboard - Docker Makefile
# Convenience commands for Docker operations

.PHONY: help build up down logs clean test-build

# Default target
help:
	@echo "Family Gifting Dashboard - Docker Commands"
	@echo ""
	@echo "Build Commands:"
	@echo "  make build          - Build all Docker images"
	@echo "  make build-api      - Build API image only"
	@echo "  make build-web      - Build Web image only"
	@echo "  make build-nc       - Build all images (no cache)"
	@echo "  make test-build     - Run build verification script"
	@echo ""
	@echo "Run Commands:"
	@echo "  make up             - Start all services (detached)"
	@echo "  make up-logs        - Start all services (with logs)"
	@echo "  make down           - Stop all services"
	@echo "  make restart        - Restart all services"
	@echo ""
	@echo "Development Commands:"
	@echo "  make logs           - Follow logs for all services"
	@echo "  make logs-api       - Follow API logs"
	@echo "  make logs-web       - Follow Web logs"
	@echo "  make logs-db        - Follow database logs"
	@echo "  make ps             - Show running containers"
	@echo ""
	@echo "Maintenance Commands:"
	@echo "  make clean          - Remove containers and networks"
	@echo "  make clean-all      - Remove containers, networks, and volumes"
	@echo "  make prune          - Remove unused Docker resources"
	@echo ""
	@echo "Database Commands:"
	@echo "  make db-backup      - Backup database to backup.sql"
	@echo "  make db-restore     - Restore database from backup.sql"
	@echo "  make db-shell       - Open psql shell"
	@echo "  make db-reset       - Reset database (WARNING: deletes data)"
	@echo ""

# Build commands
build:
	docker-compose build

build-api:
	docker-compose build api

build-web:
	docker-compose build web

build-nc:
	docker-compose build --no-cache

test-build:
	./docker-build.sh

# Run commands
up:
	docker-compose up -d

up-logs:
	docker-compose up

down:
	docker-compose down

restart:
	docker-compose restart

# Development commands
logs:
	docker-compose logs -f

logs-api:
	docker-compose logs -f api

logs-web:
	docker-compose logs -f web

logs-db:
	docker-compose logs -f postgres

ps:
	docker-compose ps

# Maintenance commands
clean:
	docker-compose down
	docker network prune -f

clean-all:
	docker-compose down -v
	docker network prune -f

prune:
	docker system prune -f

# Database commands
db-backup:
	docker-compose exec postgres pg_dump -U postgres family_gifting > backup.sql
	@echo "Database backed up to backup.sql"

db-restore:
	@if [ ! -f backup.sql ]; then \
		echo "Error: backup.sql not found"; \
		exit 1; \
	fi
	docker-compose exec -T postgres psql -U postgres family_gifting < backup.sql
	@echo "Database restored from backup.sql"

db-shell:
	docker-compose exec postgres psql -U postgres family_gifting

db-reset:
	@echo "WARNING: This will delete all data!"
	@read -p "Are you sure? (yes/no): " confirm && [ "$$confirm" = "yes" ]
	docker-compose down -v
	docker-compose up -d postgres
	@echo "Waiting for postgres to be ready..."
	@sleep 5
	docker-compose up -d

# Quick start for new users
quickstart: build up logs

# Full rebuild
rebuild: clean build up
