using System.Net;
using System.Text.Json;
using System.Xml.Linq;
using Microsoft.EntityFrameworkCore;
using Moodfolio.Application.Common.Interfaces;
using Moodfolio.Domain.Entities;
using Moodfolio.Domain.ValueObjects;
using Moodfolio.Infrastructure.Data;
using Moodfolio.Infrastructure.Data.Entities;
using NodaTime;
using YahooQuotesApi;

namespace Moodfolio.Infrastructure.MarketData;

public class YahooMarketDataProvider : IMarketDataProvider
{
    private readonly MoodfolioDbContext _dbContext;
    private readonly YahooQuotes _yahooQuotes;

    public YahooMarketDataProvider(MoodfolioDbContext dbContext)
    {
        _dbContext = dbContext;
        _yahooQuotes = new YahooQuotesBuilder()
            .WithHistoryStartDate(Instant.FromUtc(DateTime.UtcNow.AddYears(-5).Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day, 0, 0))
            .Build();
    }

    public async Task<IReadOnlyList<DailyPrice>> GetHistoricalPricesAsync(
        string symbol,
        DateRange range,
        CancellationToken cancellationToken = default)
    {
        var cachedPrices = await GetCachedPricesAsync(symbol, range, cancellationToken);

        if (cachedPrices.Count > 0)
        {
            return cachedPrices;
        }

        try
        {
            var security = await _yahooQuotes.GetAsync(symbol, Histories.PriceHistory);

            if (security is null)
            {
                return [];
            }

            var priceHistory = security.PriceHistory;
            if (!priceHistory.HasValue || priceHistory.Value is null)
            {
                return [];
            }

            var prices = priceHistory.Value
                .Where(p => ToDateOnly(p.Date) >= range.Start && ToDateOnly(p.Date) <= range.End)
                .Select(p => new DailyPrice
                {
                    Date = ToDateOnly(p.Date),
                    Symbol = symbol.ToUpperInvariant(),
                    Open = (decimal)p.Open,
                    High = (decimal)p.High,
                    Low = (decimal)p.Low,
                    Close = (decimal)p.Close,
                    Volume = p.Volume
                })
                .OrderBy(p => p.Date)
                .ToList();

            await CachePricesAsync(prices, cancellationToken);

            return prices;
        }
        catch
        {
            return [];
        }
    }

    public async Task<decimal> GetCurrentVixAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var security = await _yahooQuotes.GetAsync("^VIX", Histories.PriceHistory);

            if (security is null)
            {
                return 20m;
            }

            var priceHistory = security.PriceHistory;
            if (!priceHistory.HasValue || priceHistory.Value is null)
            {
                return 20m;
            }

            var latestPrice = priceHistory.Value
                .OrderByDescending(p => p.Date)
                .FirstOrDefault();

