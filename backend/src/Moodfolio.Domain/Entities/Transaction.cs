using Moodfolio.Domain.Enums;

namespace Moodfolio.Domain.Entities;

public sealed record Transaction
{
    public required DateOnly Date { get; init; }
    public required string Symbol { get; init; }
    public required TransactionAction Action { get; init; }
    public required decimal Quantity { get; init; }
    public required decimal Price { get; init; }

    public decimal TotalValue => Quantity * Price;
}
