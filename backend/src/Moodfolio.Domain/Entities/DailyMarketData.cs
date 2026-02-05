namespace Moodfolio.Domain.Entities;

public sealed record DailyMarketData
{
    public required DateOnly Date { get; init; }
    public required decimal Vix { get; init; }
    public required decimal SpyClose { get; init; }
}
