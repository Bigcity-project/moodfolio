namespace Moodfolio.Contracts.V1.Responses;

public sealed record PersonaAnalysisResponse
{
    public required string PersonaId { get; init; }
    public required string DisplayName { get; init; }
    public required IReadOnlyList<string> Traits { get; init; }
    public required string Description { get; init; }
    public required string Advice { get; init; }
    public required PersonaStatsDto Stats { get; init; }
}

public sealed record PersonaStatsDto
{
    public required decimal AvgHoldingDays { get; init; }
    public required decimal TurnoverRate { get; init; }
    public required decimal PanicSellRatio { get; init; }
    public required decimal WinRate { get; init; }
}
