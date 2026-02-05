# Sequence Diagrams

## 1. Market Weather API

```
┌──────────┐      ┌────────────────────┐      ┌────────────────────┐      ┌─────────────────┐
│ Frontend │      │ MarketWeather      │      │ GetMarketWeather   │      │ Services        │
│          │      │ Controller         │      │ QueryHandler       │      │                 │
└────┬─────┘      └─────────┬──────────┘      └─────────┬──────────┘      └────────┬────────┘
     │                      │                           │                          │
     │  GET /api/v1/market/weather                      │                          │
     │─────────────────────>│                           │                          │
     │                      │                           │                          │
     │                      │  Send(GetMarketWeatherQuery)                         │
     │                      │──────────────────────────>│                          │
     │                      │                           │                          │
     │                      │                           │  GetCurrentVixAsync()    │
     │                      │                           │─────────────────────────>│
     │                      │                           │                          │
     │                      │                           │          ┌───────────────┴───────────────┐
     │                      │                           │          │ YahooMarketDataProvider       │
     │                      │                           │          │   → Fetch VIX from Yahoo      │
     │                      │                           │          └───────────────┬───────────────┘
     │                      │                           │                          │
     │                      │                           │<─────────────────────────│
     │                      │                           │  vix = 18.5              │
     │                      │                           │                          │
     │                      │                           │  CalculateRsiAsync("SPY", 14)
     │                      │                           │─────────────────────────>│
     │                      │                           │                          │
     │                      │                           │          ┌───────────────┴───────────────┐
     │                      │                           │          │ Calculate RSI from           │
     │                      │                           │          │ 14-day price history          │
     │                      │                           │          └───────────────┬───────────────┘
     │                      │                           │                          │
     │                      │                           │<─────────────────────────│
     │                      │                           │  rsi = 55.2              │
     │                      │                           │                          │
     │                      │          ┌────────────────┴──────────────────┐       │
     │                      │          │ MoodScoreCalculator.Calculate()   │       │
     │                      │          │                                   │       │
     │                      │          │ normalized_vix = vix / 80         │       │
     │                      │          │ normalized_rsi = rsi / 100        │       │
     │                      │          │                                   │       │
     │                      │          │ score = ((1 - norm_vix) * 0.6     │       │
     │                      │          │        + norm_rsi * 0.4) * 100    │       │
     │                      │          │                                   │       │
     │                      │          │ = ((1 - 0.23) * 0.6 + 0.55 * 0.4) │       │
     │                      │          │ = (0.46 + 0.22) * 100             │       │
     │                      │          │ = 68                              │       │
     │                      │          └────────────────┬──────────────────┘       │
     │                      │                           │                          │
     │                      │          ┌────────────────┴──────────────────┐       │
     │                      │          │ WeatherClassifier.Classify(68)    │       │
     │                      │          │                                   │       │
     │                      │          │ 68 >= 60 → WeatherType.Sunny      │       │
     │                      │          └────────────────┬──────────────────┘       │
     │                      │                           │                          │
     │                      │          ┌────────────────┴──────────────────┐       │
     │                      │          │ TrendAnalyzer.Analyze(68, prev)   │       │
     │                      │          │                                   │       │
     │                      │          │ No previous → Trend.Neutral       │       │
     │                      │          └────────────────┬──────────────────┘       │
     │                      │                           │                          │
     │                      │<──────────────────────────│                          │
     │                      │  MarketWeatherResponse    │                          │
     │                      │  {                        │                          │
     │                      │    moodScore: 68          │                          │
     │                      │    weatherType: "SUNNY"   │                          │
     │                      │    trend: "NEUTRAL"       │                          │
     │                      │    mainFactors: [...]     │                          │
     │                      │  }                        │                          │
     │                      │                           │                          │
     │<─────────────────────│                           │                          │
     │  200 OK              │                           │                          │
     │  { moodScore: 68, ...}                           │                          │
     │                      │                           │                          │
```

## 2. Do-Nothing Simulation API

