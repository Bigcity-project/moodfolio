using FluentValidation;
using Moodfolio.Contracts.V1.Shared;

namespace Moodfolio.Contracts.Validators;

public class TransactionDtoValidator : AbstractValidator<TransactionDto>
{
    private static readonly string[] ValidActions = ["BUY", "SELL"];

    public TransactionDtoValidator()
    {
        RuleFor(x => x.Date)
            .NotEmpty()
            .WithMessage("Date is required")
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("Date cannot be in the future");

        RuleFor(x => x.Symbol)
            .NotEmpty()
            .WithMessage("Symbol is required")
            .MaximumLength(10)
            .WithMessage("Symbol must be at most 10 characters")
            .Matches(@"^[A-Z0-9\.\-]+$")
            .WithMessage("Symbol must contain only uppercase letters, numbers, dots, and hyphens");

        RuleFor(x => x.Action)
            .NotEmpty()
            .WithMessage("Action is required")
            .Must(action => ValidActions.Contains(action.ToUpperInvariant()))
            .WithMessage("Action must be either 'BUY' or 'SELL'");

        RuleFor(x => x.Quantity)
            .GreaterThan(0)
            .WithMessage("Quantity must be greater than 0");

        RuleFor(x => x.Price)
            .GreaterThan(0)
            .WithMessage("Price must be greater than 0");
    }
}
