namespace Moodfolio.Domain.Entities;

public sealed record DailyPrice
{
    public required DateOnly Date { get; init; }
    public required string Symbol { get; init; }
    public required decimal Open { get; init; }
    public required decimal High { get; init; }
    public required decimal Low { get; init; }
    public required decimal Close { get; init; }
    public required long Volume { get; init; }
}
