namespace Moodfolio.Domain.Entities;

public sealed record FinancialStatements
{
    public required IReadOnlyList<IncomeStatementQuarter> IncomeStatements { get; init; }
    public required IReadOnlyList<BalanceSheetQuarter> BalanceSheets { get; init; }
    public required IReadOnlyList<CashFlowQuarter> CashFlows { get; init; }
}

public sealed record IncomeStatementQuarter
{
    public required DateOnly EndDate { get; init; }
    public required decimal? Revenue { get; init; }
    public required decimal? GrossProfit { get; init; }
    public required decimal? OperatingIncome { get; init; }
    public required decimal? NetIncome { get; init; }
    public required decimal? Eps { get; init; }
}

public sealed record BalanceSheetQuarter
{
    public required DateOnly EndDate { get; init; }
    public required decimal? TotalAssets { get; init; }
    public required decimal? TotalLiabilities { get; init; }
    public required decimal? TotalEquity { get; init; }
    public required decimal? Cash { get; init; }
    public required decimal? TotalDebt { get; init; }
}

public sealed record CashFlowQuarter
{
    public required DateOnly EndDate { get; init; }
    public required decimal? OperatingCashFlow { get; init; }
    public required decimal? InvestingCashFlow { get; init; }
    public required decimal? FinancingCashFlow { get; init; }
    public required decimal? FreeCashFlow { get; init; }
    public required decimal? CapitalExpenditure { get; init; }
}
