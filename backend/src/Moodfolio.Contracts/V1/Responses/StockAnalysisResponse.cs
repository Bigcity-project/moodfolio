namespace Moodfolio.Contracts.V1.Responses;

public sealed record StockAnalysisResponse
{
    public required string Symbol { get; init; }
    public required string Name { get; init; }
    public required StockIndicatorsDto Indicators { get; init; }
    public required IReadOnlyList<NewsArticleDto> News { get; init; }
    public required StockAnalysisDto Analysis { get; init; }
    public required DateTimeOffset Timestamp { get; init; }
}

public sealed record StockIndicatorsDto
{
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

public sealed record NewsArticleDto
{
    public required string Title { get; init; }
    public required string Url { get; init; }
    public required DateTimeOffset PublishedAt { get; init; }
    public string? Description { get; init; }
}

public sealed record StockAnalysisDto
{
    public required string Summary { get; init; }
    public required string Recommendation { get; init; }
    public required string Reasoning { get; init; }
}
