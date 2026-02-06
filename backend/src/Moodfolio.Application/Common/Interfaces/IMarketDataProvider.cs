using Moodfolio.Domain.Entities;
using Moodfolio.Domain.ValueObjects;

namespace Moodfolio.Application.Common.Interfaces;

public interface IMarketDataProvider
{
    Task<IReadOnlyList<DailyPrice>> GetHistoricalPricesAsync(string symbol, DateRange range, CancellationToken cancellationToken = default);
    Task<decimal> GetCurrentVixAsync(CancellationToken cancellationToken = default);
    Task<decimal> CalculateRsiAsync(string symbol, int period = 14, CancellationToken cancellationToken = default);
    Task<DailyMarketData?> GetLatestMarketDataAsync(CancellationToken cancellationToken = default);
    Task<StockSnapshot?> GetStockSnapshotAsync(string symbol, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NewsArticle>> GetStockNewsAsync(string symbol, int maxArticles = 20, CancellationToken cancellationToken = default);
}
