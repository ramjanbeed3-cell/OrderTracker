using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using OrderTracker.Core.DTOs;
using OrderTracker.Core.Entities;
using OrderTracker.Core.Enums;
using OrderTracker.Core.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace OrderTracker.Application.Services;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
}

public interface IOrderService
{
    Task<OrderDto> CreateOrderAsync(CreateOrderRequest request, int customerId);
    Task<OrderDto> GetOrderAsync(int id);
    Task<IEnumerable<OrderDto>> GetCustomerOrdersAsync(int customerId);
    Task<IEnumerable<OrderDto>> GetDriverOrdersAsync(int driverId);
    Task<PagedResult<OrderDto>> GetAllOrdersAsync(int page, int pageSize);
    Task<OrderDto> UpdateStatusAsync(UpdateOrderStatusRequest request, int updatedBy);
    Task<OrderDto> AssignDriverAsync(AssignDriverRequest request);
    Task<IEnumerable<OrderDto>> GetPendingOrdersAsync();
    Task<DashboardStatsDto> GetDashboardStatsAsync();
}

public interface IDriverService
{
    Task UpdateLocationAsync(int driverId, UpdateLocationRequest request);
    Task<IEnumerable<LocationUpdateDto>> GetActiveDriverLocationsAsync();
    Task SetAvailabilityAsync(int driverId, bool isAvailable);
}

// ====================== AUTH SERVICE ======================
public class AuthService : IAuthService
{
    private readonly IUnitOfWork _uow;
    private readonly IConfiguration _config;

    public AuthService(IUnitOfWork uow, IConfiguration config)
    {
        _uow = uow;
        _config = config;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _uow.Users.GetByEmailAsync(request.Email)
            ?? throw new UnauthorizedAccessException("Invalid credentials");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Account is deactivated");

        var token = GenerateJwtToken(user);
        return new AuthResponse(token, Guid.NewGuid().ToString(), new UserDto(user.Id, user.Name, user.Email, user.Phone, user.Role));
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var existing = await _uow.Users.GetByEmailAsync(request.Email);
        if (existing != null) throw new InvalidOperationException("Email already registered");

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            Role = request.Role,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        var created = await _uow.Users.CreateAsync(user);

        if (request.Role == UserRole.Driver)
        {
            var driverProfile = new DriverProfile { UserId = created.Id, VehicleType = "Bike", VehicleNumber = "TBD" };
            await _uow.Drivers.CreateAsync(driverProfile);
        }

        var token = GenerateJwtToken(created);
        return new AuthResponse(token, Guid.NewGuid().ToString(), new UserDto(created.Id, created.Name, created.Email, created.Phone, created.Role));
    }

    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

// ====================== ORDER SERVICE ======================
public class OrderService : IOrderService
{
    private readonly IUnitOfWork _uow;

    public OrderService(IUnitOfWork uow) => _uow = uow;

    public async Task<OrderDto> CreateOrderAsync(CreateOrderRequest request, int customerId)
    {
        var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        var order = new Order
        {
            OrderNumber = orderNumber,
            CustomerId = customerId,
            PickupAddress = request.PickupAddress,
            PickupLat = request.PickupLat,
            PickupLng = request.PickupLng,
            DeliveryAddress = request.DeliveryAddress,
            DeliveryLat = request.DeliveryLat,
            DeliveryLng = request.DeliveryLng,
            Notes = request.Notes,
            Status = OrderStatus.Pending,
            Items = request.Items.Select(i => new OrderItem { Name = i.Name, Quantity = i.Quantity, Price = i.Price }).ToList()
        };
        order.TotalAmount = order.Items.Sum(i => i.Price * i.Quantity);

        var created = await _uow.Orders.CreateAsync(order);
        var full = await _uow.Orders.GetByIdAsync(created.Id);
        return MapToDto(full!);
    }

    public async Task<OrderDto> GetOrderAsync(int id)
    {
        var order = await _uow.Orders.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Order {id} not found");
        return MapToDto(order);
    }

    public async Task<IEnumerable<OrderDto>> GetCustomerOrdersAsync(int customerId)
    {
        var orders = await _uow.Orders.GetByCustomerIdAsync(customerId);
        return orders.Select(MapToDto);
    }

    public async Task<IEnumerable<OrderDto>> GetDriverOrdersAsync(int driverId)
    {
        var orders = await _uow.Orders.GetByDriverIdAsync(driverId);
        return orders.Select(MapToDto);
    }

    public async Task<PagedResult<OrderDto>> GetAllOrdersAsync(int page, int pageSize)
    {
        var orders = await _uow.Orders.GetAllAsync(page, pageSize);
        var total = await _uow.Orders.GetTotalCountAsync();
        return new PagedResult<OrderDto>(orders.Select(MapToDto), total, page, pageSize);
    }

