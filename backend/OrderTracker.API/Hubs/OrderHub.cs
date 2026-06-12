using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using OrderTracker.Core.DTOs;

namespace OrderTracker.API.Hubs;

[Authorize]
public class OrderHub : Hub
{
    // Groups: "admin", "customer_{customerId}", "driver_{driverId}", "order_{orderId}"

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        var role = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

        if (role == "Admin")
            await Groups.AddToGroupAsync(Context.ConnectionId, "admin");

        if (role == "Driver" && userId != null)
            await Groups.AddToGroupAsync(Context.ConnectionId, $"driver_{userId}");

        if (role == "Customer" && userId != null)
            await Groups.AddToGroupAsync(Context.ConnectionId, $"customer_{userId}");

        await base.OnConnectedAsync();
    }

    public async Task JoinOrderGroup(string orderId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"order_{orderId}");
    }

    public async Task LeaveOrderGroup(string orderId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"order_{orderId}");
    }

    // Driver sends live location
    public async Task UpdateDriverLocation(LocationUpdateDto location)
    {
        // Notify admin
        await Clients.Group("admin").SendAsync("DriverLocationUpdated", location);

        // Notify customers whose order this driver is handling
        if (location.ActiveOrderId.HasValue)
            await Clients.Group($"order_{location.ActiveOrderId}").SendAsync("DriverLocationUpdated", location);
    }
}
