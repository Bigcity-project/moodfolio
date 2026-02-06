using Moodfolio.Domain.Entities;

namespace Moodfolio.Application.Common.Interfaces;

public interface IStockAnalyzer
{
    Task<StockAnalysis> AnalyzeAsync(StockSnapshot snapshot, IReadOnlyList<NewsArticle> news, CancellationToken cancellationToken = default);
}
