.PHONY: up down build logs restart clean test dev-local backend-local frontend-local install

# Docker Compose 工作流程
up:
	docker compose up -d
	@echo ""
	@echo "Moodfolio is running:"
	@echo "  Frontend: http://localhost:8080"
	@echo "  Backend:  http://localhost:5000"
	@echo "  Swagger:  http://localhost:5000/swagger"

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

restart:
	docker compose restart

clean:
	docker compose down -v --rmi local

# 測試 (透過 Docker multi-stage build)
test:
	docker build --target test ./backend

# 本地開發 (不使用 Docker)
DOTNET := $(HOME)/.dotnet/dotnet

dev-local:
	@echo "Starting Moodfolio development servers..."
	@make -j2 backend-local frontend-local

backend-local:
	cd backend && $(DOTNET) run --project src/Moodfolio.Api --urls "http://0.0.0.0:5000"

frontend-local:
	cd frontend && pnpm dev --port 8080

install:
	cd backend && $(DOTNET) restore
	cd frontend && pnpm install
