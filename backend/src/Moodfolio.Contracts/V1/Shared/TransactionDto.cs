namespace Moodfolio.Contracts.V1.Shared;

public sealed record TransactionDto
{
    public required DateOnly Date { get; init; }
    public required string Symbol { get; init; }
    public required string Action { get; init; }
    public required decimal Quantity { get; init; }
    public required decimal Price { get; init; }
}
