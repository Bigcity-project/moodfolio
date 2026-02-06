using MediatR;
using Moodfolio.Application.Common.Interfaces;
using Moodfolio.Application.Stock.Services;
using Moodfolio.Contracts.V1.Responses;
using Moodfolio.Domain.ValueObjects;

namespace Moodfolio.Application.Stock.Queries;

public class GetStockAnalysisQueryHandler : IRequestHandler<GetStockAnalysisQuery, StockAnalysisResponse>
{
    private readonly IMarketDataProvider _marketDataProvider;
    private readonly IStockAnalyzer _stockAnalyzer;
    private readonly ITechnicalIndicatorCalculator _technicalCalculator;

    public GetStockAnalysisQueryHandler(
        IMarketDataProvider marketDataProvider,
        IStockAnalyzer stockAnalyzer,
        ITechnicalIndicatorCalculator technicalCalculator)
    {
        _marketDataProvider = marketDataProvider;
        _stockAnalyzer = stockAnalyzer;
        _technicalCalculator = technicalCalculator;
    }

    public async Task<StockAnalysisResponse> Handle(GetStockAnalysisQuery request, CancellationToken cancellationToken)
    {
        var tickerResult = Ticker.Create(request.Symbol);
        if (!tickerResult.IsSuccess)
        {
            throw new ArgumentException(tickerResult.Error);
        }

        var symbol = tickerResult.Value!.Value;

        // Fetch all data concurrently — each task catches its own errors
        var snapshotTask = _marketDataProvider.GetStockSnapshotAsync(symbol, cancellationToken);
        var newsTask = _marketDataProvider.GetStockNewsAsync(symbol, 20, cancellationToken);
        var chartTask = SafeAsync(() => _marketDataProvider.GetChartHistoryAsync(symbol, cancellationToken));
        var peersTask = SafeAsync(() => _marketDataProvider.GetPeerStocksAsync(symbol, cancellationToken));
        var financialsTask = SafeAsync(() => _marketDataProvider.GetFinancialStatementsAsync(symbol, cancellationToken));

        await Task.WhenAll(snapshotTask, newsTask, chartTask, peersTask, financialsTask);

        var snapshot = await snapshotTask;
        var news = await newsTask;
        var chartHistory = await chartTask;
        var peers = await peersTask;
        var financials = await financialsTask;

        if (snapshot is null)
        {
            throw new InvalidOperationException($"Stock '{symbol}' not found");
        }

        // Compute technical indicators from chart history
        var technicals = chartHistory is { Count: > 0 }
            ? _technicalCalculator.Calculate(chartHistory)
            : null;

        var analysis = await _stockAnalyzer.AnalyzeAsync(snapshot, news, cancellationToken);

        return new StockAnalysisResponse
        {
            Symbol = snapshot.Symbol,
            Name = snapshot.Name,
            Indicators = new StockIndicatorsDto
            {
                Price = snapshot.Price,
                Change = snapshot.Change,
                ChangePercent = snapshot.ChangePercent,
                Volume = snapshot.Volume,
                MarketCap = snapshot.MarketCap,
                TrailingPE = snapshot.TrailingPE,
                FiftyTwoWeekHigh = snapshot.FiftyTwoWeekHigh,
                FiftyTwoWeekLow = snapshot.FiftyTwoWeekLow,
                DayHigh = snapshot.DayHigh,
                DayLow = snapshot.DayLow,
            },
            News = news.Select(n => new NewsArticleDto
            {
                Title = n.Title,
                Url = n.Url,
                PublishedAt = n.PublishedAt,
                Description = n.Description,
            }).ToList(),
            Analysis = new StockAnalysisDto
            {
                Summary = analysis.Summary,
                Recommendation = analysis.Recommendation,
                Reasoning = analysis.Reasoning,
            },
            TechnicalIndicators = MapTechnicals(technicals),
            PeerStocks = MapPeers(peers),
            Financials = MapFinancials(financials),
            Timestamp = DateTimeOffset.UtcNow,
        };
    }

    private static TechnicalIndicatorsDto? MapTechnicals(Domain.Entities.TechnicalIndicatorSet? t)
    {
        if (t is null) return null;

        return new TechnicalIndicatorsDto
        {
            Rsi = t.Rsi,
            Macd = t.Macd is not null
                ? new MacdDto
                {
                    MacdLine = t.Macd.MacdLine,
                    SignalLine = t.Macd.SignalLine,
                    Histogram = t.Macd.Histogram,
                }
                : null,
            BollingerBands = t.BollingerBands is not null
                ? new BollingerBandsDto
                {
                    UpperBand = t.BollingerBands.UpperBand,
                    MiddleBand = t.BollingerBands.MiddleBand,
                    LowerBand = t.BollingerBands.LowerBand,
                }
                : null,
        };
    }

    private static IReadOnlyList<PeerStockDto>? MapPeers(IReadOnlyList<Domain.Entities.StockSnapshot>? peers)
    {
        if (peers is null or { Count: 0 }) return null;

        return peers.Select(p => new PeerStockDto
        {
            Symbol = p.Symbol,
            Name = p.Name,
            Price = p.Price,
            Change = p.Change,
            ChangePercent = p.ChangePercent,
        }).ToList();
    }

    private static FinancialStatementsDto? MapFinancials(Domain.Entities.FinancialStatements? f)
    {
        if (f is null) return null;

        return new FinancialStatementsDto
        {
            IncomeStatements = f.IncomeStatements.Select(i => new IncomeStatementQuarterDto
            {
                EndDate = i.EndDate,
                Revenue = i.Revenue,
                GrossProfit = i.GrossProfit,
                OperatingIncome = i.OperatingIncome,
                NetIncome = i.NetIncome,
                Eps = i.Eps,
            }).ToList(),
            BalanceSheets = f.BalanceSheets.Select(b => new BalanceSheetQuarterDto
            {
                EndDate = b.EndDate,
                TotalAssets = b.TotalAssets,
                TotalLiabilities = b.TotalLiabilities,
                TotalEquity = b.TotalEquity,
                Cash = b.Cash,
                TotalDebt = b.TotalDebt,
            }).ToList(),
            CashFlows = f.CashFlows.Select(c => new CashFlowQuarterDto
            {
                EndDate = c.EndDate,
                OperatingCashFlow = c.OperatingCashFlow,
                InvestingCashFlow = c.InvestingCashFlow,
                FinancingCashFlow = c.FinancingCashFlow,
                FreeCashFlow = c.FreeCashFlow,
                CapitalExpenditure = c.CapitalExpenditure,
            }).ToList(),
        };
    }

    private static async Task<T?> SafeAsync<T>(Func<Task<T>> func) where T : class
    {
        try
        {
            return await func();
        }
        catch
        {
            return null;
        }
    }
}
