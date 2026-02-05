using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Moodfolio.Application.Common.Interfaces;
using Moodfolio.Infrastructure.Data;
using Moodfolio.Infrastructure.MarketData;

namespace Moodfolio.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, string connectionString)
    {
        services.AddDbContext<MoodfolioDbContext>(options =>
            options.UseSqlite(connectionString));

        services.AddScoped<IMarketDataProvider, YahooMarketDataProvider>();

        return services;
    }
}
