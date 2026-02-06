namespace Moodfolio.Contracts.V1.Responses;

public sealed record StockAnalysisResponse
{
    public required string Symbol { get; init; }
    public required string Name { get; init; }
    public required StockIndicatorsDto Indicators { get; init; }
    public required IReadOnlyList<NewsArticleDto> News { get; init; }
    public required StockAnalysisDto Analysis { get; init; }
    public required DateTimeOffset Timestamp { get; init; }
    public TechnicalIndicatorsDto? TechnicalIndicators { get; init; }
    public IReadOnlyList<PeerStockDto>? PeerStocks { get; init; }
    public FinancialStatementsDto? Financials { get; init; }
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

public sealed record TechnicalIndicatorsDto
{
    public decimal? Rsi { get; init; }
    public MacdDto? Macd { get; init; }
    public BollingerBandsDto? BollingerBands { get; init; }
}

public sealed record MacdDto
{
    public required decimal MacdLine { get; init; }
    public required decimal SignalLine { get; init; }
    public required decimal Histogram { get; init; }
}

public sealed record BollingerBandsDto
{
    public required decimal UpperBand { get; init; }
    public required decimal MiddleBand { get; init; }
    public required decimal LowerBand { get; init; }
}

public sealed record PeerStockDto
{
    public required string Symbol { get; init; }
    public required string Name { get; init; }
    public required decimal Price { get; init; }
    public required decimal Change { get; init; }
    public required decimal ChangePercent { get; init; }
}

public sealed record FinancialStatementsDto
{
    public required IReadOnlyList<IncomeStatementQuarterDto> IncomeStatements { get; init; }
    public required IReadOnlyList<BalanceSheetQuarterDto> BalanceSheets { get; init; }
    public required IReadOnlyList<CashFlowQuarterDto> CashFlows { get; init; }
}

public sealed record IncomeStatementQuarterDto
{
    public required DateOnly EndDate { get; init; }
    public decimal? Revenue { get; init; }
    public decimal? GrossProfit { get; init; }
    public decimal? OperatingIncome { get; init; }
    public decimal? NetIncome { get; init; }
    public decimal? Eps { get; init; }
}

public sealed record BalanceSheetQuarterDto
{
    public required DateOnly EndDate { get; init; }
    public decimal? TotalAssets { get; init; }
    public decimal? TotalLiabilities { get; init; }
    public decimal? TotalEquity { get; init; }
    public decimal? Cash { get; init; }
    public decimal? TotalDebt { get; init; }
}

public sealed record CashFlowQuarterDto
{
    public required DateOnly EndDate { get; init; }
    public decimal? OperatingCashFlow { get; init; }
    public decimal? InvestingCashFlow { get; init; }
    public decimal? FinancingCashFlow { get; init; }
    public decimal? FreeCashFlow { get; init; }
    public decimal? CapitalExpenditure { get; init; }
}
