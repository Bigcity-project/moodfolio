using FluentAssertions;
using Moodfolio.Domain.ValueObjects;

namespace Moodfolio.Domain.Tests.ValueObjects;

public class DateRangeTests
{
    [Fact]
    public void Create_WithValidRange_ShouldSucceed()
    {
        var start = new DateOnly(2024, 1, 1);
        var end = new DateOnly(2024, 12, 31);

        var result = DateRange.Create(start, end);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Start.Should().Be(start);
        result.Value!.End.Should().Be(end);
    }

    [Fact]
    public void Create_WithSameStartAndEnd_ShouldSucceed()
    {
        var date = new DateOnly(2024, 6, 15);

        var result = DateRange.Create(date, date);

        result.IsSuccess.Should().BeTrue();
        result.Value!.TotalDays.Should().Be(0);
    }

    [Fact]
    public void Create_WithStartAfterEnd_ShouldFail()
    {
        var start = new DateOnly(2024, 12, 31);
        var end = new DateOnly(2024, 1, 1);

        var result = DateRange.Create(start, end);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("before or equal");
    }

    [Fact]
    public void TotalDays_ShouldReturnCorrectValue()
    {
        var start = new DateOnly(2024, 1, 1);
        var end = new DateOnly(2024, 1, 31);

        var result = DateRange.Create(start, end);

        result.Value!.TotalDays.Should().Be(30);
    }

    [Theory]
    [InlineData("2024-06-15", true)]
    [InlineData("2024-01-01", true)]
    [InlineData("2024-12-31", true)]
    [InlineData("2023-12-31", false)]
    [InlineData("2025-01-01", false)]
    public void Contains_ShouldReturnCorrectResult(string dateStr, bool expected)
    {
        var start = new DateOnly(2024, 1, 1);
        var end = new DateOnly(2024, 12, 31);
        var date = DateOnly.Parse(dateStr);

        var range = DateRange.Create(start, end).Value!;

        range.Contains(date).Should().Be(expected);
    }
}