            return (decimal)(latestPrice?.Close ?? 20);
        }
        catch
        {
            return 20m;
        }
    }

    public async Task<decimal> CalculateRsiAsync(string symbol, int period = 14, CancellationToken cancellationToken = default)
    {
        try
        {
            var endDate = DateOnly.FromDateTime(DateTime.UtcNow);
            var startDate = endDate.AddDays(-(period * 3));
            var dateRange = DateRange.Create(startDate, endDate).Value!;

            var prices = await GetHistoricalPricesAsync(symbol, dateRange, cancellationToken);

            if (prices.Count < period + 1)
            {
                return 50m;
            }

            var changes = new List<decimal>();
            for (int i = 1; i < prices.Count; i++)
            {
                changes.Add(prices[i].Close - prices[i - 1].Close);
            }

            var recentChanges = changes.TakeLast(period).ToList();

            var gains = recentChanges.Where(c => c > 0).DefaultIfEmpty(0).Average();
            var losses = Math.Abs(recentChanges.Where(c => c < 0).DefaultIfEmpty(0).Average());

            if (losses == 0)
            {
                return 100m;
            }

            var rs = (decimal)gains / (decimal)losses;
            var rsi = 100 - (100 / (1 + rs));

            return Math.Round(rsi, 2);
        }
        catch
        {
            return 50m;
        }
    }

    public async Task<DailyMarketData?> GetLatestMarketDataAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var vix = await GetCurrentVixAsync(cancellationToken);
            var endDate = DateOnly.FromDateTime(DateTime.UtcNow);
            var startDate = endDate.AddDays(-5);
            var dateRange = DateRange.Create(startDate, endDate).Value!;

            var spyPrices = await GetHistoricalPricesAsync("SPY", dateRange, cancellationToken);
            var latestSpy = spyPrices.OrderByDescending(p => p.Date).FirstOrDefault();

            return new DailyMarketData
            {
                Date = latestSpy?.Date ?? endDate,
                Vix = vix,
                SpyClose = latestSpy?.Close ?? 0
            };
        }
        catch
        {
            return null;
        }
    }

    public async Task<StockSnapshot?> GetStockSnapshotAsync(string symbol, CancellationToken cancellationToken = default)
    {
        try
        {
            var encodedSymbol = Uri.EscapeDataString(symbol.ToUpperInvariant());
            var url = $"https://query1.finance.yahoo.com/v8/finance/chart/{encodedSymbol}?interval=1d&range=1d";

            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0");
            var json = await httpClient.GetStringAsync(url, cancellationToken);

            using var doc = System.Text.Json.JsonDocument.Parse(json);
            var results = doc.RootElement.GetProperty("chart").GetProperty("result");

            if (results.GetArrayLength() == 0)
            {
                return null;
            }

            var meta = results[0].GetProperty("meta");

            var currentPrice = meta.GetProperty("regularMarketPrice").GetDecimal();
            var previousClose = meta.TryGetProperty("chartPreviousClose", out var prevEl) ? prevEl.GetDecimal() : currentPrice;
            var change = currentPrice - previousClose;
            var changePercent = previousClose != 0 ? (change / previousClose) * 100 : 0;

            return new StockSnapshot
            {
                Symbol = symbol.ToUpperInvariant(),
                Name = meta.TryGetProperty("longName", out var ln) ? ln.GetString() ?? symbol.ToUpperInvariant()
                     : meta.TryGetProperty("shortName", out var sn) ? sn.GetString() ?? symbol.ToUpperInvariant()
                     : symbol.ToUpperInvariant(),
                Price = currentPrice,
                Change = change,
                ChangePercent = Math.Round(changePercent, 2),
                Volume = meta.TryGetProperty("regularMarketVolume", out var vol) ? vol.GetInt64() : 0,
                MarketCap = null,
                TrailingPE = null,
                FiftyTwoWeekHigh = meta.TryGetProperty("fiftyTwoWeekHigh", out var h52) ? h52.GetDecimal() : 0,
                FiftyTwoWeekLow = meta.TryGetProperty("fiftyTwoWeekLow", out var l52) ? l52.GetDecimal() : 0,
                DayHigh = meta.TryGetProperty("regularMarketDayHigh", out var dh) ? dh.GetDecimal() : 0,
                DayLow = meta.TryGetProperty("regularMarketDayLow", out var dl) ? dl.GetDecimal() : 0,
            };
        }
        catch
        {
            return null;
        }
    }

    public async Task<IReadOnlyList<NewsArticle>> GetStockNewsAsync(string symbol, int maxArticles = 20, CancellationToken cancellationToken = default)
    {
        try
        {
            var encodedSymbol = Uri.EscapeDataString(symbol.ToUpperInvariant());
            var url = $"https://feeds.finance.yahoo.com/rss/2.0/headline?s={encodedSymbol}&region=US&lang=en-US";

            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("Moodfolio/1.0");
            var rssContent = await httpClient.GetStringAsync(url, cancellationToken);

            var doc = XDocument.Parse(rssContent);
            var items = doc.Descendants("item")
                .Take(maxArticles)
                .Select(item => new NewsArticle
                {
                    Title = item.Element("title")?.Value ?? string.Empty,
                    Url = item.Element("link")?.Value ?? string.Empty,
                    PublishedAt = DateTimeOffset.TryParse(item.Element("pubDate")?.Value, out var date)
                        ? date
                        : DateTimeOffset.UtcNow,
                    Description = item.Element("description")?.Value,
                })
                .Where(n => !string.IsNullOrEmpty(n.Title))
                .ToList();

            return items;
        }
        catch
        {
            return [];
        }
    }

    public async Task<IReadOnlyList<DailyPrice>> GetChartHistoryAsync(string symbol, CancellationToken cancellationToken = default)
    {
        try
        {
            var encodedSymbol = Uri.EscapeDataString(symbol.ToUpperInvariant());
            var url = $"https://query1.finance.yahoo.com/v8/finance/chart/{encodedSymbol}?interval=1d&range=6mo";

            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0");
            var json = await httpClient.GetStringAsync(url, cancellationToken);

            using var doc = JsonDocument.Parse(json);
            var results = doc.RootElement.GetProperty("chart").GetProperty("result");

            if (results.GetArrayLength() == 0)
            {
                return [];
            }

            var result = results[0];
            var timestamps = result.GetProperty("timestamp");
            var quote = result.GetProperty("indicators").GetProperty("quote")[0];

            var opens = quote.GetProperty("open");
            var highs = quote.GetProperty("high");
            var lows = quote.GetProperty("low");
            var closes = quote.GetProperty("close");
            var volumes = quote.GetProperty("volume");

            var prices = new List<DailyPrice>();
            for (var i = 0; i < timestamps.GetArrayLength(); i++)
            {
                if (closes[i].ValueKind == JsonValueKind.Null)
                {
                    continue;
                }

                var unixTime = timestamps[i].GetInt64();
                var date = DateOnly.FromDateTime(DateTimeOffset.FromUnixTimeSeconds(unixTime).UtcDateTime);

                prices.Add(new DailyPrice
                {
                    Date = date,
                    Symbol = symbol.ToUpperInvariant(),
                    Open = opens[i].ValueKind != JsonValueKind.Null ? opens[i].GetDecimal() : closes[i].GetDecimal(),
                    High = highs[i].ValueKind != JsonValueKind.Null ? highs[i].GetDecimal() : closes[i].GetDecimal(),
                    Low = lows[i].ValueKind != JsonValueKind.Null ? lows[i].GetDecimal() : closes[i].GetDecimal(),
                    Close = closes[i].GetDecimal(),
                    Volume = volumes[i].ValueKind != JsonValueKind.Null ? volumes[i].GetInt64() : 0,
                });
            }

            return prices;
        }
        catch
        {
            return [];
        }
    }

    public async Task<IReadOnlyList<StockSnapshot>> GetPeerStocksAsync(string symbol, CancellationToken cancellationToken = default)
    {
        try
        {
            var encodedSymbol = Uri.EscapeDataString(symbol.ToUpperInvariant());
            var url = $"https://query1.finance.yahoo.com/v6/finance/recommendationsbysymbol/{encodedSymbol}";

            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0");
            var json = await httpClient.GetStringAsync(url, cancellationToken);

            using var doc = JsonDocument.Parse(json);
            var finance = doc.RootElement.GetProperty("finance");
            var results = finance.GetProperty("result");

            if (results.GetArrayLength() == 0)
            {
                return [];
            }

            var recommendedSymbols = results[0]
                .GetProperty("recommendedSymbols")
                .EnumerateArray()
                .Take(5)
                .Select(s => s.GetProperty("symbol").GetString()!)
                .ToList();

            var tasks = recommendedSymbols.Select(s => GetStockSnapshotAsync(s, cancellationToken));
            var snapshots = await Task.WhenAll(tasks);

            return snapshots
                .Where(s => s is not null)
                .Cast<StockSnapshot>()
                .ToList();
        }
        catch
        {
            return [];
        }
    }

    public async Task<FinancialStatements?> GetFinancialStatementsAsync(string symbol, CancellationToken cancellationToken = default)
    {
        try
        {
            // Use a single HttpClient+CookieContainer for the entire cookie→crumb→v10 flow
            using var handler = new HttpClientHandler
            {
                UseCookies = true,
                AllowAutoRedirect = true,
            };
            using var httpClient = new HttpClient(handler);
            httpClient.DefaultRequestHeaders.UserAgent.ParseAdd(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36");

            // Step 1: GET consent page to obtain cookies (.yahoo.com domain)
            var consentResponse = await httpClient.GetAsync("https://fc.yahoo.com", cancellationToken);
            // fc.yahoo.com typically returns 404 but still sets cookies — that's expected

            // Step 2: GET crumb (cookies are automatically sent via CookieContainer)
            var crumbResponse = await httpClient.GetAsync(
                "https://query2.finance.yahoo.com/v1/test/getcrumb", cancellationToken);

            if (!crumbResponse.IsSuccessStatusCode)
            {
                return null;
            }

            var crumb = await crumbResponse.Content.ReadAsStringAsync(cancellationToken);
            if (string.IsNullOrWhiteSpace(crumb) || crumb.Contains("Too Many"))
            {
                return null;
            }

            // Step 3: v10 quoteSummary with crumb (cookies auto-sent)
            // Use earnings + earningsHistory + financialData (quarterly statement modules are broken/sparse)
            var encodedSymbol = Uri.EscapeDataString(symbol.ToUpperInvariant());
            var encodedCrumb = Uri.EscapeDataString(crumb);
            var modules = "earnings,earningsHistory,financialData";
            var url = $"https://query2.finance.yahoo.com/v10/finance/quoteSummary/{encodedSymbol}?modules={modules}&crumb={encodedCrumb}";

            var json = await httpClient.GetStringAsync(url, cancellationToken);
            using var doc = JsonDocument.Parse(json);

            var result = doc.RootElement
                .GetProperty("quoteSummary")
                .GetProperty("result")[0];

            var incomeStatements = ParseIncomeFromEarnings(result);
            var balanceSheets = ParseBalanceFromFinancialData(result);
            var cashFlows = ParseCashFlowFromFinancialData(result);

            if (incomeStatements.Count == 0 && balanceSheets.Count == 0 && cashFlows.Count == 0)
            {
                return null;
            }

            return new FinancialStatements
            {
                IncomeStatements = incomeStatements,
                BalanceSheets = balanceSheets,
                CashFlows = cashFlows,
            };
        }
        catch
        {
            return null;
        }
    }

    private static List<IncomeStatementQuarter> ParseIncomeFromEarnings(JsonElement result)
    {
        try
        {
            // Build EPS lookup from earningsHistory
            var epsMap = new Dictionary<string, decimal>();
            if (result.TryGetProperty("earningsHistory", out var eh) &&
                eh.TryGetProperty("history", out var history))
            {
                foreach (var item in history.EnumerateArray())
                {
                    if (item.TryGetProperty("quarter", out var q) &&
                        q.TryGetProperty("fmt", out var qFmt) &&
                        item.TryGetProperty("epsActual", out var epsActual) &&
                        epsActual.TryGetProperty("raw", out var epsRaw) &&
                        epsRaw.ValueKind == JsonValueKind.Number)
                    {
                        var key = qFmt.GetString();
                        if (key is not null)
                        {
                            epsMap[key] = epsRaw.GetDecimal();
                        }
                    }
                }
            }

            // Build quarterly income from earnings.financialsChart.quarterly
            var quarterly = result
                .GetProperty("earnings")
                .GetProperty("financialsChart")
                .GetProperty("quarterly");

            var statements = quarterly.EnumerateArray()
                .Take(4)
                .Select(q =>
                {
                    var dateStr = q.GetProperty("date").GetString() ?? "";
                    var endDate = ParseQuarterDate(dateStr);

                    // Match EPS by endDate (earningsHistory uses endDate as fmt like "2025-09-30")
                    var endDateKey = endDate.ToString("yyyy-MM-dd");
                    var eps = epsMap.TryGetValue(endDateKey, out var epsVal) ? epsVal : (decimal?)null;

                    return new IncomeStatementQuarter
                    {
                        EndDate = endDate,
                        Revenue = GetRawValue(q, "revenue"),
                        GrossProfit = null,
                        OperatingIncome = null,
                        NetIncome = GetRawValue(q, "earnings"),
                        Eps = eps,
                    };
                })
                .ToList();

            return statements;
        }
        catch
        {
            return [];
        }
    }

    private static List<BalanceSheetQuarter> ParseBalanceFromFinancialData(JsonElement result)
    {
        try
        {
            if (!result.TryGetProperty("financialData", out var fd))
            {
                return [];
            }

            // financialData is a snapshot (not quarterly), create a single entry
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            return
            [
                new BalanceSheetQuarter
                {
                    EndDate = today,
                    TotalAssets = null,
                    TotalLiabilities = null,
                    TotalEquity = null,
                    Cash = GetRawValue(fd, "totalCash"),
                    TotalDebt = GetRawValue(fd, "totalDebt"),
                },
            ];
        }
        catch
        {
            return [];
        }
    }

    private static List<CashFlowQuarter> ParseCashFlowFromFinancialData(JsonElement result)
    {
        try
        {
            if (!result.TryGetProperty("financialData", out var fd))
            {
                return [];
            }

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var opCf = GetRawValue(fd, "operatingCashflow");
            var fcf = GetRawValue(fd, "freeCashflow");
            var capex = opCf.HasValue && fcf.HasValue ? fcf.Value - opCf.Value : (decimal?)null;

            return
            [
                new CashFlowQuarter
                {
                    EndDate = today,
                    OperatingCashFlow = opCf,
                    InvestingCashFlow = null,
                    FinancingCashFlow = null,
                    FreeCashFlow = fcf,
                    CapitalExpenditure = capex,
                },
            ];
        }
        catch
        {
            return [];
        }
    }

    /// <summary>
    /// Parse date string like "1Q2025" or "3Q2024" into end-of-quarter DateOnly.
    /// </summary>
    private static DateOnly ParseQuarterDate(string dateStr)
    {
        // Format: "1Q2025" → Q1 2025 → end of March
        try
        {
            if (dateStr.Length >= 6 && dateStr[1] == 'Q')
            {
                var quarter = dateStr[0] - '0';
                var year = int.Parse(dateStr[2..]);
                var endMonth = quarter * 3;
                return new DateOnly(year, endMonth, DateTime.DaysInMonth(year, endMonth));
            }
        }
        catch
        {
            // fall through
        }

        return DateOnly.FromDateTime(DateTime.UtcNow);
    }

    private static decimal? GetRawValue(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out var prop))
        {
            return null;
        }

        if (prop.TryGetProperty("raw", out var raw))
        {
            return raw.ValueKind == JsonValueKind.Number ? raw.GetDecimal() : null;
        }

        return prop.ValueKind == JsonValueKind.Number ? prop.GetDecimal() : null;
    }

    private static DateOnly ToDateOnly(LocalDate localDate)
    {
        return new DateOnly(localDate.Year, localDate.Month, localDate.Day);
    }

    private async Task<List<DailyPrice>> GetCachedPricesAsync(
        string symbol,
        DateRange range,
        CancellationToken cancellationToken)
    {
        var cachedData = await _dbContext.MarketDataCache
            .Where(c => c.Symbol == symbol.ToUpperInvariant() &&
                       c.Date >= range.Start &&
                       c.Date <= range.End &&
                       c.CachedAt > DateTime.UtcNow.AddHours(-24))
            .OrderBy(c => c.Date)
            .ToListAsync(cancellationToken);

        return cachedData.Select(c => new DailyPrice
        {
            Date = c.Date,
            Symbol = c.Symbol,
            Open = c.Open,
            High = c.High,
            Low = c.Low,
            Close = c.Close,
            Volume = c.Volume
        }).ToList();
    }

    private async Task CachePricesAsync(IReadOnlyList<DailyPrice> prices, CancellationToken cancellationToken)
    {
        foreach (var price in prices)
        {
            var existing = await _dbContext.MarketDataCache
                .FirstOrDefaultAsync(c => c.Symbol == price.Symbol && c.Date == price.Date, cancellationToken);

            if (existing is null)
            {
                _dbContext.MarketDataCache.Add(new MarketDataCacheEntity
                {
                    Symbol = price.Symbol,
                    Date = price.Date,
                    Open = price.Open,
                    High = price.High,
                    Low = price.Low,
                    Close = price.Close,
                    Volume = price.Volume
                });
            }
            else
            {
                existing.Open = price.Open;
                existing.High = price.High;
                existing.Low = price.Low;
                existing.Close = price.Close;
                existing.Volume = price.Volume;
                existing.CachedAt = DateTime.UtcNow;
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
