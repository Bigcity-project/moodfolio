namespace Moodfolio.Domain.Entities;

public sealed record TechnicalIndicatorSet
{
    public required decimal? Rsi { get; init; }
    public required MacdResult? Macd { get; init; }
    public required BollingerBandsResult? BollingerBands { get; init; }
}

public sealed record MacdResult
{
    public required decimal MacdLine { get; init; }
    public required decimal SignalLine { get; init; }
    public required decimal Histogram { get; init; }
}

public sealed record BollingerBandsResult
{
    public required decimal UpperBand { get; init; }
    public required decimal MiddleBand { get; init; }
    public required decimal LowerBand { get; init; }
}
