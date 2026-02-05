namespace Moodfolio.Contracts.V1.Responses;

public sealed record MarketWeatherResponse
{
    public required int MoodScore { get; init; }
    public required string WeatherType { get; init; }
    public required string Trend { get; init; }
    public required IReadOnlyList<MarketFactorDto> MainFactors { get; init; }
    public required DateTimeOffset Timestamp { get; init; }
}

public sealed record MarketFactorDto
{
    public required string Name { get; init; }
    public required decimal Value { get; init; }
    public required string Impact { get; init; }
}
