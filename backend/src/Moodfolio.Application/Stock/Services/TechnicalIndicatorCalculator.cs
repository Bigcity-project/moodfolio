using Moodfolio.Domain.Entities;

namespace Moodfolio.Application.Stock.Services;

public class TechnicalIndicatorCalculator : ITechnicalIndicatorCalculator
{
    private const int RsiPeriod = 14;
    private const int MacdFast = 12;
    private const int MacdSlow = 26;
    private const int MacdSignal = 9;
    private const int BollingerPeriod = 20;
    private const decimal BollingerStdDevMultiplier = 2m;

    public TechnicalIndicatorSet? Calculate(IReadOnlyList<DailyPrice> prices)
    {
        if (prices.Count < MacdSlow + MacdSignal)
        {
            return null;
        }

        var closes = prices.Select(p => p.Close).ToArray();

        return new TechnicalIndicatorSet
        {
            Rsi = CalculateRsi(closes),
            Macd = CalculateMacd(closes),
            BollingerBands = CalculateBollingerBands(closes),
        };
    }

    private static decimal? CalculateRsi(decimal[] closes)
    {
        if (closes.Length < RsiPeriod + 1)
        {
            return null;
        }

        var changes = new decimal[closes.Length - 1];
        for (var i = 0; i < changes.Length; i++)
        {
            changes[i] = closes[i + 1] - closes[i];
        }

        // Initial average gain/loss using first RsiPeriod changes
        var avgGain = 0m;
        var avgLoss = 0m;
        for (var i = 0; i < RsiPeriod; i++)
        {
            if (changes[i] > 0)
                avgGain += changes[i];
            else
                avgLoss += Math.Abs(changes[i]);
        }

        avgGain /= RsiPeriod;
        avgLoss /= RsiPeriod;

        // Wilder smoothing for remaining changes
        for (var i = RsiPeriod; i < changes.Length; i++)
        {
            var gain = changes[i] > 0 ? changes[i] : 0;
            var loss = changes[i] < 0 ? Math.Abs(changes[i]) : 0;

            avgGain = (avgGain * (RsiPeriod - 1) + gain) / RsiPeriod;
            avgLoss = (avgLoss * (RsiPeriod - 1) + loss) / RsiPeriod;
        }

        if (avgLoss == 0)
        {
            return 100m;
        }

        var rs = avgGain / avgLoss;
        return Math.Round(100m - (100m / (1m + rs)), 2);
    }

    private static MacdResult? CalculateMacd(decimal[] closes)
    {
        if (closes.Length < MacdSlow + MacdSignal)
        {
            return null;
        }

        var emaFast = CalculateEma(closes, MacdFast);
        var emaSlow = CalculateEma(closes, MacdSlow);

        if (emaFast is null || emaSlow is null)
        {
            return null;
        }

        // MACD line = EMA(fast) - EMA(slow), aligned from the slow start
        var offset = MacdSlow - MacdFast;
        var macdLength = emaSlow.Length;
        var macdLine = new decimal[macdLength];
        for (var i = 0; i < macdLength; i++)
        {
            macdLine[i] = emaFast[i + offset] - emaSlow[i];
        }

        var signalLine = CalculateEma(macdLine, MacdSignal);
        if (signalLine is null)
        {
            return null;
        }

        var latestMacd = macdLine[^1];
        var latestSignal = signalLine[^1];

        return new MacdResult
        {
            MacdLine = Math.Round(latestMacd, 4),
            SignalLine = Math.Round(latestSignal, 4),
            Histogram = Math.Round(latestMacd - latestSignal, 4),
        };
    }

    private static BollingerBandsResult? CalculateBollingerBands(decimal[] closes)
    {
        if (closes.Length < BollingerPeriod)
        {
            return null;
        }

        var window = closes[^BollingerPeriod..];
        var sma = window.Average();

        var variance = window.Select(c => (c - sma) * (c - sma)).Average();
        var stdDev = (decimal)Math.Sqrt((double)variance);

        return new BollingerBandsResult
        {
            UpperBand = Math.Round(sma + BollingerStdDevMultiplier * stdDev, 4),
            MiddleBand = Math.Round(sma, 4),
            LowerBand = Math.Round(sma - BollingerStdDevMultiplier * stdDev, 4),
        };
    }

    private static decimal[]? CalculateEma(decimal[] data, int period)
    {
        if (data.Length < period)
        {
            return null;
        }

        var multiplier = 2m / (period + 1);
        var ema = new decimal[data.Length - period + 1];

        // Seed EMA with SMA of first 'period' values
        var sum = 0m;
        for (var i = 0; i < period; i++)
        {
            sum += data[i];
        }

        ema[0] = sum / period;

        for (var i = 1; i < ema.Length; i++)
        {
            ema[i] = (data[period + i - 1] - ema[i - 1]) * multiplier + ema[i - 1];
        }

        return ema;
    }
}
