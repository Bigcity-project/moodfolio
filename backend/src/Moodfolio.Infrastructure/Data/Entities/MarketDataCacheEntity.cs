namespace Moodfolio.Infrastructure.Data.Entities;

public class MarketDataCacheEntity
{
    public int Id { get; set; }
    public required string Symbol { get; set; }
    public required DateOnly Date { get; set; }
    public required decimal Open { get; set; }
    public required decimal High { get; set; }
    public required decimal Low { get; set; }
    public required decimal Close { get; set; }
    public required long Volume { get; set; }
    public DateTime CachedAt { get; set; } = DateTime.UtcNow;
}
