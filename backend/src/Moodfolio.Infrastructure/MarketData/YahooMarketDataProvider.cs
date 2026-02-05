using Microsoft.EntityFrameworkCore;
using Moodfolio.Application.Common.Interfaces;
using Moodfolio.Domain.Entities;
using Moodfolio.Domain.ValueObjects;
using Moodfolio.Infrastructure.Data;
using Moodfolio.Infrastructure.Data.Entities;
using NodaTime;
using YahooQuotesApi;

namespace Moodfolio.Infrastructure.MarketData;

public class YahooMarketDataProvider : IMarketDataProvider
{
    private readonly MoodfolioDbContext _dbContext;
    private readonly YahooQuotes _yahooQuotes;

    public YahooMarketDataProvider(MoodfolioDbContext dbContext)
    {
        _dbContext = dbContext;
        _yahooQuotes = new YahooQuotesBuilder()
            .WithHistoryStartDate(Instant.FromUtc(DateTime.UtcNow.AddYears(-5).Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 0, 0))
            .Build();
    }

    public async Task<IReadOnlyList<DailyPrice>> GetHistoricalPricesAsync(
        string symbol,
        DateRange range,
        CancellationToken cancellationToken = default)
    {
        var cachedPrices = await GetCachedPricesAsync(symbol, range, cancellationToken);

        if (cachedPrices.Count > 0)
        {
            return cachedPrices;
        }

        try
        {
            var security = await _yahooQuotes.GetAsync(symbol, Histories.PriceHistory);

            if (security is null)
            {
                return [];
            }

            var priceHistory = security.PriceHistory;
            if (!priceHistory.HasValue || priceHistory.Value is null)
            {
                return [];
            }

            var prices = priceHistory.Value
                .Where(p => ToDateOnly(p.Date) >= range.Start && ToDateOnly(p.Date) <= range.End)
                .Select(p => new DailyPrice
                {
                    Date = ToDateOnly(p.Date),
                    Symbol = symbol.ToUpperInvariant(),
                    Open = (decimal)p.Open,
                    High = (decimal)p.High,
                    Low = (decimal)p.Low,
                    Close = (decimal)p.Close,
                    Volume = p.Volume
                })
                .OrderBy(p => p.Date)
                .ToList();

            await CachePricesAsync(prices, cancellationToken);

            return prices;
        }
        catch
        {
            return [];
        }
    }

    public async Task<decimal> GetCurrentVixAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var security = await _yahooQuotes.GetAsync("^VIX", Histories.PriceHistory);

            if (security is null)
            {
                return 20m;
            }

            var priceHistory = security.PriceHistory;
            if (!priceHistory.HasValue || priceHistory.Value is null)
            {
                return 20m;
            }

            var latestPrice = priceHistory.Value
                .OrderByDescending(p => p.Date)
                .FirstOrDefault();

            return (decimal)(latestPrice?.Close ?? 20);
        }
        catch
        {
            return 20m;
        }
    }

    public async Task<decimal> CalculateRsiAsync(string symbol, int period = 14, CancellationToken cancellationToken = default)
    {
        try
        {
            var endDate = DateOnly.FromDateTime(DateTime.UtcNow);
            var startDate = endDate.AddDays(-(period * 3));
            var dateRange = DateRange.Create(startDate, endDate).Value!;

            var prices = await GetHistoricalPricesAsync(symbol, dateRange, cancellationToken);

            if (prices.Count < period + 1)
            {
                return 50m;
            }

            var changes = new List<decimal>();
            for (int i = 1; i < prices.Count; i++)
            {
                changes.Add(prices[i].Close - prices[i - 1].Close);
            }

            var recentChanges = changes.TakeLast(period).ToList();

            var gains = recentChanges.Where(c => c > 0).DefaultIfEmpty(0).Average();
            var losses = Math.Abs(recentChanges.Where(c => c < 0).DefaultIfEmpty(0).Average());

            if (losses == 0)
            {
                return 100m;
            }

            var rs = (decimal)gains / (decimal)losses;
            var rsi = 100 - (100 / (1 + rs));

            return Math.Round(rsi, 2);
        }
        catch
        {
            return 50m;
        }
    }

    public async Task<DailyMarketData?> GetLatestMarketDataAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var vix = await GetCurrentVixAsync(cancellationToken);
            var endDate = DateOnly.FromDateTime(DateTime.UtcNow);
            var startDate = endDate.AddDays(-5);
            var dateRange = DateRange.Create(startDate, endDate).Value!;

            var spyPrices = await GetHistoricalPricesAsync("SPY", dateRange, cancellationToken);
            var latestSpy = spyPrices.OrderByDescending(p => p.Date).FirstOrDefault();

            return new DailyMarketData
            {
                Date = latestSpy?.Date ?? endDate,
                Vix = vix,
                SpyClose = latestSpy?.Close ?? 0
            };
        }
        catch
        {
            return null;
        }
    }

    private static DateOnly ToDateOnly(LocalDate localDate)
    {
        return new DateOnly(localDate.Year, localDate.Month, localDate.Day);
    }

    private async Task<List<DailyPrice>> GetCachedPricesAsync(
        string symbol,
        DateRange range,
        CancellationToken cancellationToken)
    {
        var cachedData = await _dbContext.MarketDataCache
            .Where(c => c.Symbol == symbol.ToUpperInvariant() &&
                       c.Date >= range.Start &&
                       c.Date <= range.End &&
                       c.CachedAt > DateTime.UtcNow.AddHours(-24))
            .OrderBy(c => c.Date)
            .ToListAsync(cancellationToken);

        return cachedData.Select(c => new DailyPrice
        {
            Date = c.Date,
            Symbol = c.Symbol,
            Open = c.Open,
            High = c.High,
            Low = c.Low,
            Close = c.Close,
            Volume = c.Volume
        }).ToList();
    }

    private async Task CachePricesAsync(IReadOnlyList<DailyPrice> prices, CancellationToken cancellationToken)
    {
        foreach (var price in prices)
        {
            var existing = await _dbContext.MarketDataCache
                .FirstOrDefaultAsync(c => c.Symbol == price.Symbol && c.Date == price.Date, cancellationToken);

            if (existing is null)
            {
                _dbContext.MarketDataCache.Add(new MarketDataCacheEntity
                {
                    Symbol = price.Symbol,
                    Date = price.Date,
                    Open = price.Open,
                    High = price.High,
                    Low = price.Low,
                    Close = price.Close,
                    Volume = price.Volume
                });
            }
            else
            {
                existing.Open = price.Open;
                existing.High = price.High;
                existing.Low = price.Low;
                existing.Close = price.Close;
                existing.Volume = price.Volume;
                existing.CachedAt = DateTime.UtcNow;
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
