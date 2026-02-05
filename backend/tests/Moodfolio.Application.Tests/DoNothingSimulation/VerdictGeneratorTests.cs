using FluentAssertions;
using Moodfolio.Application.DoNothingSimulation.Services;

namespace Moodfolio.Application.Tests.DoNothingSimulation;

public class VerdictGeneratorTests
{
    private readonly VerdictGenerator _generator = new();

    [Theory]
    [InlineData(-50, 10, -60)]
    [InlineData(-30, 10, -40)]
    [InlineData(-25, 5, -30)]
    public void Generate_LargeLoss_ReturnsStrongWarning(decimal actualReturn, decimal doNothingReturn, decimal drag)
    {
        var result = _generator.Generate(actualReturn, doNothingReturn, drag);

        result.Should().Contain("cost you");
        result.Should().Contain("passive");
    }

    [Theory]
    [InlineData(5, 15, -10)]
    [InlineData(0, 8, -8)]
    public void Generate_ModerateLoss_ReturnsSuggestion(decimal actualReturn, decimal doNothingReturn, decimal drag)
    {
        var result = _generator.Generate(actualReturn, doNothingReturn, drag);

        result.Should().Contain("underperformed");
        result.Should().Contain("improvement");
    }

    [Theory]
    [InlineData(10, 12, -2)]
    [InlineData(8, 8, 0)]
    [InlineData(12, 10, 2)]
    public void Generate_NeutralPerformance_ReturnsEncouragement(decimal actualReturn, decimal doNothingReturn, decimal drag)
    {
        var result = _generator.Generate(actualReturn, doNothingReturn, drag);

        result.Should().Contain("roughly in line");
    }

    [Theory]
    [InlineData(20, 10, 10)]
    [InlineData(25, 10, 15)]
    public void Generate_ModerateGain_ReturnsPraise(decimal actualReturn, decimal doNothingReturn, decimal drag)
    {
        var result = _generator.Generate(actualReturn, doNothingReturn, drag);

        result.Should().Contain("added");
        result.Should().Contain("value");
    }

    [Theory]
    [InlineData(40, 10, 30)]
    [InlineData(50, 5, 45)]
    public void Generate_LargeGain_ReturnsExceptionalMessage(decimal actualReturn, decimal doNothingReturn, decimal drag)
    {
        var result = _generator.Generate(actualReturn, doNothingReturn, drag);

        result.Should().Contain("Exceptional");
    }
}
