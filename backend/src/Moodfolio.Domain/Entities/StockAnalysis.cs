namespace Moodfolio.Domain.Entities;

public sealed record StockAnalysis
{
    public required string Summary { get; init; }
    public required string Recommendation { get; init; }
    public required string Reasoning { get; init; }
}
