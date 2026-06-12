namespace OrderTracker.Core.Entities;

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public Order Order { get; set; } = null!;
}

public class DriverProfile
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string VehicleType { get; set; } = string.Empty;
    public string VehicleNumber { get; set; } = string.Empty;
    public double CurrentLat { get; set; }
    public double CurrentLng { get; set; }
    public bool IsAvailable { get; set; } = true;
    public DateTime LastLocationUpdate { get; set; } = DateTime.UtcNow;
    public User User { get; set; } = null!;
}

public class OrderStatusHistory
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Comment { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    public int ChangedBy { get; set; }
    public Order Order { get; set; } = null!;
}
