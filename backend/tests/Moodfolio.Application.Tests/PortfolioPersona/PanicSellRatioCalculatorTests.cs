using FluentAssertions;
using Moodfolio.Application.PortfolioPersona.Services;
using Moodfolio.Domain.Entities;
using Moodfolio.Domain.Enums;

namespace Moodfolio.Application.Tests.PortfolioPersona;

public class PanicSellRatioCalculatorTests
{
    private readonly PanicSellRatioCalculator _calculator = new();

    [Fact]
    public void Calculate_NoSells_ReturnsZero()
    {
        var transactions = new List<Transaction>
        {
            CreateTransaction(DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10)), TransactionAction.Buy)
        };
        var marketData = new List<DailyMarketData>();

        var result = _calculator.CalculatePanicSellRatio(transactions, marketData);

        result.Should().Be(0);
    }

    [Fact]
    public void Calculate_AllSellsDuringHighVix_Returns100()
    {
        var date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10));
        var transactions = new List<Transaction>
        {
            CreateTransaction(date, TransactionAction.Buy),
            CreateTransaction(date.AddDays(1), TransactionAction.Sell)
        };
        var marketData = new List<DailyMarketData>
        {
            new() { Date = date.AddDays(1), Vix = 35m, SpyClose = 400 }
        };

        var result = _calculator.CalculatePanicSellRatio(transactions, marketData);

        result.Should().Be(100);
    }

    [Fact]
    public void Calculate_NoSellsDuringHighVix_ReturnsZero()
    {
        var date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10));
        var transactions = new List<Transaction>
        {
            CreateTransaction(date, TransactionAction.Buy),
            CreateTransaction(date.AddDays(1), TransactionAction.Sell)
        };
        var marketData = new List<DailyMarketData>
        {
            new() { Date = date.AddDays(1), Vix = 15m, SpyClose = 400 }
        };

        var result = _calculator.CalculatePanicSellRatio(transactions, marketData);

        result.Should().Be(0);
    }

    [Fact]
    public void Calculate_HalfSellsDuringHighVix_Returns50()
    {
        var date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10));
        var transactions = new List<Transaction>
        {
            CreateTransaction(date, TransactionAction.Buy),
            CreateTransaction(date.AddDays(1), TransactionAction.Sell),
            CreateTransaction(date.AddDays(2), TransactionAction.Buy),
            CreateTransaction(date.AddDays(3), TransactionAction.Sell)
        };
        var marketData = new List<DailyMarketData>
        {
            new() { Date = date.AddDays(1), Vix = 30m, SpyClose = 400 }, // High VIX
            new() { Date = date.AddDays(3), Vix = 15m, SpyClose = 410 }  // Low VIX
        };

        var result = _calculator.CalculatePanicSellRatio(transactions, marketData);

        result.Should().Be(50);
    }

    private static Transaction CreateTransaction(DateOnly date, TransactionAction action)
    {
        return new Transaction
        {
            Date = date,
            Symbol = "AAPL",
            Action = action,
            Quantity = 10,
            Price = 100
        };
    }
}
