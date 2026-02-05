# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Moodfolio is an Investment Decision Support System that helps users understand their trading psychology with AI-powered market analysis. Full-stack application with .NET 8 backend and Next.js 14 frontend.

## Quick Start

```bash
# 安裝依賴
make install

# 同時啟動前後端開發伺服器
make dev

# 或分別啟動
make backend  # http://localhost:5000
make frontend # http://localhost:8080
```

## Common Commands

### Using Makefile (Recommended)
```bash
make install   # Install all dependencies
make dev       # Start both frontend and backend
make backend   # Start backend only (port 5000)
make frontend  # Start frontend only (port 8080)
make build     # Build both projects
make test      # Run all tests
make clean     # Clean build artifacts
```

### Backend (.NET)
```bash
# Build and run
dotnet build
dotnet run --project backend/src/Moodfolio.Api

# Run all tests (126 tests across 4 projects)
dotnet test

# Run specific test project
dotnet test backend/tests/Moodfolio.Domain.Tests

# Run single test
dotnet test --filter "FullyQualifiedName~TestMethodName"

# Swagger UI available at http://localhost:5000/swagger
```

### Frontend (Next.js)
```bash
cd frontend

# Install dependencies
pnpm install

# Development server (port 8080)
pnpm dev --port 8080

# Build and lint
pnpm build
pnpm lint

# Generate TypeScript types from OpenAPI
cd scripts && ./generate-client.sh
```

## Architecture

### Backend: Clean Architecture with CQRS
```
backend/src/
├── Moodfolio.Api/          # Controllers - HTTP entry points
├── Moodfolio.Application/  # MediatR handlers - business logic (CQRS)
├── Moodfolio.Domain/       # Entities, value objects, enums
├── Moodfolio.Contracts/    # DTOs, validators (FluentValidation)
└── Moodfolio.Infrastructure/  # External services (Yahoo Finance), EF Core
```

**Key patterns:**
- Queries (read): `GetMarketWeatherQuery`
- Commands (write): `RunDoNothingSimulationCommand`, `AnalyzePersonaCommand`
- Result pattern for error handling (`Result.cs`)
- Value objects: `MoodScore`, `DateRange`

### Frontend: Next.js App Router
```
frontend/src/
├── app/           # Pages (layout.tsx, page.tsx, dashboard/)
├── components/    # React components (MoodCard, MoodOrb, PersonaCard)
├── lib/           # API client, utilities
└── types/         # Generated TypeScript types from OpenAPI
```

### API Contract
- OpenAPI spec at `contracts/openapi.yaml` is source of truth
- Types auto-generated to `frontend/src/types/api-types.ts`

## Key Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/market/weather` | Market mood score (0-100) with weather classification |
| POST | `/api/v1/simulation/do_nothing` | Compare actual vs passive SPY holding |
| POST | `/api/v1/analysis/persona` | Analyze investor personality from trading history |

## Tech Stack
- **Backend:** .NET 8, ASP.NET Core, EF Core + SQLite, MediatR, FluentValidation, YahooQuotesApi
- **Frontend:** Next.js 14, TypeScript 5, TailwindCSS, Framer Motion, Recharts, Radix UI
- **Testing:** xUnit + FluentAssertions + Moq (backend), Playwright + Vitest (frontend)
- **Analysis:** StyleCop, Roslynator (backend), ESLint (frontend)

## Development Workflow
1. Define API contract in `contracts/openapi.yaml`
2. Generate frontend types: `./scripts/generate-client.sh`
3. Backend: DTO in Contracts → Domain model → MediatR handler → Controller → Tests
4. Frontend: Use generated types → Build components → Integrate with `lib/api-client.ts`

## Code Style Rules
- **Immutability:** Always create new objects, never mutate existing ones
- **File size:** 200-400 lines typical, 800 max
- **Functions:** Keep under 50 lines
- **Nesting:** Maximum 4 levels deep
- **Package versions:** Managed centrally in `backend/Directory.Packages.props`
