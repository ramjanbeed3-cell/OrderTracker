using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using OrderTracker.API.Hubs;
using OrderTracker.Application.Services;
using OrderTracker.Core.DTOs;
using System.Security.Claims;

namespace OrderTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    public AuthController(IAuthService authService) => _authService = authService;

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try { return Ok(await _authService.LoginAsync(request)); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(new { message = ex.Message }); }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try { return Ok(await _authService.RegisterAsync(request)); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly IHubContext<OrderHub> _hub;

    public OrdersController(IOrderService orderService, IHubContext<OrderHub> hub)
    {
        _orderService = orderService;
        _hub = hub;
    }

    private int UserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    private string UserRole => User.FindFirst(ClaimTypes.Role)!.Value;

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        => Ok(await _orderService.GetAllOrdersAsync(page, pageSize));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try { return Ok(await _orderService.GetOrderAsync(id)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpGet("my-orders")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyOrders()
        => Ok(await _orderService.GetCustomerOrdersAsync(UserId));

    [HttpGet("driver-orders")]
    [Authorize(Roles = "Driver")]
    public async Task<IActionResult> GetDriverOrders()
        => Ok(await _orderService.GetDriverOrdersAsync(UserId));

    [HttpGet("pending")]
    [Authorize(Roles = "Admin,Driver")]
    public async Task<IActionResult> GetPending()
        => Ok(await _orderService.GetPendingOrdersAsync());

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest request)
    {
        var order = await _orderService.CreateOrderAsync(request, UserId);
        // Notify admin of new order
        await _hub.Clients.Group("admin").SendAsync("NewOrderCreated", order);
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
    }

    [HttpPut("status")]
    [Authorize(Roles = "Admin,Driver")]
    public async Task<IActionResult> UpdateStatus([FromBody] UpdateOrderStatusRequest request)
    {
        var order = await _orderService.UpdateStatusAsync(request, UserId);
        // Notify all parties
        await _hub.Clients.Group($"order_{order.Id}").SendAsync("OrderStatusChanged", order);
        await _hub.Clients.Group($"customer_{order.CustomerId}").SendAsync("OrderStatusChanged", order);
        await _hub.Clients.Group("admin").SendAsync("OrderStatusChanged", order);
        return Ok(order);
    }

    [HttpPut("assign-driver")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignDriver([FromBody] AssignDriverRequest request)
    {
        var order = await _orderService.AssignDriverAsync(request);
        await _hub.Clients.Group($"driver_{request.DriverId}").SendAsync("OrderAssigned", order);
        await _hub.Clients.Group($"customer_{order.CustomerId}").SendAsync("OrderStatusChanged", order);
        return Ok(order);
    }

    [HttpGet("dashboard")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetDashboard()
        => Ok(await _orderService.GetDashboardStatsAsync());
}

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Driver")]
public class DriversController : ControllerBase
{
    private readonly IDriverService _driverService;
    private readonly IHubContext<OrderHub> _hub;

    public DriversController(IDriverService driverService, IHubContext<OrderHub> hub)
    {
        _driverService = driverService;
        _hub = hub;
    }

    private int UserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    private string UserName => User.FindFirst(ClaimTypes.Name)!.Value;

    [HttpPost("location")]
    public async Task<IActionResult> UpdateLocation([FromBody] UpdateLocationRequest request)
    {
        await _driverService.UpdateLocationAsync(UserId, request);
        var locationDto = new LocationUpdateDto(UserId, UserName, request.Lat, request.Lng, null);
        await _hub.Clients.Group("admin").SendAsync("DriverLocationUpdated", locationDto);
        return Ok();
    }

    [HttpPost("availability")]
    public async Task<IActionResult> SetAvailability([FromQuery] bool isAvailable)
    {
        await _driverService.SetAvailabilityAsync(UserId, isAvailable);
        return Ok();
    }

    [HttpGet("active-locations")]
    [AllowAnonymous]
    public async Task<IActionResult> GetActiveLocations()
        => Ok(await _driverService.GetActiveDriverLocationsAsync());
}
