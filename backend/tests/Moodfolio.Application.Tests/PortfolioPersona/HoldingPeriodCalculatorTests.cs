using FluentAssertions;
using Moodfolio.Application.PortfolioPersona.Services;
using Moodfolio.Domain.Entities;
using Moodfolio.Domain.Enums;

namespace Moodfolio.Application.Tests.PortfolioPersona;

public class HoldingPeriodCalculatorTests
{
    private readonly HoldingPeriodCalculator _calculator = new();

    [Fact]
    public void Calculate_BuyAndSellSameDay_ReturnsZero()
    {
        var date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10));
        var transactions = new List<Transaction>
        {
            CreateTransaction(date, "AAPL", TransactionAction.Buy, 10, 100),
            CreateTransaction(date, "AAPL", TransactionAction.Sell, 10, 105)
        };

        var result = _calculator.CalculateAverageHoldingDays(transactions);

        result.Should().Be(0);
    }

    [Fact]
    public void Calculate_HoldFor30Days_Returns30()
    {
        var buyDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-40));
        var sellDate = buyDate.AddDays(30);
        var transactions = new List<Transaction>
        {
            CreateTransaction(buyDate, "AAPL", TransactionAction.Buy, 10, 100),
            CreateTransaction(sellDate, "AAPL", TransactionAction.Sell, 10, 110)
        };

        var result = _calculator.CalculateAverageHoldingDays(transactions);

        result.Should().Be(30);
    }

    [Fact]
    public void Calculate_MultipleTradesAveragesCorrectly()
    {
        var baseDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-100));
        var transactions = new List<Transaction>
        {
            CreateTransaction(baseDate, "AAPL", TransactionAction.Buy, 10, 100),
            CreateTransaction(baseDate.AddDays(10), "AAPL", TransactionAction.Sell, 10, 110),
            CreateTransaction(baseDate.AddDays(20), "MSFT", TransactionAction.Buy, 5, 200),
            CreateTransaction(baseDate.AddDays(50), "MSFT", TransactionAction.Sell, 5, 220)
        };

        var result = _calculator.CalculateAverageHoldingDays(transactions);

        // (10 + 30) / 2 = 20
        result.Should().Be(20);
    }

    [Fact]
    public void Classify_DailyTrades_HoldingUnder24h_ReturnsDayTrader()
    {
        var date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10));
        var transactions = new List<Transaction>
        {
            CreateTransaction(date, "AAPL", TransactionAction.Buy, 100, 100),
            CreateTransaction(date, "AAPL", TransactionAction.Sell, 100, 101),
            CreateTransaction(date.AddDays(1), "AAPL", TransactionAction.Buy, 100, 99),
            CreateTransaction(date.AddDays(1), "AAPL", TransactionAction.Sell, 100, 100)
        };

        var result = _calculator.CalculateAverageHoldingDays(transactions);

        result.Should().BeLessThan(3);
    }

    private static Transaction CreateTransaction(DateOnly date, string symbol, TransactionAction action, decimal qty, decimal price)
    {
        return new Transaction
        {
            Date = date,
            Symbol = symbol,
            Action = action,
            Quantity = qty,
            Price = price
        };
    }
}
