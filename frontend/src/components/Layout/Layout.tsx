import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../context/authStore';

const navItems = {
  Admin: [
    { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
    { to: '/admin/orders', label: 'Orders', icon: '📦' },
    { to: '/admin/map', label: 'Live Map', icon: '🗺️' },
  ],
  Customer: [
    { to: '/customer', label: 'My Orders', icon: '🏠', end: true },
  ],
  Driver: [
    { to: '/driver', label: 'My Deliveries', icon: '🚚', end: true },
  ],
};

const roleColors = {
  Admin: 'from-blue-600 to-blue-800',
  Customer: 'from-orange-500 to-red-600',
  Driver: 'from-green-600 to-emerald-700',
};

const roleIcons = { Admin: '👑', Customer: '👤', Driver: '🚚' };

export default function Layout() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [notifications] = useState([
    { id: 1, msg: 'Order ORD-001 status updated', time: '2m ago', read: false },
    { id: 2, msg: 'New driver assigned to your order', time: '5m ago', read: false },
    { id: 3, msg: 'Order delivered successfully!', time: '1h ago', read: true },
  ]);
  const [showNotif, setShowNotif] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  const logout = () => { clearAuth(); navigate('/login'); };
  const items = navItems[user?.role || 'Customer'];
  const gradient = roleColors[user?.role || 'Customer'];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm">
        {/* Logo */}
        <div className={`bg-gradient-to-r ${gradient} p-5`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">
              🚀
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">OrderTracker</h1>
              <p className="text-white/70 text-xs">{roleIcons[user?.role || 'Customer']} {user?.role} Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Menu</p>
          {items.map(item => (
            <NavLink
              key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-gray-50">
            <div className={`w-9 h-9 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
              {user?.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border border-red-100">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500 font-medium">Live • Real-time updates active</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setShowNotif(!showNotif)}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
                <span className="text-lg">🔔</span>
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unread}
                  </span>
                )}
              </button>
              {showNotif && (
                <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-bold text-gray-900">Notifications</p>
                  </div>
                  {notifications.map(n => (
                    <div key={n.id} className={`p-4 border-b border-gray-50 flex gap-3 ${!n.read ? 'bg-blue-50/50' : ''}`}>
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                      <div>
                        <p className="text-sm text-gray-700">{n.msg}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="text-xs text-gray-400">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}