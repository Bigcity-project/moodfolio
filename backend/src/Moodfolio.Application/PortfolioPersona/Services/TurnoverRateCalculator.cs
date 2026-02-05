using Moodfolio.Domain.Entities;
using Moodfolio.Domain.Enums;

namespace Moodfolio.Application.PortfolioPersona.Services;

public interface ITurnoverRateCalculator
{
    decimal CalculateTurnoverRate(IReadOnlyList<Transaction> transactions);
}

public class TurnoverRateCalculator : ITurnoverRateCalculator
{
    public decimal CalculateTurnoverRate(IReadOnlyList<Transaction> transactions)
    {
        if (!transactions.Any())
        {
            return 0;
        }

        var orderedTransactions = transactions.OrderBy(t => t.Date).ToList();
        var firstDate = orderedTransactions.First().Date;
        var lastDate = orderedTransactions.Last().Date;

        var holdingPeriodDays = lastDate.DayNumber - firstDate.DayNumber;
        if (holdingPeriodDays <= 0)
        {
            holdingPeriodDays = 1;
        }

        var annualizationFactor = 365m / holdingPeriodDays;

        var totalBuys = transactions
            .Where(t => t.Action == TransactionAction.Buy)
            .Sum(t => t.TotalValue);

        var totalSells = transactions
            .Where(t => t.Action == TransactionAction.Sell)
            .Sum(t => t.TotalValue);

        var avgPortfolioValue = (totalBuys + totalSells) / 2;
        if (avgPortfolioValue == 0)
        {
            return 0;
        }

        var turnover = totalSells / avgPortfolioValue;
        return turnover * annualizationFactor * 100;
    }
}
