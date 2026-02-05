namespace Moodfolio.Contracts.V1.Responses;

public sealed record DoNothingSimulationResponse
{
    public required decimal ActualReturnPct { get; init; }
    public required decimal DoNothingReturnPct { get; init; }
    public required decimal PerformanceDrag { get; init; }
    public required string Verdict { get; init; }
    public required IReadOnlyList<ChartDataPointDto> ChartData { get; init; }
}

public sealed record ChartDataPointDto
{
    public required DateOnly Date { get; init; }
    public required decimal ActualValue { get; init; }
    public required decimal DoNothingValue { get; init; }
}
