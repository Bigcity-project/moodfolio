namespace Moodfolio.Application.MarketWeather.Services;

public enum Trend
{
    Up,
    Down,
    Neutral
}

public interface ITrendAnalyzer
{
    Trend Analyze(int currentScore, int? previousScore);
}

public class TrendAnalyzer : ITrendAnalyzer
{
    private const int NeutralThreshold = 3;

    public Trend Analyze(int currentScore, int? previousScore)
    {
        if (previousScore is null)
        {
            return Trend.Neutral;
        }

        var difference = currentScore - previousScore.Value;

        return difference switch
        {
            > NeutralThreshold => Trend.Up,
            < -NeutralThreshold => Trend.Down,
            _ => Trend.Neutral
        };
    }
}
