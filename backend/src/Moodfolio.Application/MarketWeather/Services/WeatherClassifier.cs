using Moodfolio.Domain.Enums;
using Moodfolio.Domain.ValueObjects;

namespace Moodfolio.Application.MarketWeather.Services;

public interface IWeatherClassifier
{
    WeatherType Classify(MoodScore score);
}

public class WeatherClassifier : IWeatherClassifier
{
    public WeatherType Classify(MoodScore score)
    {
        return score.Value switch
        {
            >= 80 => WeatherType.Sunny,
            >= 50 => WeatherType.Cloudy,
            >= 30 => WeatherType.Rainy,
            _ => WeatherType.Stormy
        };
    }
}
