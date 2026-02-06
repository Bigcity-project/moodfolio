using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Moodfolio.Application.Common.Interfaces;
using Moodfolio.Domain.Entities;

namespace Moodfolio.Infrastructure.Analysis;

public class ClaudeStockAnalyzer : IStockAnalyzer
{
    private readonly string? _apiKey;
    private readonly IHttpClientFactory _httpClientFactory;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public ClaudeStockAnalyzer(IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _apiKey = configuration["Anthropic:ApiKey"];
        _httpClientFactory = httpClientFactory;
    }

    public async Task<StockAnalysis> AnalyzeAsync(
        StockSnapshot snapshot,
        IReadOnlyList<NewsArticle> news,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            return GenerateFallbackAnalysis(snapshot);
        }

        try
        {
            return await CallClaudeApiAsync(snapshot, news, cancellationToken);
        }
        catch
        {
            return GenerateFallbackAnalysis(snapshot);
        }
    }

    private async Task<StockAnalysis> CallClaudeApiAsync(
        StockSnapshot snapshot,
        IReadOnlyList<NewsArticle> news,
        CancellationToken cancellationToken)
    {
        var newsHeadlines = news.Count > 0
            ? string.Join("\n", news.Select(n => $"- {n.Title}"))
            : "No recent news available.";

        var marketCap = snapshot.MarketCap.HasValue ? $"${snapshot.MarketCap.Value:N0}" : "N/A";
        var trailingPe = snapshot.TrailingPE.HasValue ? $"{snapshot.TrailingPE.Value:F2}" : "N/A";

        var prompt = $$"""
            You are a stock analyst. Analyze the following stock data and provide your assessment.

            Stock: {{snapshot.Name}} ({{snapshot.Symbol}})
            Price: ${{snapshot.Price:F2}}
            Change: {{snapshot.Change:F2}} ({{snapshot.ChangePercent:F2}}%)
            Volume: {{snapshot.Volume:N0}}
            Market Cap: {{marketCap}}
            Trailing P/E: {{trailingPe}}
            52-Week High: ${{snapshot.FiftyTwoWeekHigh:F2}}
            52-Week Low: ${{snapshot.FiftyTwoWeekLow:F2}}
            Day High: ${{snapshot.DayHigh:F2}}
            Day Low: ${{snapshot.DayLow:F2}}

            Recent News Headlines:
            {{newsHeadlines}}

            Respond ONLY with a valid JSON object in the following format (no markdown, no code fences):
            {"summary": "2-3 sentence analysis summary", "recommendation": "BUY or HOLD or SELL", "reasoning": "2-3 sentence explanation for the recommendation"}
            """;

        var requestBody = new
        {
            model = "claude-sonnet-4-5-20250929",
            max_tokens = 512,
            messages = new[]
            {
                new { role = "user", content = prompt },
            },
        };

        var httpClient = _httpClientFactory.CreateClient("Claude");
        httpClient.DefaultRequestHeaders.Clear();
        httpClient.DefaultRequestHeaders.Add("x-api-key", _apiKey);
        httpClient.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");
        httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        var json = JsonSerializer.Serialize(requestBody);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await httpClient.PostAsync("https://api.anthropic.com/v1/messages", content, cancellationToken);
        response.EnsureSuccessStatusCode();

        var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
        using var doc = JsonDocument.Parse(responseJson);

        var textContent = doc.RootElement
            .GetProperty("content")[0]
            .GetProperty("text")
            .GetString() ?? string.Empty;

        var analysisResult = JsonSerializer.Deserialize<ClaudeAnalysisResult>(textContent, JsonOptions);

        if (analysisResult is null)
        {
            return GenerateFallbackAnalysis(snapshot);
        }

        var recommendation = (analysisResult.Recommendation ?? "HOLD").ToUpperInvariant();
        if (recommendation != "BUY" && recommendation != "SELL" && recommendation != "HOLD")
        {
            recommendation = "HOLD";
        }

        return new StockAnalysis
        {
            Summary = analysisResult.Summary ?? "Analysis unavailable.",
            Recommendation = recommendation,
            Reasoning = analysisResult.Reasoning ?? "Unable to determine reasoning.",
        };
    }

    private static StockAnalysis GenerateFallbackAnalysis(StockSnapshot snapshot)
    {
        var recommendation = "HOLD";
        var reasons = new List<string>();

        if (snapshot.TrailingPE.HasValue)
        {
            if (snapshot.TrailingPE.Value < 15)
            {
                reasons.Add($"P/E ratio of {snapshot.TrailingPE.Value:F1} suggests the stock may be undervalued");
            }
            else if (snapshot.TrailingPE.Value > 30)
            {
                reasons.Add($"P/E ratio of {snapshot.TrailingPE.Value:F1} indicates the stock may be overvalued");
            }
            else
            {
                reasons.Add($"P/E ratio of {snapshot.TrailingPE.Value:F1} is within a reasonable range");
            }
        }

        if (snapshot.ChangePercent > 3)
        {
            reasons.Add($"Strong daily gain of {snapshot.ChangePercent:F1}% shows positive momentum");
        }
        else if (snapshot.ChangePercent < -3)
        {
            reasons.Add($"Significant daily decline of {snapshot.ChangePercent:F1}% may signal selling pressure");
        }

        var fiftyTwoWeekRange = snapshot.FiftyTwoWeekHigh - snapshot.FiftyTwoWeekLow;
        if (fiftyTwoWeekRange > 0)
        {
            var positionInRange = (snapshot.Price - snapshot.FiftyTwoWeekLow) / fiftyTwoWeekRange;
            if (positionInRange > 0.9m)
            {
                reasons.Add("Trading near 52-week high, may face resistance");
                recommendation = "HOLD";
            }
            else if (positionInRange < 0.2m)
            {
                reasons.Add("Trading near 52-week low, potential value opportunity");
                recommendation = "BUY";
            }
        }

        if (snapshot.TrailingPE.HasValue && snapshot.TrailingPE.Value < 15 && snapshot.ChangePercent > 0)
        {
            recommendation = "BUY";
        }
        else if (snapshot.TrailingPE.HasValue && snapshot.TrailingPE.Value > 35 && snapshot.ChangePercent < -2)
        {
            recommendation = "SELL";
        }

        var reasoning = reasons.Count > 0
            ? string.Join(". ", reasons) + "."
            : "Insufficient data for a detailed analysis. Consider monitoring the stock for more data points.";

        var summary = $"{snapshot.Name} ({snapshot.Symbol}) is currently trading at ${snapshot.Price:F2}, " +
                      $"{(snapshot.ChangePercent >= 0 ? "up" : "down")} {Math.Abs(snapshot.ChangePercent):F2}% today. " +
                      $"The stock is trading between ${snapshot.FiftyTwoWeekLow:F2} and ${snapshot.FiftyTwoWeekHigh:F2} over the past 52 weeks.";

        return new StockAnalysis
        {
            Summary = summary,
            Recommendation = recommendation,
            Reasoning = reasoning,
        };
    }

    private sealed record ClaudeAnalysisResult
    {
        public string? Summary { get; init; }
        public string? Recommendation { get; init; }
        public string? Reasoning { get; init; }
    }
}
