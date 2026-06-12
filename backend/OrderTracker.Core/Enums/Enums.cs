namespace OrderTracker.Core.Enums;

public enum UserRole
{
    Customer = 1,
    Driver = 2,
    Admin = 3
}

public enum OrderStatus
{
    Pending = 0,
    Confirmed = 1,
    AssignedToDriver = 2,
    PickedUp = 3,
    InTransit = 4,
    NearbyDelivery = 5,
    Delivered = 6,
    Cancelled = 7,
    Failed = 8
}
