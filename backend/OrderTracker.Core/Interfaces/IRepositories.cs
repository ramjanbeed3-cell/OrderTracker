using OrderTracker.Core.Entities;

namespace OrderTracker.Core.Interfaces;

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(int id);
    Task<Order?> GetByOrderNumberAsync(string orderNumber);
    Task<IEnumerable<Order>> GetByCustomerIdAsync(int customerId);
    Task<IEnumerable<Order>> GetByDriverIdAsync(int driverId);
    Task<IEnumerable<Order>> GetAllAsync(int page = 1, int pageSize = 20);
    Task<IEnumerable<Order>> GetPendingOrdersAsync();
    Task<Order> CreateAsync(Order order);
    Task<Order> UpdateAsync(Order order);
    Task<bool> DeleteAsync(int id);
    Task<int> GetTotalCountAsync();
}

public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByEmailAsync(string email);
    Task<IEnumerable<User>> GetAllDriversAsync();
    Task<IEnumerable<User>> GetAvailableDriversAsync();
    Task<User> CreateAsync(User user);
    Task<User> UpdateAsync(User user);
}

public interface IDriverRepository
{
    Task<DriverProfile?> GetByUserIdAsync(int userId);
    Task<DriverProfile> CreateAsync(DriverProfile profile);
    Task<DriverProfile> UpdateAsync(DriverProfile profile);
    Task<IEnumerable<DriverProfile>> GetAvailableDriversAsync();
    Task UpdateLocationAsync(int userId, double lat, double lng);
}

public interface IUnitOfWork : IDisposable
{
    IOrderRepository Orders { get; }
    IUserRepository Users { get; }
    IDriverRepository Drivers { get; }
    Task<int> SaveChangesAsync();
}
