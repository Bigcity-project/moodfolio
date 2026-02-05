using FluentAssertions;
using Moodfolio.Domain.ValueObjects;

namespace Moodfolio.Domain.Tests.ValueObjects;

public class MoodScoreTests
{
    [Theory]
    [InlineData(0)]
    [InlineData(50)]
    [InlineData(100)]
    public void Create_WithValidValue_ShouldSucceed(int value)
    {
        var result = MoodScore.Create(value);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Value.Should().Be(value);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(101)]
    [InlineData(-100)]
    [InlineData(200)]
    public void Create_WithInvalidValue_ShouldFail(int value)
    {
        var result = MoodScore.Create(value);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("between 0 and 100");
    }

    [Theory]
    [InlineData(-50, 0)]
    [InlineData(150, 100)]
    [InlineData(50, 50)]
    public void FromUnchecked_ShouldClampValue(int input, int expected)
    {
        var score = MoodScore.FromUnchecked(input);

        score.Value.Should().Be(expected);
    }

    [Fact]
    public void MoodScore_ShouldBeImmutable()
    {
        var score1 = MoodScore.Create(50).Value!;
        var score2 = MoodScore.Create(50).Value!;

        score1.Should().Be(score2);
        score1.GetHashCode().Should().Be(score2.GetHashCode());
    }
}
