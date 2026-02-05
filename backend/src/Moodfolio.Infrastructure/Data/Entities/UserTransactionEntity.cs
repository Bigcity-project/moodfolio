namespace Moodfolio.Infrastructure.Data.Entities;

public class UserTransactionEntity
{
    public int Id { get; set; }
    public required DateOnly Date { get; set; }
    public required string Symbol { get; set; }
    public required string Action { get; set; }
    public required decimal Quantity { get; set; }
    public required decimal Price { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
