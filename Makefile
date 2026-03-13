# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SSBS - Smart School Bus System
# Makefile
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

.PHONY: build up up-build down restart logs logs-backend logs-cron logs-frontend \
        shell-be shell-fe db migrate seed clean prune help \
        scaffold-project scaffold-app scaffold-frontend

# ──────────────────────────────────────────────────────────────────────────────
# Docker Compose Commands
# ──────────────────────────────────────────────────────────────────────────────

## Build all containers
build:
	docker compose build

## Start all services
up:
	docker compose up -d

## Start all services with build
up-build:
	docker compose up -d --build

## Stop all services
down:
	docker compose down

## Restart all services
restart:
	docker compose restart

# ──────────────────────────────────────────────────────────────────────────────
# Logs
# ──────────────────────────────────────────────────────────────────────────────

## View all logs
logs:
	docker compose logs -f

## View backend logs
logs-backend:
	docker compose logs -f backend

## View cron logs
logs-cron:
	docker compose logs -f cron

## View frontend logs
logs-frontend:
	docker compose logs -f frontend

# ──────────────────────────────────────────────────────────────────────────────
# Shell Access
# ──────────────────────────────────────────────────────────────────────────────

## Shell into backend container
shell-be:
	docker compose exec backend sh

## Shell into frontend container
shell-fe:
	docker compose exec frontend sh

## Access database shell
db:
	docker compose exec db psql -U $${POSTGRES_USER:-ssbs_user} -d $${POSTGRES_DB:-ssbs_db}

# ──────────────────────────────────────────────────────────────────────────────
# Django Commands
# ──────────────────────────────────────────────────────────────────────────────

## Run migrations inside backend container
migrate:
	docker compose exec backend python manage.py migrate

## Run seed_data command inside backend container
seed:
	docker compose exec backend python manage.py seed_data

# ──────────────────────────────────────────────────────────────────────────────
# Cleanup
# ──────────────────────────────────────────────────────────────────────────────

## Remove containers, volumes, and images
clean:
	docker compose down -v --rmi all

## Docker system prune
prune:
	docker system prune -f

# ──────────────────────────────────────────────────────────────────────────────
# Scaffold
# ──────────────────────────────────────────────────────────────────────────────

## Scaffold Django project (creates 'ssbs' settings folder)
scaffold-project:
	@echo "🏗️  Scaffolding Django Project..."
	docker compose exec backend django-admin startproject ssbs .
	@echo "✅ Project 'ssbs' created. Restarting backend..."
	docker compose restart backend

## Scaffold Django app (Usage: make scaffold-app name=myapp)
scaffold-app:
	@if [ -z "$(name)" ]; then \
		echo "❌ Error: name is required. Usage: make scaffold-app name=myapp"; \
		exit 1; \
	fi
	@echo "🏗️  Scaffolding App: $(name)..."
	docker compose exec backend sh -lc 'mkdir -p apps/$(name) && python manage.py startapp $(name) apps/$(name)'
	@echo "✅ App '$(name)' created in apps/$(name)."

## Scaffold React frontend with Vite
scaffold-frontend:
	@echo "🏗️  Scaffolding React Frontend..."
	docker compose exec -it frontend npm create vite@latest . -- --template react
	@echo "✅ Frontend created. Restarting to install dependencies..."
	docker compose restart frontend

# ──────────────────────────────────────────────────────────────────────────────
# Help
# ──────────────────────────────────────────────────────────────────────────────

## Show this help
help:
	@echo "SSBS - Smart School Bus System"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Docker:"
	@echo "  build         Build all containers"
	@echo "  up            Start all services"
	@echo "  up-build      Start all services with build"
	@echo "  down          Stop all services"
	@echo "  restart       Restart all services"
	@echo ""
	@echo "Logs:"
	@echo "  logs          View all logs"
	@echo "  logs-backend  View backend logs"
	@echo "  logs-cron     View cron logs"
	@echo "  logs-frontend View frontend logs"
	@echo ""
	@echo "Shell:"
	@echo "  shell-be      Shell into backend container"
	@echo "  shell-fe      Shell into frontend container"
	@echo "  db            Access database shell"
	@echo ""
	@echo "Django:"
	@echo "  migrate       Run migrations"
	@echo "  seed          Run seed_data command"
	@echo ""
	@echo "Scaffold:"
	@echo "  scaffold-project           Create Django project"
	@echo "  scaffold-app name=myapp    Create Django app"
	@echo "  scaffold-frontend          Create React frontend"
	@echo ""
	@echo "Cleanup:"
	@echo "  clean         Remove containers, volumes, images"
	@echo "  prune         Docker system prune"
