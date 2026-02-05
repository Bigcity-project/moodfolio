using Moodfolio.Domain.Common;

namespace Moodfolio.Domain.ValueObjects;

public sealed record DateRange
{
    public DateOnly Start { get; }
    public DateOnly End { get; }

    private DateRange(DateOnly start, DateOnly end)
    {
        Start = start;
        End = end;
    }

    public static Result<DateRange> Create(DateOnly start, DateOnly end)
    {
        if (start > end)
        {
            return Result<DateRange>.Failure("Start date must be before or equal to end date");
        }

        return Result<DateRange>.Success(new DateRange(start, end));
    }

    public int TotalDays => End.DayNumber - Start.DayNumber;

    public bool Contains(DateOnly date) => date >= Start && date <= End;
}
