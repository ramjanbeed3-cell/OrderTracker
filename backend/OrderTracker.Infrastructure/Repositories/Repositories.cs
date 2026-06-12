using Microsoft.EntityFrameworkCore;
using OrderTracker.Core.Entities;
using OrderTracker.Core.Interfaces;
using OrderTracker.Infrastructure.Data;

namespace OrderTracker.Infrastructure.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _context;
    public OrderRepository(AppDbContext context) => _context = context;

    public async Task<Order?> GetByIdAsync(int id) =>
        await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Driver).ThenInclude(d => d!.DriverProfile)
            .Include(o => o.Items)
            .Include(o => o.StatusHistory)
            .FirstOrDefaultAsync(o => o.Id == id);

    public async Task<Order?> GetByOrderNumberAsync(string orderNumber) =>
        await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Driver)
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);

    public async Task<IEnumerable<Order>> GetByCustomerIdAsync(int customerId) =>
        await _context.Orders
            .Include(o => o.Driver).ThenInclude(d => d!.DriverProfile)
            .Include(o => o.Items)
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Order>> GetByDriverIdAsync(int driverId) =>
        await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Items)
            .Where(o => o.DriverId == driverId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Order>> GetAllAsync(int page = 1, int pageSize = 20) =>
        await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Driver)
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

    public async Task<IEnumerable<Order>> GetPendingOrdersAsync() =>
        await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Items)
            .Where(o => o.Status == Core.Enums.OrderStatus.Pending)
            .OrderBy(o => o.CreatedAt)
            .ToListAsync();

    public async Task<Order> CreateAsync(Order order)
    {
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        return order;
    }

    public async Task<Order> UpdateAsync(Order order)
    {
        order.UpdatedAt = DateTime.UtcNow;
        _context.Orders.Update(order);
        await _context.SaveChangesAsync();
        return order;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return false;
        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<int> GetTotalCountAsync() => await _context.Orders.CountAsync();
}

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;
    public UserRepository(AppDbContext context) => _context = context;

    public async Task<User?> GetByIdAsync(int id) =>
        await _context.Users.Include(u => u.DriverProfile).FirstOrDefaultAsync(u => u.Id == id);

    public async Task<User?> GetByEmailAsync(string email) =>
        await _context.Users.Include(u => u.DriverProfile).FirstOrDefaultAsync(u => u.Email == email);

    public async Task<IEnumerable<User>> GetAllDriversAsync() =>
        await _context.Users.Include(u => u.DriverProfile)
            .Where(u => u.Role == Core.Enums.UserRole.Driver).ToListAsync();

    public async Task<IEnumerable<User>> GetAvailableDriversAsync() =>
        await _context.Users.Include(u => u.DriverProfile)
            .Where(u => u.Role == Core.Enums.UserRole.Driver && u.DriverProfile!.IsAvailable).ToListAsync();

    public async Task<User> CreateAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User> UpdateAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        return user;
    }
}

public class DriverRepository : IDriverRepository
{
    private readonly AppDbContext _context;
    public DriverRepository(AppDbContext context) => _context = context;

    public async Task<DriverProfile?> GetByUserIdAsync(int userId) =>
        await _context.DriverProfiles.Include(d => d.User).FirstOrDefaultAsync(d => d.UserId == userId);

    public async Task<DriverProfile> CreateAsync(DriverProfile profile)
    {
        _context.DriverProfiles.Add(profile);
        await _context.SaveChangesAsync();
        return profile;
    }

    public async Task<DriverProfile> UpdateAsync(DriverProfile profile)
    {
        _context.DriverProfiles.Update(profile);
        await _context.SaveChangesAsync();
        return profile;
    }

    public async Task<IEnumerable<DriverProfile>> GetAvailableDriversAsync() =>
        await _context.DriverProfiles.Include(d => d.User)
            .Where(d => d.IsAvailable).ToListAsync();

    public async Task UpdateLocationAsync(int userId, double lat, double lng)
    {
        var profile = await _context.DriverProfiles.FirstOrDefaultAsync(d => d.UserId == userId);
        if (profile != null)
        {
            profile.CurrentLat = lat;
            profile.CurrentLng = lng;
            profile.LastLocationUpdate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    public IOrderRepository Orders { get; }
    public IUserRepository Users { get; }
    public IDriverRepository Drivers { get; }

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
        Orders = new OrderRepository(context);
        Users = new UserRepository(context);
        Drivers = new DriverRepository(context);
    }

    public async Task<int> SaveChangesAsync() => await _context.SaveChangesAsync();
    public void Dispose() => _context.Dispose();
}