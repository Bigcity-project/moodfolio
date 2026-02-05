using FluentAssertions;
using Moodfolio.Application.MarketWeather.Services;

namespace Moodfolio.Application.Tests.MarketWeather;

public class MoodScoreCalculatorTests
{
    private readonly MoodScoreCalculator _calculator = new();

    [Fact]
    public void Calculate_VixHigh80_RsiLow20_ReturnsStormyScore()
    {
        // VIX = 80, RSI = 20 → Score < 30 → Stormy
        var result = _calculator.Calculate(vix: 80m, rsi: 20m);

        result.Value.Should().BeLessThan(30);
    }

    [Fact]
    public void Calculate_VixLow12_RsiHigh75_ReturnsSunnyScore()
    {
        // VIX = 12, RSI = 75 → Score > 80 → Sunny
        var result = _calculator.Calculate(vix: 12m, rsi: 75m);

        result.Value.Should().BeGreaterThanOrEqualTo(80);
    }

    [Fact]
    public void Calculate_VixMedium25_RsiMedium50_ReturnsCloudyScore()
    {
        // Medium values should give cloudy (50-79)
        var result = _calculator.Calculate(vix: 25m, rsi: 50m);

        result.Value.Should().BeInRange(40, 70);
    }

    [Fact]
    public void Calculate_ExtremeFear_VixMax_RsiMin_ReturnsMinScore()
    {
        var result = _calculator.Calculate(vix: 100m, rsi: 0m);

        result.Value.Should().Be(0);
    }

    [Fact]
    public void Calculate_ExtremeGreed_VixMin_RsiMax_ReturnsMaxScore()
    {
        var result = _calculator.Calculate(vix: 10m, rsi: 100m);

        result.Value.Should().Be(100);
    }

    [Theory]
    [InlineData(15, 50, 70, 85)] // Low VIX, high RSI
    [InlineData(40, 50, 30, 55)] // High VIX, medium RSI
    [InlineData(20, 30, 50, 70)] // Medium VIX, medium-low RSI
    public void Calculate_ReturnsScoreInExpectedRange(decimal vix, decimal rsi, int minExpected, int maxExpected)
    {
        var result = _calculator.Calculate(vix, rsi);

        result.Value.Should().BeInRange(minExpected, maxExpected);
    }

    [Fact]
    public void Calculate_VixBelowMin_TreatsAsMin()
    {
        var resultAtMin = _calculator.Calculate(vix: 10m, rsi: 50m);
        var resultBelowMin = _calculator.Calculate(vix: 5m, rsi: 50m);

        resultBelowMin.Value.Should().Be(resultAtMin.Value);
    }

    [Fact]
    public void Calculate_VixAboveMax_TreatsAsMax()
    {
        var resultAtMax = _calculator.Calculate(vix: 80m, rsi: 50m);
        var resultAboveMax = _calculator.Calculate(vix: 100m, rsi: 50m);

        resultAboveMax.Value.Should().Be(resultAtMax.Value);
    }
}
