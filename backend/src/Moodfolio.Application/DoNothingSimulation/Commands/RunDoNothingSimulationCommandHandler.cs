using MediatR;
using Moodfolio.Application.Common.Interfaces;
using Moodfolio.Application.DoNothingSimulation.Services;
using Moodfolio.Contracts.V1.Responses;
using Moodfolio.Contracts.V1.Shared;
using Moodfolio.Domain.Entities;
using Moodfolio.Domain.Enums;
using Moodfolio.Domain.ValueObjects;

namespace Moodfolio.Application.DoNothingSimulation.Commands;

public class RunDoNothingSimulationCommandHandler : IRequestHandler<RunDoNothingSimulationCommand, DoNothingSimulationResponse>
{
    private readonly IMarketDataProvider _marketDataProvider;
    private readonly IPortfolioCalculator _portfolioCalculator;
    private readonly IBenchmarkSimulator _benchmarkSimulator;
    private readonly IVerdictGenerator _verdictGenerator;

    public RunDoNothingSimulationCommandHandler(
        IMarketDataProvider marketDataProvider,
        IPortfolioCalculator portfolioCalculator,
        IBenchmarkSimulator benchmarkSimulator,
        IVerdictGenerator verdictGenerator)
    {
        _marketDataProvider = marketDataProvider;
        _portfolioCalculator = portfolioCalculator;
        _benchmarkSimulator = benchmarkSimulator;
        _verdictGenerator = verdictGenerator;
    }

    public async Task<DoNothingSimulationResponse> Handle(RunDoNothingSimulationCommand command, CancellationToken cancellationToken)
    {
        var transactions = MapToTransactions(command.Request.Transactions);
        var orderedTransactions = transactions.OrderBy(t => t.Date).ToList();

        if (!orderedTransactions.Any())
        {
            return CreateEmptyResponse();
        }

        var startDate = orderedTransactions.First().Date;
        var endDate = DateOnly.FromDateTime(DateTime.UtcNow);
        var dateRange = DateRange.Create(startDate, endDate).Value!;

        var spyPrices = await _marketDataProvider.GetHistoricalPricesAsync("SPY", dateRange, cancellationToken);
        var symbols = orderedTransactions.Select(t => t.Symbol).Distinct().ToList();

        var portfolioPrices = new Dictionary<string, IReadOnlyList<DailyPrice>>();
        foreach (var symbol in symbols)
        {
            var prices = await _marketDataProvider.GetHistoricalPricesAsync(symbol, dateRange, cancellationToken);
            portfolioPrices[symbol] = prices;
        }

        var initialInvestment = _portfolioCalculator.CalculateInitialInvestment(orderedTransactions);
        var currentPrices = GetLatestPrices(portfolioPrices);
        var currentValue = _portfolioCalculator.CalculateCurrentValue(orderedTransactions, currentPrices);

        var actualReturnPct = _portfolioCalculator.CalculateReturnPct(currentValue, initialInvestment);

        var spyStartPrice = spyPrices.OrderBy(p => p.Date).FirstOrDefault()?.Close ?? 0;
        var spyEndPrice = spyPrices.OrderByDescending(p => p.Date).FirstOrDefault()?.Close ?? 0;
        var doNothingReturnPct = _benchmarkSimulator.CalculateDoNothingReturn(initialInvestment, spyStartPrice, spyEndPrice);

        var performanceDrag = actualReturnPct - doNothingReturnPct;
        var verdict = _verdictGenerator.Generate(actualReturnPct, doNothingReturnPct, performanceDrag);

        var chartData = _benchmarkSimulator.GenerateChartData(orderedTransactions, spyPrices, portfolioPrices);

        return new DoNothingSimulationResponse
        {
            ActualReturnPct = Math.Round(actualReturnPct, 2),
            DoNothingReturnPct = Math.Round(doNothingReturnPct, 2),
            PerformanceDrag = Math.Round(performanceDrag, 2),
            Verdict = verdict,
            ChartData = chartData.Select(c => new ChartDataPointDto
            {
                Date = c.Date,
                ActualValue = Math.Round(c.ActualValue, 2),
                DoNothingValue = Math.Round(c.DoNothingValue, 2)
            }).ToList()
        };
    }

    private static IReadOnlyList<Transaction> MapToTransactions(IReadOnlyList<TransactionDto> dtos)
    {
        return dtos.Select(dto => new Transaction
        {
            Date = dto.Date,
            Symbol = dto.Symbol.ToUpperInvariant(),
            Action = dto.Action.ToUpperInvariant() == "BUY" ? TransactionAction.Buy : TransactionAction.Sell,
            Quantity = dto.Quantity,
            Price = dto.Price
        }).ToList();
    }

    private static Dictionary<string, decimal> GetLatestPrices(Dictionary<string, IReadOnlyList<DailyPrice>> portfolioPrices)
    {
        return portfolioPrices.ToDictionary(
            kvp => kvp.Key,
            kvp => kvp.Value.OrderByDescending(p => p.Date).FirstOrDefault()?.Close ?? 0m
        );
    }

    private static DoNothingSimulationResponse CreateEmptyResponse()
    {
        return new DoNothingSimulationResponse
        {
            ActualReturnPct = 0,
            DoNothingReturnPct = 0,
            PerformanceDrag = 0,
            Verdict = "No transactions to analyze.",
            ChartData = []
        };
    }
}