    public async Task<OrderDto> UpdateStatusAsync(UpdateOrderStatusRequest request, int updatedBy)
    {
        var order = await _uow.Orders.GetByIdAsync(request.OrderId)
            ?? throw new KeyNotFoundException("Order not found");

        order.Status = request.Status;

        if (request.Status == OrderStatus.PickedUp) order.PickedUpAt = DateTime.UtcNow;
        if (request.Status == OrderStatus.Delivered) order.DeliveredAt = DateTime.UtcNow;

        order.StatusHistory.Add(new OrderStatusHistory
        {
            Status = request.Status.ToString(),
            Comment = request.Comment,
            ChangedBy = updatedBy
        });

        await _uow.Orders.UpdateAsync(order);
        return MapToDto(order);
    }

    public async Task<OrderDto> AssignDriverAsync(AssignDriverRequest request)
    {
        var order = await _uow.Orders.GetByIdAsync(request.OrderId)
            ?? throw new KeyNotFoundException("Order not found");

        order.DriverId = request.DriverId;
        order.Status = OrderStatus.AssignedToDriver;
        order.StatusHistory.Add(new OrderStatusHistory { Status = "AssignedToDriver", ChangedBy = request.DriverId });

        await _uow.Orders.UpdateAsync(order);
        var full = await _uow.Orders.GetByIdAsync(order.Id);
        return MapToDto(full!);
    }

    public async Task<IEnumerable<OrderDto>> GetPendingOrdersAsync()
    {
        var orders = await _uow.Orders.GetPendingOrdersAsync();
        return orders.Select(MapToDto);
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var all = await _uow.Orders.GetAllAsync(1, 10000);
        var today = DateTime.UtcNow.Date;
        var availableDrivers = await _uow.Drivers.GetAvailableDriversAsync();

        return new DashboardStatsDto(
            TotalOrders: all.Count(),
            PendingOrders: all.Count(o => o.Status == OrderStatus.Pending),
            ActiveOrders: all.Count(o => o.Status >= OrderStatus.AssignedToDriver && o.Status < OrderStatus.Delivered),
            DeliveredToday: all.Count(o => o.Status == OrderStatus.Delivered && o.DeliveredAt?.Date == today),
            ActiveDrivers: availableDrivers.Count(),
            TodayRevenue: all.Where(o => o.CreatedAt.Date == today && o.Status == OrderStatus.Delivered).Sum(o => o.TotalAmount));
    }

    private static OrderDto MapToDto(Order o)
    {
        DriverLocationDto? driverLocation = null;
        if (o.Driver?.DriverProfile != null)
        {
            driverLocation = new DriverLocationDto(
                o.Driver.DriverProfile.CurrentLat,
                o.Driver.DriverProfile.CurrentLng,
                o.Driver.DriverProfile.LastLocationUpdate);
        }

        return new OrderDto(
            o.Id, o.OrderNumber, o.CustomerId, o.Customer?.Name ?? "",
            o.DriverId, o.Driver?.Name, o.Status,
            o.PickupAddress, o.PickupLat, o.PickupLng,
            o.DeliveryAddress, o.DeliveryLat, o.DeliveryLng,
            o.TotalAmount, o.Notes,
            o.CreatedAt, o.DeliveredAt,
            o.Items.Select(i => new OrderItemDto(i.Id, i.Name, i.Quantity, i.Price)).ToList(),
            driverLocation);
    }
}

// ====================== DRIVER SERVICE ======================
public class DriverService : IDriverService
{
    private readonly IUnitOfWork _uow;

    public DriverService(IUnitOfWork uow) => _uow = uow;

    public async Task UpdateLocationAsync(int driverId, UpdateLocationRequest request)
    {
        await _uow.Drivers.UpdateLocationAsync(driverId, request.Lat, request.Lng);
    }

    public async Task<IEnumerable<LocationUpdateDto>> GetActiveDriverLocationsAsync()
    {
        var drivers = await _uow.Drivers.GetAvailableDriversAsync();
        return drivers.Select(d => new LocationUpdateDto(
            d.UserId, d.User?.Name ?? "", d.CurrentLat, d.CurrentLng, null));
    }

    public async Task SetAvailabilityAsync(int driverId, bool isAvailable)
    {
        var profile = await _uow.Drivers.GetByUserIdAsync(driverId)
            ?? throw new KeyNotFoundException("Driver profile not found");
        profile.IsAvailable = isAvailable;
        await _uow.Drivers.UpdateAsync(profile);
    }
}
