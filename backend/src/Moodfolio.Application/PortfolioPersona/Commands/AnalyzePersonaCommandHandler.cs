using MediatR;
using Moodfolio.Application.Common.Interfaces;
using Moodfolio.Application.PortfolioPersona.Services;
using Moodfolio.Contracts.V1.Responses;
using Moodfolio.Contracts.V1.Shared;
using Moodfolio.Domain.Entities;
using Moodfolio.Domain.Enums;
using Moodfolio.Domain.ValueObjects;

namespace Moodfolio.Application.PortfolioPersona.Commands;

public class AnalyzePersonaCommandHandler : IRequestHandler<AnalyzePersonaCommand, PersonaAnalysisResponse>
{
    private readonly IMarketDataProvider _marketDataProvider;
    private readonly IHoldingPeriodCalculator _holdingPeriodCalculator;
    private readonly ITurnoverRateCalculator _turnoverRateCalculator;
    private readonly IPanicSellRatioCalculator _panicSellRatioCalculator;
    private readonly IWinRateCalculator _winRateCalculator;
    private readonly IPersonaClassifier _personaClassifier;

    public AnalyzePersonaCommandHandler(
        IMarketDataProvider marketDataProvider,
        IHoldingPeriodCalculator holdingPeriodCalculator,
        ITurnoverRateCalculator turnoverRateCalculator,
        IPanicSellRatioCalculator panicSellRatioCalculator,
        IWinRateCalculator winRateCalculator,
        IPersonaClassifier personaClassifier)
    {
        _marketDataProvider = marketDataProvider;
        _holdingPeriodCalculator = holdingPeriodCalculator;
        _turnoverRateCalculator = turnoverRateCalculator;
        _panicSellRatioCalculator = panicSellRatioCalculator;
        _winRateCalculator = winRateCalculator;
        _personaClassifier = personaClassifier;
    }

    public async Task<PersonaAnalysisResponse> Handle(AnalyzePersonaCommand command, CancellationToken cancellationToken)
    {
        var transactions = MapToTransactions(command.Request.Transactions);
        var orderedTransactions = transactions.OrderBy(t => t.Date).ToList();

        if (!orderedTransactions.Any())
        {
            return CreateDefaultResponse();
        }

        var startDate = orderedTransactions.First().Date;
        var endDate = DateOnly.FromDateTime(DateTime.UtcNow);
        var dateRange = DateRange.Create(startDate, endDate).Value!;

        var marketData = await _marketDataProvider.GetLatestMarketDataAsync(cancellationToken);
        var marketDataList = marketData is not null ? [marketData] : new List<DailyMarketData>();

        var symbols = orderedTransactions.Select(t => t.Symbol).Distinct().ToList();
        var currentPrices = new Dictionary<string, decimal>();

        foreach (var symbol in symbols)
        {
            var prices = await _marketDataProvider.GetHistoricalPricesAsync(symbol, dateRange, cancellationToken);
            var latestPrice = prices.OrderByDescending(p => p.Date).FirstOrDefault()?.Close ?? 0;
            currentPrices[symbol] = latestPrice;
        }

        var avgHoldingDays = _holdingPeriodCalculator.CalculateAverageHoldingDays(orderedTransactions);
        var turnoverRate = _turnoverRateCalculator.CalculateTurnoverRate(orderedTransactions);
        var panicSellRatio = _panicSellRatioCalculator.CalculatePanicSellRatio(orderedTransactions, marketDataList);
        var winRate = _winRateCalculator.CalculateWinRate(orderedTransactions, currentPrices);

        var personaId = _personaClassifier.Classify(avgHoldingDays, turnoverRate, panicSellRatio, winRate);
        var personaInfo = _personaClassifier.GetPersonaInfo(personaId);

        return new PersonaAnalysisResponse
        {
            PersonaId = personaId.ToString().ToUpperInvariant(),
            DisplayName = personaInfo.DisplayName,
            Traits = personaInfo.Traits.ToList(),
            Description = personaInfo.Description,
            Advice = personaInfo.Advice,
            Stats = new PersonaStatsDto
            {
                AvgHoldingDays = Math.Round(avgHoldingDays, 1),
                TurnoverRate = Math.Round(turnoverRate, 1),
                PanicSellRatio = Math.Round(panicSellRatio, 1),
                WinRate = Math.Round(winRate, 1)
            }
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

    private PersonaAnalysisResponse CreateDefaultResponse()
    {
        var personaInfo = _personaClassifier.GetPersonaInfo(PersonaId.Hodler);
        return new PersonaAnalysisResponse
        {
            PersonaId = PersonaId.Hodler.ToString().ToUpperInvariant(),
            DisplayName = personaInfo.DisplayName,
            Traits = personaInfo.Traits.ToList(),
            Description = personaInfo.Description,
            Advice = personaInfo.Advice,
            Stats = new PersonaStatsDto
            {
                AvgHoldingDays = 0,
                TurnoverRate = 0,
                PanicSellRatio = 0,
                WinRate = 0
            }
        };
    }
}
