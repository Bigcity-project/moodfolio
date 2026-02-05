using FluentAssertions;
using FluentValidation.TestHelper;
using Moodfolio.Contracts.V1.Requests;
using Moodfolio.Contracts.V1.Shared;
using Moodfolio.Contracts.Validators;

namespace Moodfolio.Contracts.Tests.Validators;

public class DoNothingSimulationRequestValidatorTests
{
    private readonly DoNothingSimulationRequestValidator _validator = new();

    private static TransactionDto CreateValidTransaction() => new()
    {
        Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)),
        Symbol = "AAPL",
        Action = "BUY",
        Quantity = 10m,
        Price = 150.50m
    };

    [Fact]
    public void Validate_WithValidRequest_ShouldPass()
    {
        var request = new DoNothingSimulationRequest
        {
            Transactions = [CreateValidTransaction()]
        };

        var result = _validator.TestValidate(request);

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_WithEmptyTransactions_ShouldFail()
    {
        var request = new DoNothingSimulationRequest
        {
            Transactions = []
        };

        var result = _validator.TestValidate(request);

        result.ShouldHaveValidationErrorFor(x => x.Transactions);
    }

    [Fact]
    public void Validate_WithInvalidTransaction_ShouldFail()
    {
        var invalidTransaction = CreateValidTransaction() with { Price = -1 };
        var request = new DoNothingSimulationRequest
        {
            Transactions = [invalidTransaction]
        };

        var result = _validator.TestValidate(request);

        result.Errors.Should().Contain(e => e.PropertyName.Contains("Price"));
    }

    [Fact]
    public void Validate_WithMultipleTransactions_ShouldValidateAll()
    {
        var transactions = Enumerable.Range(0, 5)
            .Select(_ => CreateValidTransaction())
            .ToList();

        var request = new DoNothingSimulationRequest
        {
            Transactions = transactions
        };

        var result = _validator.TestValidate(request);

        result.ShouldNotHaveAnyValidationErrors();
    }
}
