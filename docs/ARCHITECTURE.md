# Architecture

## System Overview

Moodfolio is a monorepo-based investment decision support system built with Clean Architecture principles.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Client Layer                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Next.js 14 Frontend                              │   │
│  │  ┌──────────────┐  ┌────────────────────┐  ┌──────────────────┐    │   │
│  │  │   MoodCard   │  │ DoNothingSimulator │  │   PersonaCard    │    │   │
│  │  │   MoodOrb    │  │     (Recharts)     │  │                  │    │   │
│  │  └──────────────┘  └────────────────────┘  └──────────────────┘    │   │
│  │                         ↓ HTTP/REST                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API Layer                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    ASP.NET Core Web API                              │   │
│  │  ┌────────────────────┐  ┌────────────────┐  ┌──────────────────┐  │   │
│  │  │ MarketWeather      │  │ Simulation     │  │ Analysis         │  │   │
│  │  │ Controller         │  │ Controller     │  │ Controller       │  │   │
│  │  │ GET /weather       │  │ POST /do_nothing│  │ POST /persona    │  │   │
│  │  └────────────────────┘  └────────────────┘  └──────────────────┘  │   │
│  │                         ↓ MediatR                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Application Layer                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      CQRS Handlers (MediatR)                         │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │ GetMarketWeatherQueryHandler                                 │   │   │
│  │  │   ├─ IMoodScoreCalculator    → (1 - VIX_norm)*0.6 + RSI*0.4 │   │   │
│  │  │   ├─ IWeatherClassifier      → Score → Sunny/Cloudy/Rainy   │   │   │
│  │  │   └─ ITrendAnalyzer          → Compare with previous        │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │ RunDoNothingSimulationCommandHandler                         │   │   │
│  │  │   ├─ IPortfolioCalculator    → Actual return calculation    │   │   │
│  │  │   ├─ IBenchmarkSimulator     → SPY do-nothing return        │   │   │
│  │  │   └─ IVerdictGenerator       → Performance comparison text  │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │ AnalyzePersonaCommandHandler                                 │   │   │
│  │  │   ├─ IHoldingPeriodCalculator → Avg holding days            │   │   │
│  │  │   ├─ ITurnoverRateCalculator  → Portfolio turnover %        │   │   │
│  │  │   ├─ IPanicSellRatioCalculator→ Sells during high VIX       │   │   │
│  │  │   ├─ IWinRateCalculator       → Profitable trade %          │   │   │
│  │  │   └─ IPersonaClassifier       → HODLer/DayTrader/etc        │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Domain Layer                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Pure Domain Models (No Dependencies)              │   │
│  │                                                                       │   │
│  │  Value Objects:           Entities:              Enums:              │   │
│  │  ├─ MoodScore (0-100)     ├─ Transaction         ├─ WeatherType     │   │
│  │  └─ DateRange             ├─ DailyPrice          ├─ TransactionAction│   │
│  │                           └─ DailyMarketData     └─ PersonaId       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Infrastructure Layer                                 │
│  ┌───────────────────────────────┐  ┌───────────────────────────────────┐  │
│  │      YahooMarketDataProvider  │  │        MoodfolioDbContext         │  │
│  │  ┌─────────────────────────┐  │  │  ┌─────────────────────────────┐  │  │
│  │  │   YahooQuotesApi        │  │  │  │   SQLite + EF Core          │  │  │
│  │  │   (NodaTime types)      │  │  │  │                             │  │  │
│  │  │   - GetCurrentVix()     │  │  │  │   Tables:                   │  │  │
│  │  │   - GetHistoricalPrices │  │  │  │   - UserTransactions        │  │  │
│  │  │   - CalculateRsi()      │  │  │  │   - MarketDataCache         │  │  │
│  │  └─────────────────────────┘  │  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────┘  └───────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           External Services                                  │
│  ┌───────────────────────────────┐  ┌───────────────────────────────────┐  │
│  │        Yahoo Finance API      │  │           SQLite Database         │  │
│  │   - VIX Index                 │  │   - moodfolio.db                  │  │
│  │   - Stock Prices              │  │                                   │  │
│  │   - Historical Data           │  │                                   │  │
│  └───────────────────────────────┘  └───────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
moodfolio/
├── backend/                              # .NET 8 Backend
│   ├── src/
│   │   ├── Moodfolio.Api/               # Web API Layer
│   │   │   ├── Controllers/
│   │   │   │   ├── MarketWeatherController.cs
│   │   │   │   ├── SimulationController.cs
│   │   │   │   └── AnalysisController.cs
│   │   │   └── Program.cs               # DI Configuration
│   │   │
│   │   ├── Moodfolio.Application/       # Business Logic Layer
│   │   │   ├── Common/Interfaces/
│   │   │   │   └── IMarketDataProvider.cs
│   │   │   ├── MarketWeather/
│   │   │   │   ├── Queries/
│   │   │   │   └── Services/
│   │   │   ├── DoNothingSimulation/
│   │   │   │   ├── Commands/
│   │   │   │   └── Services/
│   │   │   └── PortfolioPersona/
│   │   │       ├── Commands/
│   │   │       └── Services/
│   │   │
│   │   ├── Moodfolio.Domain/            # Domain Models
│   │   │   ├── Entities/
│   │   │   ├── ValueObjects/
│   │   │   ├── Enums/
│   │   │   └── Common/
│   │   │
│   │   ├── Moodfolio.Contracts/         # DTOs & Validators
│   │   │   ├── V1/
│   │   │   │   ├── Requests/
│   │   │   │   ├── Responses/
│   │   │   │   └── Shared/
│   │   │   └── Validators/
│   │   │
│   │   └── Moodfolio.Infrastructure/    # External Dependencies
│   │       ├── Data/
│   │       │   └── MoodfolioDbContext.cs
│   │       └── MarketData/
│   │           └── YahooMarketDataProvider.cs
│   │
│   ├── tests/                           # Test Projects
│   │   ├── Moodfolio.Domain.Tests/
│   │   ├── Moodfolio.Application.Tests/
│   │   ├── Moodfolio.Contracts.Tests/
│   │   └── Moodfolio.IntegrationTests/
│   │
│   ├── Directory.Build.props            # Central Build Settings
│   ├── Directory.Packages.props         # Central Package Management
│   └── .editorconfig                    # Code Style & Analyzers
│
├── frontend/                            # Next.js 14 Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                # Landing Page
│   │   │   ├── layout.tsx
│   │   │   └── dashboard/page.tsx      # Main Dashboard
│   │   ├── components/
│   │   │   ├── MoodOrb.tsx             # Animated Mood Sphere
│   │   │   ├── MoodCard.tsx            # Weather Display Card
│   │   │   ├── DoNothingSimulator.tsx  # Simulation Chart
│   │   │   └── PersonaCard.tsx         # Persona Display
│   │   └── lib/
│   │       └── api-client.ts           # API Client
│   └── package.json
│
├── contracts/
│   └── openapi.yaml                    # OpenAPI 3.0 Specification
│
└── docs/
    ├── ARCHITECTURE.md                 # This file
    ├── SEQUENCE-DIAGRAMS.md
    └── USER-FLOW.md
