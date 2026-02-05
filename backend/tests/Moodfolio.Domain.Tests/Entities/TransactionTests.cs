using FluentAssertions;
using Moodfolio.Domain.Entities;
using Moodfolio.Domain.Enums;

namespace Moodfolio.Domain.Tests.Entities;

public class TransactionTests
{
    [Fact]
    public void TotalValue_ShouldCalculateCorrectly()
    {
        var transaction = new Transaction
        {
            Date = new DateOnly(2024, 1, 15),
            Symbol = "AAPL",
            Action = TransactionAction.Buy,
            Quantity = 10m,
            Price = 150.50m
        };

        transaction.TotalValue.Should().Be(1505.00m);
    }

    [Fact]
    public void Transaction_ShouldBeImmutable()
    {
        var transaction1 = new Transaction
        {
            Date = new DateOnly(2024, 1, 15),
            Symbol = "AAPL",
            Action = TransactionAction.Buy,
            Quantity = 10m,
            Price = 150.50m
        };

        var transaction2 = new Transaction
        {
            Date = new DateOnly(2024, 1, 15),
            Symbol = "AAPL",
            Action = TransactionAction.Buy,
            Quantity = 10m,
            Price = 150.50m
        };

        transaction1.Should().Be(transaction2);
    }

    [Fact]
    public void Transaction_WithOperator_ShouldCreateNewInstance()
    {
        var original = new Transaction
        {
            Date = new DateOnly(2024, 1, 15),
            Symbol = "AAPL",
            Action = TransactionAction.Buy,
            Quantity = 10m,
            Price = 150.50m
        };

        var updated = original with { Price = 160.00m };

        updated.Price.Should().Be(160.00m);
        original.Price.Should().Be(150.50m);
        updated.Should().NotBeSameAs(original);
    }
}
