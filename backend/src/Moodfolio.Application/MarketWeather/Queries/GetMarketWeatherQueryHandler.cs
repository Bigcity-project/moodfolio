using MediatR;
using Moodfolio.Application.Common.Interfaces;
using Moodfolio.Application.MarketWeather.Services;
using Moodfolio.Contracts.V1.Responses;

namespace Moodfolio.Application.MarketWeather.Queries;

public class GetMarketWeatherQueryHandler : IRequestHandler<GetMarketWeatherQuery, MarketWeatherResponse>
{
    private readonly IMarketDataProvider _marketDataProvider;
    private readonly IMoodScoreCalculator _moodScoreCalculator;
    private readonly IWeatherClassifier _weatherClassifier;
    private readonly ITrendAnalyzer _trendAnalyzer;

    public GetMarketWeatherQueryHandler(
        IMarketDataProvider marketDataProvider,
        IMoodScoreCalculator moodScoreCalculator,
        IWeatherClassifier weatherClassifier,
        ITrendAnalyzer trendAnalyzer)
    {
        _marketDataProvider = marketDataProvider;
        _moodScoreCalculator = moodScoreCalculator;
        _weatherClassifier = weatherClassifier;
        _trendAnalyzer = trendAnalyzer;
    }

    public async Task<MarketWeatherResponse> Handle(GetMarketWeatherQuery request, CancellationToken cancellationToken)
    {
        var vix = await _marketDataProvider.GetCurrentVixAsync(cancellationToken);
        var rsi = await _marketDataProvider.CalculateRsiAsync("SPY", 14, cancellationToken);

        var moodScore = _moodScoreCalculator.Calculate(vix, rsi);
        var weatherType = _weatherClassifier.Classify(moodScore);
        var trend = _trendAnalyzer.Analyze(moodScore.Value, null);

        var factors = CreateMarketFactors(vix, rsi);

        return new MarketWeatherResponse
        {
            MoodScore = moodScore.Value,
            WeatherType = weatherType.ToString().ToUpperInvariant(),
            Trend = trend.ToString().ToUpperInvariant(),
            MainFactors = factors,
            Timestamp = DateTimeOffset.UtcNow
        };
    }

    private static IReadOnlyList<MarketFactorDto> CreateMarketFactors(decimal vix, decimal rsi)
    {
        return
        [
            new MarketFactorDto
            {
                Name = "VIX",
                Value = vix,
                Impact = vix switch
                {
                    < 20 => "POSITIVE",
                    > 30 => "NEGATIVE",
                    _ => "NEUTRAL"
                }
            },
            new MarketFactorDto
            {
                Name = "RSI",
                Value = rsi,
                Impact = rsi switch
                {
                    > 70 => "NEGATIVE",
                    < 30 => "POSITIVE",
                    _ => "NEUTRAL"
                }
            }
        ];
    }
}