```

## Layer Dependencies

```
┌─────────────────────────────────────────────────┐
│                  Moodfolio.Api                  │
│              (ASP.NET Core Web API)             │
└────────────────────┬────────────────────────────┘
                     │ depends on
                     ▼
┌─────────────────────────────────────────────────┐
│             Moodfolio.Application               │
│            (Business Logic, MediatR)            │
└────────────────────┬────────────────────────────┘
                     │ depends on
                     ▼
┌─────────────────────────────────────────────────┐
│               Moodfolio.Domain                  │
│       (Entities, Value Objects, Enums)          │
└─────────────────────────────────────────────────┘
                     ▲
                     │ depends on
┌────────────────────┴────────────────────────────┐
│           Moodfolio.Infrastructure              │
│          (EF Core, Yahoo Finance API)           │
└─────────────────────────────────────────────────┘
                     ▲
                     │ depends on
┌────────────────────┴────────────────────────────┐
│             Moodfolio.Contracts                 │
│         (DTOs, Validators, Shared Types)        │
└─────────────────────────────────────────────────┘
```

## Key Design Patterns

### 1. CQRS with MediatR

```csharp
// Query (Read)
public record GetMarketWeatherQuery : IRequest<MarketWeatherResponse>;

// Command (Write)
public record RunDoNothingSimulationCommand(DoNothingSimulationRequest Request)
    : IRequest<DoNothingSimulationResponse>;
```

### 2. Repository Pattern (via EF Core)

```csharp
public class MoodfolioDbContext : DbContext
{
    public DbSet<UserTransactionEntity> Transactions { get; set; }
    public DbSet<MarketDataCacheEntity> MarketDataCache { get; set; }
}
```

### 3. Strategy Pattern (Service Interfaces)

```csharp
public interface IMoodScoreCalculator
{
    MoodScore Calculate(decimal vix, decimal rsi);
}

public interface IWeatherClassifier
{
    WeatherType Classify(MoodScore score);
}
```

### 4. Result Pattern (Error Handling)

```csharp
public class Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }
}
```

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Next.js | 14.x |
| Frontend | TypeScript | 5.x |
| Frontend | TailwindCSS | 3.x |
| Frontend | Framer Motion | 11.x |
| Frontend | Recharts | 2.x |
| Backend | .NET | 8.0 (LTS) |
| Backend | ASP.NET Core | 8.0 |
| Backend | MediatR | 14.0 |
| Backend | FluentValidation | 12.1 |
| Database | SQLite | 3.x |
| ORM | EF Core | 8.0 |
| Market Data | YahooQuotesApi | 5.4 |
| Testing | xUnit | 2.9 |
| Testing | FluentAssertions | 8.2 |
| Static Analysis | StyleCop.Analyzers | 1.2.0-beta |
| Static Analysis | Roslynator | 4.13 |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/market/weather` | Get current market mood and weather |
| POST | `/api/v1/simulation/do_nothing` | Run do-nothing simulation |
| POST | `/api/v1/analysis/persona` | Analyze portfolio persona |

## Data Flow

1. **Frontend** sends request via `api-client.ts`
2. **Controller** receives request, validates via FluentValidation
3. **MediatR** dispatches to appropriate handler
4. **Handler** orchestrates domain services
5. **Services** perform business logic calculations
6. **Infrastructure** fetches external data (Yahoo Finance) or persists data (SQLite)
7. **Response** flows back through layers to frontend
