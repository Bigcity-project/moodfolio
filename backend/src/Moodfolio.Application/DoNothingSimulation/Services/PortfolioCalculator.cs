using Moodfolio.Domain.Entities;
using Moodfolio.Domain.Enums;

namespace Moodfolio.Application.DoNothingSimulation.Services;

public interface IPortfolioCalculator
{
    decimal CalculateCurrentValue(IReadOnlyList<Transaction> transactions, IDictionary<string, decimal> currentPrices);
    decimal CalculateInitialInvestment(IReadOnlyList<Transaction> transactions);
    decimal CalculateReturnPct(decimal currentValue, decimal initialInvestment);
}

public class PortfolioCalculator : IPortfolioCalculator
{
    public decimal CalculateCurrentValue(IReadOnlyList<Transaction> transactions, IDictionary<string, decimal> currentPrices)
    {
        var holdings = CalculateHoldings(transactions);

        return holdings.Sum(h =>
        {
            if (currentPrices.TryGetValue(h.Key, out var price))
            {
                return h.Value * price;
            }
            return 0m;
        });
    }

    public decimal CalculateInitialInvestment(IReadOnlyList<Transaction> transactions)
    {
        return transactions
            .Where(t => t.Action == TransactionAction.Buy)
            .Sum(t => t.TotalValue);
    }

    public decimal CalculateReturnPct(decimal currentValue, decimal initialInvestment)
    {
        if (initialInvestment == 0)
        {
            return 0m;
        }

        return ((currentValue - initialInvestment) / initialInvestment) * 100;
    }

    private static Dictionary<string, decimal> CalculateHoldings(IReadOnlyList<Transaction> transactions)
    {
        var holdings = new Dictionary<string, decimal>();

        foreach (var transaction in transactions.OrderBy(t => t.Date))
        {
            if (!holdings.ContainsKey(transaction.Symbol))
            {
                holdings[transaction.Symbol] = 0m;
            }

            holdings[transaction.Symbol] += transaction.Action switch
            {
                TransactionAction.Buy => transaction.Quantity,
                TransactionAction.Sell => -transaction.Quantity,
                _ => 0m
            };
        }

        return holdings;
    }
}
