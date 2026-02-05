using FluentAssertions;
using Moodfolio.Application.PortfolioPersona.Services;
using Moodfolio.Domain.Enums;

namespace Moodfolio.Application.Tests.PortfolioPersona;

public class PersonaClassifierTests
{
    private readonly PersonaClassifier _classifier = new();

    [Theory]
    [InlineData(400, 15, 10, 50)]
    [InlineData(500, 10, 5, 60)]
    public void Classify_LongHoldingLowTurnover_ReturnsHodler(
        decimal avgHoldingDays, decimal turnoverRate, decimal panicSellRatio, decimal winRate)
    {
        var result = _classifier.Classify(avgHoldingDays, turnoverRate, panicSellRatio, winRate);

        result.Should().Be(PersonaId.Hodler);
    }

    [Theory]
    [InlineData(1, 600, 20, 45)]
    [InlineData(2, 550, 30, 50)]
    public void Classify_ShortHoldingHighTurnover_ReturnsDayTrader(
        decimal avgHoldingDays, decimal turnoverRate, decimal panicSellRatio, decimal winRate)
    {
        var result = _classifier.Classify(avgHoldingDays, turnoverRate, panicSellRatio, winRate);

        result.Should().Be(PersonaId.DayTrader);
    }

    [Theory]
    [InlineData(30, 100, 65, 40)]
    [InlineData(60, 150, 80, 35)]
    public void Classify_HighPanicSellRatio_ReturnsPanicSeller(
        decimal avgHoldingDays, decimal turnoverRate, decimal panicSellRatio, decimal winRate)
    {
        var result = _classifier.Classify(avgHoldingDays, turnoverRate, panicSellRatio, winRate);

        result.Should().Be(PersonaId.PanicSeller);
    }

    [Theory]
    [InlineData(60, 50, 20, 75)]
    [InlineData(90, 80, 10, 80)]
    public void Classify_LowFrequencyHighWinRate_ReturnsSniper(
        decimal avgHoldingDays, decimal turnoverRate, decimal panicSellRatio, decimal winRate)
    {
        var result = _classifier.Classify(avgHoldingDays, turnoverRate, panicSellRatio, winRate);

        result.Should().Be(PersonaId.Sniper);
    }

    [Fact]
    public void Classify_AllSellsDuringVixHigh_ReturnsPanicSeller()
    {
        // panicSellRatio > 60% → PanicSeller
        var result = _classifier.Classify(
            avgHoldingDays: 30,
            turnoverRate: 100,
            panicSellRatio: 70,
            winRate: 40);

        result.Should().Be(PersonaId.PanicSeller);
    }

    [Fact]
    public void GetPersonaInfo_ReturnsCorrectInfo()
    {
        var info = _classifier.GetPersonaInfo(PersonaId.DayTrader);

        info.DisplayName.Should().Be("The Day Trader");
        info.Traits.Should().Contain("High frequency trading");
        info.Description.Should().NotBeEmpty();
        info.Advice.Should().NotBeEmpty();
    }
}
