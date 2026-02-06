namespace Moodfolio.Domain.Entities;

public sealed record NewsArticle
{
    public required string Title { get; init; }
    public required string Url { get; init; }
    public required DateTimeOffset PublishedAt { get; init; }
    public string? Description { get; init; }
}
