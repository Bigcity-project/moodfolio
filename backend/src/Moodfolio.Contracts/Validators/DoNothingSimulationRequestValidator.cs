using FluentValidation;
using Moodfolio.Contracts.V1.Requests;

namespace Moodfolio.Contracts.Validators;

public class DoNothingSimulationRequestValidator : AbstractValidator<DoNothingSimulationRequest>
{
    public DoNothingSimulationRequestValidator()
    {
        RuleFor(x => x.Transactions)
            .NotEmpty()
            .WithMessage("At least one transaction is required")
            .Must(t => t.Count <= 10000)
            .WithMessage("Maximum 10000 transactions allowed");

        RuleForEach(x => x.Transactions)
            .SetValidator(new TransactionDtoValidator());
    }
}
