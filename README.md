# Moodfolio

Investment Decision Support System - Understand your trading psychology with AI-powered market analysis.

## Features

| Feature | Description |
|---------|-------------|
| **Market Weather** | Real-time market mood score (0-100) based on VIX and RSI indicators, classified as Sunny/Cloudy/Rainy/Stormy |
| **Do-Nothing Simulator** | Compare your actual portfolio performance against a passive SPY holding strategy |
| **Portfolio Persona** | Discover your investor personality type (HODLer, Day Trader, Panic Seller, Sniper) based on trading patterns |

## Tech Stack

### Backend
- .NET 8 (LTS) + ASP.NET Core Web API
- MediatR (CQRS pattern)
- FluentValidation
- Entity Framework Core + SQLite
- YahooQuotesApi for market data

### Frontend
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Framer Motion (animations)
- Recharts (charts)

### Quality
- xUnit + FluentAssertions (126 tests)
- StyleCop.Analyzers + Roslynator (static analysis)
- Central Package Management

## Quick Start

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- pnpm (recommended) or npm

### Backend

```bash
cd backend
dotnet restore
dotnet build
dotnet run --project src/Moodfolio.Api
```

API will be available at `http://localhost:5000`

Swagger UI: `http://localhost:5000/swagger`

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

App will be available at `http://localhost:3000`

### Run Tests

```bash
cd backend
dotnet test
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/market/weather` | Get current market mood and weather classification |
| POST | `/api/v1/simulation/do_nothing` | Run do-nothing simulation with transaction history |
| POST | `/api/v1/analysis/persona` | Analyze portfolio persona from trading patterns |

### Example Requests

**Market Weather**
```bash
curl http://localhost:5000/api/v1/market/weather
```

**Do-Nothing Simulation**
```bash
curl -X POST http://localhost:5000/api/v1/simulation/do_nothing \
  -H "Content-Type: application/json" \
  -d '{
    "transactions": [
      {"date": "2024-01-15", "symbol": "AAPL", "action": "BUY", "quantity": 10, "price": 185.50},
      {"date": "2024-02-20", "symbol": "AAPL", "action": "SELL", "quantity": 5, "price": 175.00}
    ]
  }'
```

**Portfolio Persona**
```bash
curl -X POST http://localhost:5000/api/v1/analysis/persona \
  -H "Content-Type: application/json" \
  -d '{
    "transactions": [
      {"date": "2024-01-15", "symbol": "AAPL", "action": "BUY", "quantity": 10, "price": 185.50},
      {"date": "2024-02-20", "symbol": "AAPL", "action": "SELL", "quantity": 5, "price": 175.00}
    ]
  }'
```

## Project Structure

```
moodfolio/
├── backend/                          # .NET 8 Backend
│   ├── src/
│   │   ├── Moodfolio.Api/           # Web API Controllers
│   │   ├── Moodfolio.Application/   # Business Logic (CQRS Handlers)
│   │   ├── Moodfolio.Domain/        # Domain Models
│   │   ├── Moodfolio.Contracts/     # DTOs & Validators
│   │   └── Moodfolio.Infrastructure/# External Services (Yahoo, SQLite)
│   └── tests/                        # Unit & Integration Tests
│
├── frontend/                         # Next.js 14 Frontend
│   ├── src/
│   │   ├── app/                     # Pages (Landing, Dashboard)
│   │   ├── components/              # UI Components
│   │   └── lib/                     # API Client, Utilities
│   └── package.json
│
├── contracts/
│   └── openapi.yaml                 # OpenAPI 3.0 Specification
│
└── docs/
    ├── ARCHITECTURE.md              # System Architecture
    ├── SEQUENCE-DIAGRAMS.md         # API Sequence Diagrams
    └── USER-FLOW.md                 # User Journey Documentation
```

## Architecture

The system follows **Clean Architecture** principles:

```
┌─────────────────────────────────────────┐
│             Moodfolio.Api               │  ← Controllers
├─────────────────────────────────────────┤
│         Moodfolio.Application           │  ← Business Logic
├─────────────────────────────────────────┤
│           Moodfolio.Domain              │  ← Domain Models
├─────────────────────────────────────────┤
│        Moodfolio.Infrastructure         │  ← External Services
├─────────────────────────────────────────┤
│          Moodfolio.Contracts            │  ← DTOs & Validators
└─────────────────────────────────────────┘
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

## Business Logic

### Mood Score Calculation

```
Score = ((1 - VIX/80) * 0.6 + RSI/100 * 0.4) * 100
```

| Score Range | Weather |
|-------------|---------|
| 0-29 | Stormy |
| 30-49 | Rainy |
| 50-69 | Cloudy |
| 70-100 | Sunny |

### Persona Classification

| Persona | Criteria |
|---------|----------|
| HODLer | Avg holding > 365 days OR Turnover < 20% |
| Day Trader | Avg holding < 3 days AND Turnover > 500% |
| Panic Seller | Panic sell ratio > 60% |
| Sniper | Turnover < 100% AND Win rate > 70% |

## Development

### Code Style

The project uses:
- **StyleCop.Analyzers** for C# code style
- **Roslynator** for additional code analysis
- **Prettier** for TypeScript/JavaScript formatting

Configuration in:
- `backend/.editorconfig`
- `backend/Directory.Build.props`
- `frontend/.prettierrc`

### Adding New Features

1. Define contracts in `Moodfolio.Contracts`
2. Add domain models in `Moodfolio.Domain`
3. Implement services in `Moodfolio.Application`
4. Add controller in `Moodfolio.Api`
5. Write tests in corresponding test project
6. Update `contracts/openapi.yaml`

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and layer structure
- [Sequence Diagrams](docs/SEQUENCE-DIAGRAMS.md) - API flow visualizations
- [User Flow](docs/USER-FLOW.md) - User journey and state management

## License

MIT
