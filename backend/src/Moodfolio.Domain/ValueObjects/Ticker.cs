using System.Text.RegularExpressions;
using Moodfolio.Domain.Common;

namespace Moodfolio.Domain.ValueObjects;

public sealed partial record Ticker
{
    public string Value { get; }

    private Ticker(string value)
    {
        Value = value;
    }

    public static Result<Ticker> Create(string? symbol)
    {
        if (string.IsNullOrWhiteSpace(symbol))
        {
            return Result<Ticker>.Failure("Ticker symbol is required");
        }

        var normalized = symbol.Trim().ToUpperInvariant();

        if (normalized.Length < 1 || normalized.Length > 10)
        {
            return Result<Ticker>.Failure("Ticker symbol must be between 1 and 10 characters");
        }

        if (!TickerPattern().IsMatch(normalized))
        {
            return Result<Ticker>.Failure("Ticker symbol must contain only letters, digits, or dots");
        }

        return Result<Ticker>.Success(new Ticker(normalized));
    }

    [GeneratedRegex("^[A-Z0-9.]+$")]
    private static partial Regex TickerPattern();
}
