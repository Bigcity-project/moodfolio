using Moodfolio.Contracts.V1.Shared;

namespace Moodfolio.Contracts.V1.Requests;

public sealed record PersonaAnalysisRequest
{
    public required IReadOnlyList<TransactionDto> Transactions { get; init; }
}
