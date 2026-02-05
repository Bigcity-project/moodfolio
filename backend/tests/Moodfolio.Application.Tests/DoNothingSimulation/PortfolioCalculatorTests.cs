using FluentAssertions;
using Moodfolio.Application.DoNothingSimulation.Services;
using Moodfolio.Domain.Entities;
using Moodfolio.Domain.Enums;

namespace Moodfolio.Application.Tests.DoNothingSimulation;

public class PortfolioCalculatorTests
{
    private readonly PortfolioCalculator _calculator = new();

    [Fact]
    public void CalculateInitialInvestment_WithBuys_SumsBuyValues()
    {
        var transactions = new List<Transaction>
        {
            CreateTransaction("AAPL", TransactionAction.Buy, 10, 100),
            CreateTransaction("MSFT", TransactionAction.Buy, 5, 200),
            CreateTransaction("AAPL", TransactionAction.Sell, 5, 110)
        };

        var result = _calculator.CalculateInitialInvestment(transactions);

        result.Should().Be(2000m); // 1000 + 1000, sell not counted
    }

    [Fact]
    public void CalculateCurrentValue_WithHoldings_CalculatesCorrectly()
    {
        var transactions = new List<Transaction>
        {
            CreateTransaction("AAPL", TransactionAction.Buy, 10, 100),
            CreateTransaction("AAPL", TransactionAction.Sell, 5, 110)
        };
        var currentPrices = new Dictionary<string, decimal> { ["AAPL"] = 150m };

        var result = _calculator.CalculateCurrentValue(transactions, currentPrices);

        result.Should().Be(750m); // 5 shares * 150
    }

    [Fact]
    public void CalculateReturnPct_WithPositiveReturn_CalculatesCorrectly()
    {
        var result = _calculator.CalculateReturnPct(currentValue: 1100m, initialInvestment: 1000m);

        result.Should().Be(10m);
    }

    [Fact]
    public void CalculateReturnPct_WithNegativeReturn_CalculatesCorrectly()
    {
        var result = _calculator.CalculateReturnPct(currentValue: 500m, initialInvestment: 1000m);

        result.Should().Be(-50m);
    }

    [Fact]
    public void CalculateReturnPct_WithZeroInvestment_ReturnsZero()
    {
        var result = _calculator.CalculateReturnPct(currentValue: 100m, initialInvestment: 0m);

        result.Should().Be(0m);
    }

    [Fact]
    public void Simulate_StockDrops50Pct_SpyUp10Pct_NegativeDrag()
    {
        // Stock drops 50%, SPY up 10%
        var transactions = new List<Transaction>
        {
            CreateTransaction("XYZ", TransactionAction.Buy, 100, 100) // $10,000 invested
        };

        // XYZ now at $50, so portfolio = $5,000
        var currentPrices = new Dictionary<string, decimal> { ["XYZ"] = 50m };

        var initialInvestment = _calculator.CalculateInitialInvestment(transactions);
        var currentValue = _calculator.CalculateCurrentValue(transactions, currentPrices);
        var actualReturn = _calculator.CalculateReturnPct(currentValue, initialInvestment);

        actualReturn.Should().Be(-50m);
    }

    private static Transaction CreateTransaction(string symbol, TransactionAction action, decimal qty, decimal price)
    {
        return new Transaction
        {
            Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30)),
            Symbol = symbol,
            Action = action,
            Quantity = qty,
            Price = price
        };
    }
}