```
┌──────────┐      ┌───────────────┐      ┌─────────────────────┐      ┌───────────────────┐
│ Frontend │      │ Simulation    │      │ RunDoNothing        │      │ Services          │
│          │      │ Controller    │      │ SimulationHandler   │      │                   │
└────┬─────┘      └───────┬───────┘      └──────────┬──────────┘      └─────────┬─────────┘
     │                    │                         │                           │
     │  POST /api/v1/simulation/do_nothing          │                           │
     │  { transactions: [...] }                     │                           │
     │───────────────────>│                         │                           │
     │                    │                         │                           │
     │                    │  ┌─────────────────────────────────────┐            │
     │                    │  │ FluentValidation                    │            │
     │                    │  │ - transactions.Length >= 1          │            │
     │                    │  │ - Each: date, symbol, action, qty   │            │
     │                    │  └─────────────────────────────────────┘            │
     │                    │                         │                           │
     │                    │  Send(RunDoNothingSimulationCommand)                │
     │                    │────────────────────────>│                           │
     │                    │                         │                           │
     │                    │                         │  MapToTransactions()      │
     │                    │                         │  ──────────────────       │
     │                    │                         │  TransactionDto[]         │
     │                    │                         │  → Transaction[]          │
     │                    │                         │                           │
     │                    │                         │  GetHistoricalPricesAsync("SPY")
     │                    │                         │──────────────────────────>│
     │                    │                         │                           │
     │                    │                         │          ┌────────────────┴─────────────┐
     │                    │                         │          │ Yahoo Finance API            │
     │                    │                         │          │ Fetch SPY price history      │
     │                    │                         │          └────────────────┬─────────────┘
     │                    │                         │<──────────────────────────│
     │                    │                         │  spyPrices[]              │
     │                    │                         │                           │
     │                    │                         │  GetHistoricalPricesAsync(symbols)
     │                    │                         │──────────────────────────>│
     │                    │                         │                           │
     │                    │                         │          ┌────────────────┴─────────────┐
     │                    │                         │          │ Fetch price history for      │
     │                    │                         │          │ each unique symbol           │
     │                    │                         │          │ (AAPL, MSFT, GOOGL, ...)     │
     │                    │                         │          └────────────────┬─────────────┘
     │                    │                         │<──────────────────────────│
     │                    │                         │  portfolioPrices{}        │
     │                    │                         │                           │
     │                    │         ┌───────────────┴────────────────────┐      │
     │                    │         │ PortfolioCalculator                │      │
     │                    │         │                                    │      │
     │                    │         │ CalculateInitialInvestment()       │      │
     │                    │         │ = sum(BUY transactions * price)    │      │
     │                    │         │                                    │      │
     │                    │         │ CalculateCurrentValue()            │      │
     │                    │         │ = net shares * current prices      │      │
     │                    │         │                                    │      │
     │                    │         │ CalculateReturnPct()               │      │
     │                    │         │ = (current - initial) / initial    │      │
     │                    │         └───────────────┬────────────────────┘      │
     │                    │                         │                           │
     │                    │         ┌───────────────┴────────────────────┐      │
     │                    │         │ BenchmarkSimulator                 │      │
     │                    │         │                                    │      │
     │                    │         │ CalculateDoNothingReturn()         │      │
     │                    │         │ = (SPY_end - SPY_start) / SPY_start│      │
     │                    │         │                                    │      │
     │                    │         │ GenerateChartData()                │      │
     │                    │         │ = daily comparison of actual vs    │      │
     │                    │         │   do-nothing portfolio values      │      │
     │                    │         └───────────────┬────────────────────┘      │
     │                    │                         │                           │
     │                    │         ┌───────────────┴────────────────────┐      │
     │                    │         │ VerdictGenerator.Generate()        │      │
     │                    │         │                                    │      │
     │                    │         │ if drag > 0:                       │      │
     │                    │         │   "You beat doing nothing by X%"   │      │
     │                    │         │ else:                              │      │
     │                    │         │   "Your trading cost you X%"       │      │
     │                    │         └───────────────┬────────────────────┘      │
     │                    │                         │                           │
     │                    │<────────────────────────│                           │
     │                    │  DoNothingSimulationResponse                        │
     │                    │  {                      │                           │
     │                    │    actualReturnPct: -15.5                           │
     │                    │    doNothingReturnPct: 10.2                         │
     │                    │    performanceDrag: -25.7                           │
     │                    │    verdict: "Your trading cost you..."              │
     │                    │    chartData: [...]     │                           │
     │                    │  }                      │                           │
     │                    │                         │                           │
     │<───────────────────│                         │                           │
     │  200 OK            │                         │                           │
     │                    │                         │                           │
```

## 3. Portfolio Persona API

