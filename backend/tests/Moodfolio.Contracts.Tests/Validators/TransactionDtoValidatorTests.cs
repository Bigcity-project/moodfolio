using FluentAssertions;
using FluentValidation.TestHelper;
using Moodfolio.Contracts.V1.Shared;
using Moodfolio.Contracts.Validators;

namespace Moodfolio.Contracts.Tests.Validators;

public class TransactionDtoValidatorTests
{
    private readonly TransactionDtoValidator _validator = new();

    private static TransactionDto CreateValidTransaction() => new()
    {
        Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)),
        Symbol = "AAPL",
        Action = "BUY",
        Quantity = 10m,
        Price = 150.50m
    };

    [Fact]
    public void Validate_WithValidTransaction_ShouldPass()
    {
        var transaction = CreateValidTransaction();

        var result = _validator.TestValidate(transaction);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("BUY")]
    [InlineData("SELL")]
    [InlineData("buy")]
    [InlineData("sell")]
    public void Validate_WithValidAction_ShouldPass(string action)
    {
        var transaction = CreateValidTransaction() with { Action = action };

        var result = _validator.TestValidate(transaction);

        result.ShouldNotHaveValidationErrorFor(x => x.Action);
    }

    [Theory]
    [InlineData("")]
    [InlineData("HOLD")]
    [InlineData("TRADE")]
    public void Validate_WithInvalidAction_ShouldFail(string action)
    {
        var transaction = CreateValidTransaction() with { Action = action };

        var result = _validator.TestValidate(transaction);

        result.ShouldHaveValidationErrorFor(x => x.Action);
    }

    [Fact]
    public void Validate_WithFutureDate_ShouldFail()
    {
        var transaction = CreateValidTransaction() with
        {
            Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1))
        };

        var result = _validator.TestValidate(transaction);

        result.ShouldHaveValidationErrorFor(x => x.Date);
    }

    [Theory]
    [InlineData("")]
    [InlineData("TOOLONGSYMBOL123")]
    public void Validate_WithInvalidSymbol_ShouldFail(string symbol)
    {
        var transaction = CreateValidTransaction() with { Symbol = symbol };

        var result = _validator.TestValidate(transaction);

        result.ShouldHaveValidationErrorFor(x => x.Symbol);
    }

    [Theory]
    [InlineData("aapl")]
    [InlineData("aapl!")]
    public void Validate_WithInvalidSymbolFormat_ShouldFail(string symbol)
    {
        var transaction = CreateValidTransaction() with { Symbol = symbol };

        var result = _validator.TestValidate(transaction);

        result.ShouldHaveValidationErrorFor(x => x.Symbol);
    }

    [Theory]
    [InlineData("AAPL")]
    [InlineData("BRK.A")]
    [InlineData("BRK-B")]
    public void Validate_WithValidSymbolFormat_ShouldPass(string symbol)
    {
        var transaction = CreateValidTransaction() with { Symbol = symbol };

        var result = _validator.TestValidate(transaction);

        result.ShouldNotHaveValidationErrorFor(x => x.Symbol);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(-100)]
    public void Validate_WithInvalidQuantity_ShouldFail(decimal quantity)
    {
        var transaction = CreateValidTransaction() with { Quantity = quantity };

        var result = _validator.TestValidate(transaction);

        result.ShouldHaveValidationErrorFor(x => x.Quantity);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(-100)]
    public void Validate_WithInvalidPrice_ShouldFail(decimal price)
    {
        var transaction = CreateValidTransaction() with { Price = price };

        var result = _validator.TestValidate(transaction);

        result.ShouldHaveValidationErrorFor(x => x.Price);
    }
}
