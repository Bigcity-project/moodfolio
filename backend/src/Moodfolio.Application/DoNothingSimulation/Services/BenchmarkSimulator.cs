using Moodfolio.Domain.Entities;

namespace Moodfolio.Application.DoNothingSimulation.Services;

public interface IBenchmarkSimulator
{
    decimal CalculateDoNothingReturn(decimal initialInvestment, decimal spyStartPrice, decimal spyEndPrice);
    IReadOnlyList<(DateOnly Date, decimal ActualValue, decimal DoNothingValue)> GenerateChartData(
        IReadOnlyList<Transaction> transactions,
        IReadOnlyList<DailyPrice> spyPrices,
        IDictionary<string, IReadOnlyList<DailyPrice>> portfolioPrices);
}

public class BenchmarkSimulator : IBenchmarkSimulator
{
    public decimal CalculateDoNothingReturn(decimal initialInvestment, decimal spyStartPrice, decimal spyEndPrice)
    {
        if (spyStartPrice == 0 || initialInvestment == 0)
        {
            return 0m;
        }

        var spyShares = initialInvestment / spyStartPrice;
        var endValue = spyShares * spyEndPrice;

        return ((endValue - initialInvestment) / initialInvestment) * 100;
    }

    public IReadOnlyList<(DateOnly Date, decimal ActualValue, decimal DoNothingValue)> GenerateChartData(
        IReadOnlyList<Transaction> transactions,
        IReadOnlyList<DailyPrice> spyPrices,
        IDictionary<string, IReadOnlyList<DailyPrice>> portfolioPrices)
    {
        if (!transactions.Any() || !spyPrices.Any())
        {
            return [];
        }

        var firstTransaction = transactions.OrderBy(t => t.Date).First();
        var initialInvestment = CalculateInitialInvestment(transactions);

        var spyStartPrice = spyPrices
            .Where(p => p.Date >= firstTransaction.Date)
            .OrderBy(p => p.Date)
            .FirstOrDefault()?.Close ?? 0;

        if (spyStartPrice == 0)
        {
            return [];
        }

        var spyShares = initialInvestment / spyStartPrice;
        var chartData = new List<(DateOnly, decimal, decimal)>();

        foreach (var spyPrice in spyPrices.Where(p => p.Date >= firstTransaction.Date).OrderBy(p => p.Date))
        {
            var doNothingValue = spyShares * spyPrice.Close;
            var actualValue = CalculatePortfolioValueOnDate(transactions, portfolioPrices, spyPrice.Date);

            chartData.Add((spyPrice.Date, actualValue, doNothingValue));
        }

        return chartData;
    }

    private static decimal CalculateInitialInvestment(IReadOnlyList<Transaction> transactions)
    {
        return transactions
            .Where(t => t.Action == Domain.Enums.TransactionAction.Buy)
            .Sum(t => t.TotalValue);
    }

    private static decimal CalculatePortfolioValueOnDate(
        IReadOnlyList<Transaction> transactions,
        IDictionary<string, IReadOnlyList<DailyPrice>> portfolioPrices,
        DateOnly date)
    {
        var holdings = new Dictionary<string, decimal>();

        foreach (var t in transactions.Where(t => t.Date <= date).OrderBy(t => t.Date))
        {
            if (!holdings.ContainsKey(t.Symbol))
            {
                holdings[t.Symbol] = 0m;
            }

            holdings[t.Symbol] += t.Action switch
            {
                Domain.Enums.TransactionAction.Buy => t.Quantity,
                Domain.Enums.TransactionAction.Sell => -t.Quantity,
                _ => 0m
            };
        }

        return holdings.Sum(h =>
        {
            if (!portfolioPrices.TryGetValue(h.Key, out var prices))
            {
                return 0m;
            }

            var price = prices
                .Where(p => p.Date <= date)
                .OrderByDescending(p => p.Date)
                .FirstOrDefault()?.Close ?? 0;

            return h.Value * price;
        });
    }
}
