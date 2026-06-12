using OrderTracker.Core.Enums;

namespace OrderTracker.Core.DTOs;

// Auth DTOs
public record LoginRequest(string Email, string Password);
public record RegisterRequest(string Name, string Email, string Password, string Phone, UserRole Role);
public record AuthResponse(string Token, string RefreshToken, UserDto User);

// User DTOs
public record UserDto(int Id, string Name, string Email, string Phone, UserRole Role);

// Order DTOs
public record CreateOrderRequest(
    string PickupAddress, double PickupLat, double PickupLng,
    string DeliveryAddress, double DeliveryLat, double DeliveryLng,
    List<OrderItemRequest> Items, string? Notes);

public record OrderItemRequest(string Name, int Quantity, decimal Price);

public record UpdateOrderStatusRequest(int OrderId, OrderStatus Status, string? Comment);

public record AssignDriverRequest(int OrderId, int DriverId);

public record OrderDto(
    int Id, string OrderNumber, int CustomerId, string CustomerName,
    int? DriverId, string? DriverName, OrderStatus Status,
    string PickupAddress, double PickupLat, double PickupLng,
    string DeliveryAddress, double DeliveryLat, double DeliveryLng,
    decimal TotalAmount, string? Notes,
    DateTime CreatedAt, DateTime? DeliveredAt,
    List<OrderItemDto> Items, DriverLocationDto? DriverLocation);

public record OrderItemDto(int Id, string Name, int Quantity, decimal Price);

public record DriverLocationDto(double Lat, double Lng, DateTime LastUpdate);

// Location DTOs
public record UpdateLocationRequest(double Lat, double Lng);

public record LocationUpdateDto(int DriverId, string DriverName, double Lat, double Lng, int? ActiveOrderId);

// Dashboard DTOs
public record DashboardStatsDto(
    int TotalOrders, int PendingOrders, int ActiveOrders,
    int DeliveredToday, int ActiveDrivers, decimal TodayRevenue);

public record PagedResult<T>(IEnumerable<T> Items, int TotalCount, int Page, int PageSize);
