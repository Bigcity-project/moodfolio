using MediatR;
using Moodfolio.Application.Common.Interfaces;
using Moodfolio.Contracts.V1.Responses;
using Moodfolio.Domain.ValueObjects;

namespace Moodfolio.Application.Stock.Queries;

public class GetStockAnalysisQueryHandler : IRequestHandler<GetStockAnalysisQuery, StockAnalysisResponse>
{
    private readonly IMarketDataProvider _marketDataProvider;
    private readonly IStockAnalyzer _stockAnalyzer;

    public GetStockAnalysisQueryHandler(
        IMarketDataProvider marketDataProvider,
        IStockAnalyzer stockAnalyzer)
    {
        _marketDataProvider = marketDataProvider;
        _stockAnalyzer = stockAnalyzer;
    }

    public async Task<StockAnalysisResponse> Handle(GetStockAnalysisQuery request, CancellationToken cancellationToken)
    {
        var tickerResult = Ticker.Create(request.Symbol);
        if (!tickerResult.IsSuccess)
        {
            throw new ArgumentException(tickerResult.Error);
        }

        var symbol = tickerResult.Value!.Value;

        var snapshotTask = _marketDataProvider.GetStockSnapshotAsync(symbol, cancellationToken);
        var newsTask = _marketDataProvider.GetStockNewsAsync(symbol, 20, cancellationToken);

        await Task.WhenAll(snapshotTask, newsTask);

        var snapshot = await snapshotTask;
        var news = await newsTask;

        if (snapshot is null)
        {
            throw new InvalidOperationException($"Stock '{symbol}' not found");
        }

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
            Timestamp = DateTimeOffset.UtcNow,
        };
    }
}
