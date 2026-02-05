using FluentAssertions;
using Moodfolio.Application.MarketWeather.Services;

namespace Moodfolio.Application.Tests.MarketWeather;

public class TrendAnalyzerTests
{
    private readonly TrendAnalyzer _analyzer = new();

    [Fact]
    public void Analyze_NoPreviousScore_ReturnsNeutral()
    {
        var result = _analyzer.Analyze(currentScore: 50, previousScore: null);

        result.Should().Be(Trend.Neutral);
    }

    [Theory]
    [InlineData(60, 50, Trend.Up)]
    [InlineData(70, 55, Trend.Up)]
    [InlineData(100, 90, Trend.Up)]
    public void Analyze_SignificantIncrease_ReturnsUp(int current, int previous, Trend expected)
    {
        var result = _analyzer.Analyze(current, previous);

        result.Should().Be(expected);
    }

    [Theory]
    [InlineData(40, 50, Trend.Down)]
    [InlineData(30, 45, Trend.Down)]
    [InlineData(0, 10, Trend.Down)]
    public void Analyze_SignificantDecrease_ReturnsDown(int current, int previous, Trend expected)
    {
        var result = _analyzer.Analyze(current, previous);

        result.Should().Be(expected);
    }

    [Theory]
    [InlineData(50, 50, Trend.Neutral)]
    [InlineData(51, 50, Trend.Neutral)]
    [InlineData(52, 50, Trend.Neutral)]
    [InlineData(53, 50, Trend.Neutral)]
    [InlineData(48, 50, Trend.Neutral)]
    [InlineData(47, 50, Trend.Neutral)]
    public void Analyze_SmallChange_ReturnsNeutral(int current, int previous, Trend expected)
    {
        var result = _analyzer.Analyze(current, previous);

        result.Should().Be(expected);
    }
}
