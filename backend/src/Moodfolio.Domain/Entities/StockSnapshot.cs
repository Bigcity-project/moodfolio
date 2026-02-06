namespace Moodfolio.Domain.Entities;

public sealed record StockSnapshot
{
    public required string Symbol { get; init; }
    public required string Name { get; init; }
    public required decimal Price { get; init; }
    public required decimal Change { get; init; }
    public required decimal ChangePercent { get; init; }
    public required long Volume { get; init; }
    public decimal? MarketCap { get; init; }
    public decimal? TrailingPE { get; init; }
    public required decimal FiftyTwoWeekHigh { get; init; }
    public required decimal FiftyTwoWeekLow { get; init; }
    public required decimal DayHigh { get; init; }
    public required decimal DayLow { get; init; }
}
