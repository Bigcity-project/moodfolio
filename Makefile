.PHONY: dev backend frontend install build test clean

DOTNET := $(HOME)/.dotnet/dotnet

# 同時啟動前後端
dev:
	@echo "Starting Moodfolio development servers..."
	@make -j2 backend frontend

# 啟動後端 (port 5000)
backend:
	cd backend && $(DOTNET) run --project src/Moodfolio.Api --urls "http://localhost:5000"

# 啟動前端 (port 8080)
frontend:
	cd frontend && pnpm dev --port 8080

# 安裝依賴
install:
	cd backend && $(DOTNET) restore
	cd frontend && pnpm install

# 建置
build:
	cd backend && $(DOTNET) build
	cd frontend && pnpm build

# 測試
test:
	cd backend && $(DOTNET) test
	cd frontend && pnpm test

# 清理
clean:
	cd backend && $(DOTNET) clean
	cd frontend && rm -rf .next node_modules
