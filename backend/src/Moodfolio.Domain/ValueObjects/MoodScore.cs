using Moodfolio.Domain.Common;

namespace Moodfolio.Domain.ValueObjects;

public sealed record MoodScore
{
    public int Value { get; }

    private MoodScore(int value)
    {
        Value = value;
    }

    public static Result<MoodScore> Create(int value)
    {
        if (value < 0 || value > 100)
        {
            return Result<MoodScore>.Failure("MoodScore must be between 0 and 100");
        }

        return Result<MoodScore>.Success(new MoodScore(value));
    }

    public static MoodScore FromUnchecked(int value) => new(Math.Clamp(value, 0, 100));
}
