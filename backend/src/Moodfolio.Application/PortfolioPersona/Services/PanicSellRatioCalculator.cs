using Moodfolio.Domain.Entities;
using Moodfolio.Domain.Enums;

namespace Moodfolio.Application.PortfolioPersona.Services;

public interface IPanicSellRatioCalculator
{
    decimal CalculatePanicSellRatio(IReadOnlyList<Transaction> transactions, IReadOnlyList<DailyMarketData> marketData);
}

public class PanicSellRatioCalculator : IPanicSellRatioCalculator
{
    private const decimal HighVixThreshold = 25m;

    public decimal CalculatePanicSellRatio(IReadOnlyList<Transaction> transactions, IReadOnlyList<DailyMarketData> marketData)
    {
        var sells = transactions.Where(t => t.Action == TransactionAction.Sell).ToList();

        if (!sells.Any())
        {
            return 0;
        }

        var marketDataByDate = marketData.ToDictionary(m => m.Date);

        var panicSells = sells.Count(sell =>
        {
            if (marketDataByDate.TryGetValue(sell.Date, out var data))
            {
                return data.Vix >= HighVixThreshold;
            }

            var closestData = marketData
                .Where(m => m.Date <= sell.Date)
                .OrderByDescending(m => m.Date)
                .FirstOrDefault();

            return closestData?.Vix >= HighVixThreshold;
        });

        return (decimal)panicSells / sells.Count * 100;
    }
}
