using Moodfolio.Domain.Entities;

namespace Moodfolio.Application.Stock.Services;

public interface ITechnicalIndicatorCalculator
{
    TechnicalIndicatorSet? Calculate(IReadOnlyList<DailyPrice> prices);
}
