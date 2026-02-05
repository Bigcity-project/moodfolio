using Moodfolio.Domain.Entities;
using Moodfolio.Domain.Enums;

namespace Moodfolio.Application.PortfolioPersona.Services;

public interface IWinRateCalculator
{
    decimal CalculateWinRate(IReadOnlyList<Transaction> transactions, IDictionary<string, decimal> currentPrices);
}

public class WinRateCalculator : IWinRateCalculator
{
    public decimal CalculateWinRate(IReadOnlyList<Transaction> transactions, IDictionary<string, decimal> currentPrices)
    {
        var orderedTransactions = transactions.OrderBy(t => t.Date).ToList();
        var completedTrades = new List<bool>();

        var buysBySymbol = new Dictionary<string, Queue<decimal>>();

        foreach (var transaction in orderedTransactions)
        {
            if (!buysBySymbol.ContainsKey(transaction.Symbol))
            {
                buysBySymbol[transaction.Symbol] = new Queue<decimal>();
            }

            if (transaction.Action == TransactionAction.Buy)
            {
                buysBySymbol[transaction.Symbol].Enqueue(transaction.Price);
            }
            else if (transaction.Action == TransactionAction.Sell && buysBySymbol[transaction.Symbol].Count > 0)
            {
                var buyPrice = buysBySymbol[transaction.Symbol].Dequeue();
                completedTrades.Add(transaction.Price > buyPrice);
            }
        }

        foreach (var (symbol, buyPrices) in buysBySymbol)
        {
            if (currentPrices.TryGetValue(symbol, out var currentPrice))
            {
                while (buyPrices.Count > 0)
                {
                    var buyPrice = buyPrices.Dequeue();
                    completedTrades.Add(currentPrice > buyPrice);
                }
            }
        }

        if (completedTrades.Count == 0)
        {
            return 0;
        }

        return (decimal)completedTrades.Count(w => w) / completedTrades.Count * 100;
    }
}
