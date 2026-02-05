using FluentAssertions;
using Moodfolio.Application.MarketWeather.Services;
using Moodfolio.Domain.Enums;
using Moodfolio.Domain.ValueObjects;

namespace Moodfolio.Application.Tests.MarketWeather;

public class WeatherClassifierTests
{
    private readonly WeatherClassifier _classifier = new();

    [Theory]
    [InlineData(80, WeatherType.Sunny)]
    [InlineData(90, WeatherType.Sunny)]
    [InlineData(100, WeatherType.Sunny)]
    public void Classify_HighScore_ReturnsSunny(int scoreValue, WeatherType expected)
    {
        var score = MoodScore.FromUnchecked(scoreValue);

        var result = _classifier.Classify(score);

        result.Should().Be(expected);
    }

    [Theory]
    [InlineData(50, WeatherType.Cloudy)]
    [InlineData(65, WeatherType.Cloudy)]
    [InlineData(79, WeatherType.Cloudy)]
    public void Classify_MediumScore_ReturnsCloudy(int scoreValue, WeatherType expected)
    {
        var score = MoodScore.FromUnchecked(scoreValue);

        var result = _classifier.Classify(score);

        result.Should().Be(expected);
    }

    [Theory]
    [InlineData(30, WeatherType.Rainy)]
    [InlineData(40, WeatherType.Rainy)]
    [InlineData(49, WeatherType.Rainy)]
    public void Classify_LowScore_ReturnsRainy(int scoreValue, WeatherType expected)
    {
        var score = MoodScore.FromUnchecked(scoreValue);

        var result = _classifier.Classify(score);

        result.Should().Be(expected);
    }

    [Theory]
    [InlineData(0, WeatherType.Stormy)]
    [InlineData(15, WeatherType.Stormy)]
    [InlineData(29, WeatherType.Stormy)]
    public void Classify_VeryLowScore_ReturnsStormy(int scoreValue, WeatherType expected)
    {
        var score = MoodScore.FromUnchecked(scoreValue);

        var result = _classifier.Classify(score);

        result.Should().Be(expected);
    }
}