```
┌──────────┐      ┌───────────────┐      ┌─────────────────────┐      ┌───────────────────┐
│ Frontend │      │ Analysis      │      │ AnalyzePersona      │      │ Services          │
│          │      │ Controller    │      │ CommandHandler      │      │                   │
└────┬─────┘      └───────┬───────┘      └──────────┬──────────┘      └─────────┬─────────┘
     │                    │                         │                           │
     │  POST /api/v1/analysis/persona               │                           │
     │  { transactions: [...] }                     │                           │
     │───────────────────>│                         │                           │
     │                    │                         │                           │
     │                    │  Send(AnalyzePersonaCommand)                        │
     │                    │────────────────────────>│                           │
     │                    │                         │                           │
     │                    │                         │  GetLatestMarketDataAsync()
     │                    │                         │──────────────────────────>│
     │                    │                         │<──────────────────────────│
     │                    │                         │  marketData (VIX history) │
     │                    │                         │                           │
     │                    │         ┌───────────────┴────────────────────┐      │
     │                    │         │ HoldingPeriodCalculator            │      │
     │                    │         │                                    │      │
     │                    │         │ For each symbol:                   │      │
     │                    │         │   Match BUY → SELL pairs           │      │
     │                    │         │   holding_days = SELL.date -       │      │
     │                    │         │                  BUY.date          │      │
     │                    │         │                                    │      │
     │                    │         │ avgHoldingDays = mean(all pairs)   │      │
     │                    │         │                                    │      │
     │                    │         │ Example: 45.3 days                 │      │
     │                    │         └───────────────┬────────────────────┘      │
     │                    │                         │                           │
     │                    │         ┌───────────────┴────────────────────┐      │
     │                    │         │ TurnoverRateCalculator             │      │
     │                    │         │                                    │      │
     │                    │         │ turnover = (total_sells * 2)       │      │
     │                    │         │          / avg_portfolio_value     │      │
     │                    │         │          * 100%                    │      │
     │                    │         │                                    │      │
     │                    │         │ Example: 250.5%                    │      │
     │                    │         └───────────────┬────────────────────┘      │
     │                    │                         │                           │
     │                    │         ┌───────────────┴────────────────────┐      │
     │                    │         │ PanicSellRatioCalculator           │      │
     │                    │         │                                    │      │
     │                    │         │ panic_sells = SELLs where          │      │
     │                    │         │               VIX > 30             │      │
     │                    │         │                                    │      │
     │                    │         │ ratio = panic_sells / total_sells  │      │
     │                    │         │       * 100%                       │      │
     │                    │         │                                    │      │
     │                    │         │ Example: 35.0%                     │      │
     │                    │         └───────────────┬────────────────────┘      │
     │                    │                         │                           │
     │                    │         ┌───────────────┴────────────────────┐      │
     │                    │         │ WinRateCalculator                  │      │
     │                    │         │                                    │      │
     │                    │         │ winning = SELLs where              │      │
     │                    │         │           sell_price > buy_price   │      │
     │                    │         │                                    │      │
     │                    │         │ winRate = winning / total_sells    │      │
     │                    │         │         * 100%                     │      │
     │                    │         │                                    │      │
     │                    │         │ Example: 55.0%                     │      │
     │                    │         └───────────────┬────────────────────┘      │
     │                    │                         │                           │
     │                    │         ┌───────────────┴────────────────────┐      │
     │                    │         │ PersonaClassifier.Classify()       │      │
     │                    │         │                                    │      │
     │                    │         │ Rules (priority order):            │      │
     │                    │         │                                    │      │
     │                    │         │ 1. PanicSeller                     │      │
     │                    │         │    if panicSellRatio > 60%         │      │
     │                    │         │                                    │      │
     │                    │         │ 2. DayTrader                       │      │
     │                    │         │    if avgHolding < 3 days          │      │
     │                    │         │    AND turnover > 500%             │      │
     │                    │         │                                    │      │
     │                    │         │ 3. Sniper                          │      │
     │                    │         │    if turnover < 100%              │      │
     │                    │         │    AND winRate > 70%               │      │
     │                    │         │                                    │      │
     │                    │         │ 4. Hodler (default)                │      │
     │                    │         │    if avgHolding > 365 days        │      │
     │                    │         │    OR turnover < 20%               │      │
     │                    │         │                                    │      │
     │                    │         │ Example: PersonaId.Hodler          │      │
     │                    │         └───────────────┬────────────────────┘      │
     │                    │                         │                           │
     │                    │<────────────────────────│                           │
     │                    │  PersonaAnalysisResponse                            │
     │                    │  {                      │                           │
     │                    │    personaId: "HODLER"  │                           │
     │                    │    displayName: "The HODLer"                        │
     │                    │    traits: ["Long-term holder", ...]                │
     │                    │    description: "You believe in..."                 │
     │                    │    advice: "Keep doing..."                          │
     │                    │    stats: {             │                           │
     │                    │      avgHoldingDays: 45.3                           │
     │                    │      turnoverRate: 250.5                            │
     │                    │      panicSellRatio: 35.0                           │
     │                    │      winRate: 55.0      │                           │
     │                    │    }                    │                           │
     │                    │  }                      │                           │
     │                    │                         │                           │
     │<───────────────────│                         │                           │
     │  200 OK            │                         │                           │
     │                    │                         │                           │
```

