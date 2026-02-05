using Moodfolio.Domain.ValueObjects;

namespace Moodfolio.Application.MarketWeather.Services;

public interface IMoodScoreCalculator
{
    MoodScore Calculate(decimal vix, decimal rsi);
}

public class MoodScoreCalculator : IMoodScoreCalculator
{
    private const decimal VixMin = 10m;
    private const decimal VixMax = 80m;
    private const decimal VixWeight = 0.6m;
    private const decimal RsiWeight = 0.4m;

    public MoodScore Calculate(decimal vix, decimal rsi)
    {
        var normalizedVix = NormalizeVix(vix);
        var normalizedRsi = NormalizeRsi(rsi);

        var score = ((1 - normalizedVix) * VixWeight + normalizedRsi * RsiWeight) * 100;
        var clampedScore = (int)Math.Round(Math.Clamp(score, 0, 100));

        return MoodScore.FromUnchecked(clampedScore);
    }

    private static decimal NormalizeVix(decimal vix)
    {
        var clamped = Math.Clamp(vix, VixMin, VixMax);
        return (clamped - VixMin) / (VixMax - VixMin);
    }

    private static decimal NormalizeRsi(decimal rsi) =>
        Math.Clamp(rsi, 0, 100) / 100m;
}
