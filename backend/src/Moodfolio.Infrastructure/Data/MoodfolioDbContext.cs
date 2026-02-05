using Microsoft.EntityFrameworkCore;
using Moodfolio.Infrastructure.Data.Entities;

namespace Moodfolio.Infrastructure.Data;

public class MoodfolioDbContext : DbContext
{
    public MoodfolioDbContext(DbContextOptions<MoodfolioDbContext> options) : base(options)
    {
    }

    public DbSet<UserTransactionEntity> Transactions => Set<UserTransactionEntity>();
    public DbSet<MarketDataCacheEntity> MarketDataCache => Set<MarketDataCacheEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserTransactionEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Symbol).IsRequired().HasMaxLength(10);
            entity.Property(e => e.Action).IsRequired().HasMaxLength(4);
            entity.HasIndex(e => e.Date);
            entity.HasIndex(e => e.Symbol);
        });

        modelBuilder.Entity<MarketDataCacheEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Symbol).IsRequired().HasMaxLength(10);
            entity.HasIndex(e => new { e.Symbol, e.Date }).IsUnique();
        });
    }
}