## Component Interaction Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    Frontend                                          │
│  ┌───────────┐         ┌─────────────────────┐         ┌──────────────────┐        │
│  │  MoodCard │◄───────►│  Dashboard (page)   │◄───────►│  DoNothing       │        │
│  │  MoodOrb  │         │  - State management │         │  Simulator       │        │
│  └───────────┘         │  - Tab navigation   │         │  (Recharts)      │        │
│                        │  - Error handling   │         └──────────────────┘        │
│                        └──────────┬──────────┘                                      │
│                                   │                    ┌──────────────────┐        │
│                                   │                    │  PersonaCard     │        │
│                                   │                    └──────────────────┘        │
│                        ┌──────────▼──────────┐                                      │
│                        │    api-client.ts    │                                      │
│                        │  - getMarketWeather │                                      │
│                        │  - runSimulation    │                                      │
│                        │  - analyzePersona   │                                      │
│                        └──────────┬──────────┘                                      │
└───────────────────────────────────┼─────────────────────────────────────────────────┘
                                    │ HTTP
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    Backend                                           │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │                              Controllers                                      │  │
│  │  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────────┐          │  │
│  │  │ MarketWeather   │  │ Simulation       │  │ Analysis           │          │  │
│  │  └────────┬────────┘  └────────┬─────────┘  └──────────┬─────────┘          │  │
│  └───────────┼────────────────────┼────────────────────────┼────────────────────┘  │
│              │                    │                        │                        │
│  ┌───────────▼────────────────────▼────────────────────────▼────────────────────┐  │
│  │                           MediatR Pipeline                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐ │  │
│  │  │ FluentValidation → Handler Dispatch → Response                          │ │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │                            Application Services                               │  │
│  │  MarketWeather:              DoNothing:              Persona:                │  │
│  │  - MoodScoreCalculator       - PortfolioCalculator   - HoldingPeriodCalc    │  │
│  │  - WeatherClassifier         - BenchmarkSimulator    - TurnoverRateCalc     │  │
│  │  - TrendAnalyzer             - VerdictGenerator      - PanicSellRatioCalc   │  │
│  │                                                       - WinRateCalculator    │  │
│  │                                                       - PersonaClassifier    │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                                    │                                                │
│  ┌─────────────────────────────────▼────────────────────────────────────────────┐  │
│  │                            Infrastructure                                     │  │
│  │  ┌───────────────────────────┐    ┌─────────────────────────────────────┐   │  │
│  │  │ YahooMarketDataProvider   │    │ MoodfolioDbContext (EF Core)        │   │  │
│  │  │ - GetCurrentVixAsync()    │    │ - UserTransactions                  │   │  │
│  │  │ - GetHistoricalPricesAsync│    │ - MarketDataCache                   │   │  │
│  │  │ - CalculateRsiAsync()     │    │                                     │   │  │
│  │  └───────────┬───────────────┘    └──────────────────┬──────────────────┘   │  │
│  └──────────────┼───────────────────────────────────────┼──────────────────────┘  │
└─────────────────┼───────────────────────────────────────┼──────────────────────────┘
                  │                                       │
                  ▼                                       ▼
         ┌───────────────┐                       ┌───────────────┐
         │ Yahoo Finance │                       │    SQLite     │
         │     API       │                       │   Database    │
         └───────────────┘                       └───────────────┘
```
