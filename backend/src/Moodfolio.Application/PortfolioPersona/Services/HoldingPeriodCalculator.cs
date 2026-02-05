using Moodfolio.Domain.Entities;
using Moodfolio.Domain.Enums;

namespace Moodfolio.Application.PortfolioPersona.Services;

public interface IHoldingPeriodCalculator
{
    decimal CalculateAverageHoldingDays(IReadOnlyList<Transaction> transactions);
}

public class HoldingPeriodCalculator : IHoldingPeriodCalculator
{
    public decimal CalculateAverageHoldingDays(IReadOnlyList<Transaction> transactions)
    {
        var orderedTransactions = transactions.OrderBy(t => t.Date).ToList();
        var holdingPeriods = new List<int>();

        var buysBySymbol = new Dictionary<string, Queue<(DateOnly Date, decimal Quantity)>>();

        foreach (var transaction in orderedTransactions)
        {
            if (!buysBySymbol.ContainsKey(transaction.Symbol))
            {
                buysBySymbol[transaction.Symbol] = new Queue<(DateOnly, decimal)>();
            }

            if (transaction.Action == TransactionAction.Buy)
            {
                buysBySymbol[transaction.Symbol].Enqueue((transaction.Date, transaction.Quantity));
            }
            else if (transaction.Action == TransactionAction.Sell)
            {
                var remainingToSell = transaction.Quantity;

                while (remainingToSell > 0 && buysBySymbol[transaction.Symbol].Count > 0)
                {
                    var (buyDate, buyQuantity) = buysBySymbol[transaction.Symbol].Peek();
                    var soldQuantity = Math.Min(remainingToSell, buyQuantity);

                    var holdingDays = transaction.Date.DayNumber - buyDate.DayNumber;
                    holdingPeriods.Add(holdingDays);

                    remainingToSell -= soldQuantity;

                    if (soldQuantity >= buyQuantity)
                    {
                        buysBySymbol[transaction.Symbol].Dequeue();
                    }
                    else
                    {
                        buysBySymbol[transaction.Symbol].Dequeue();
                        buysBySymbol[transaction.Symbol] = new Queue<(DateOnly, decimal)>(
                            new[] { (buyDate, buyQuantity - soldQuantity) }
                                .Concat(buysBySymbol[transaction.Symbol]));
                    }
                }
            }
        }

        if (holdingPeriods.Count == 0)
        {
            var firstBuy = orderedTransactions.FirstOrDefault(t => t.Action == TransactionAction.Buy);
            if (firstBuy is not null)
            {
                return (DateOnly.FromDateTime(DateTime.UtcNow).DayNumber - firstBuy.Date.DayNumber);
            }
            return 0;
        }

        return (decimal)holdingPeriods.Average();
    }
}
