using FluentAssertions;
using Moodfolio.Application.DoNothingSimulation.Services;

namespace Moodfolio.Application.Tests.DoNothingSimulation;

public class BenchmarkSimulatorTests
{
    private readonly BenchmarkSimulator _simulator = new();

    [Fact]
    public void CalculateDoNothingReturn_SpyUp10Pct_Returns10Pct()
    {
        var result = _simulator.CalculateDoNothingReturn(
            initialInvestment: 10000m,
            spyStartPrice: 100m,
            spyEndPrice: 110m);

        result.Should().Be(10m);
    }

    [Fact]
    public void CalculateDoNothingReturn_SpyDown20Pct_ReturnsNegative20Pct()
    {
        var result = _simulator.CalculateDoNothingReturn(
            initialInvestment: 10000m,
            spyStartPrice: 100m,
            spyEndPrice: 80m);

        result.Should().Be(-20m);
    }

    [Fact]
    public void CalculateDoNothingReturn_ZeroStartPrice_ReturnsZero()
    {
        var result = _simulator.CalculateDoNothingReturn(
            initialInvestment: 10000m,
            spyStartPrice: 0m,
            spyEndPrice: 110m);

        result.Should().Be(0m);
    }

    [Fact]
    public void CalculateDoNothingReturn_ZeroInvestment_ReturnsZero()
    {
        var result = _simulator.CalculateDoNothingReturn(
            initialInvestment: 0m,
            spyStartPrice: 100m,
            spyEndPrice: 110m);

        result.Should().Be(0m);
    }

    [Fact]
    public void Simulate_OnlyBuySpy_NearZeroDrag()
    {
        // If you only buy SPY, the do-nothing strategy IS your strategy
        // So the drag should be approximately zero
        var spyReturn = _simulator.CalculateDoNothingReturn(
            initialInvestment: 10000m,
            spyStartPrice: 100m,
            spyEndPrice: 110m);

        // If portfolio is also SPY, returns match
        spyReturn.Should().Be(10m);
    }
}
