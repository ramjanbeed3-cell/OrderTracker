import { useEffect, useState } from 'react';
import { ordersApi } from '../../services/api';
import { DashboardStats } from '../../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';

const hourlyData = [
  { time: '8am', orders: 4, revenue: 1200 },
  { time: '9am', orders: 6, revenue: 1800 },
  { time: '10am', orders: 8, revenue: 2400 },
  { time: '11am', orders: 12, revenue: 3600 },
  { time: '12pm', orders: 18, revenue: 5400 },
  { time: '1pm', orders: 15, revenue: 4500 },
  { time: '2pm', orders: 14, revenue: 4200 },
  { time: '3pm', orders: 16, revenue: 4800 },
  { time: '4pm', orders: 20, revenue: 6000 },
  { time: '5pm', orders: 22, revenue: 6600 },
  { time: '6pm', orders: 19, revenue: 5700 },
  { time: '7pm', orders: 14, revenue: 4200 },
];

const recentActivity = [
  { time: '2 min ago', event: 'New order placed by Ravi Kumar', type: 'order', color: 'bg-blue-500' },
  { time: '5 min ago', event: 'Order ORD-2026 delivered successfully', type: 'delivered', color: 'bg-green-500' },
  { time: '8 min ago', event: 'Suresh Driver picked up order', type: 'pickup', color: 'bg-purple-500' },
  { time: '12 min ago', event: 'New driver Suresh went online', type: 'driver', color: 'bg-yellow-500' },
  { time: '15 min ago', event: 'Order assigned to Suresh Driver', type: 'assign', color: 'bg-indigo-500' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'revenue'>('orders');

  useEffect(() => {
    ordersApi.getDashboard().then(setStats).catch(console.error);
    const interval = setInterval(() => {
      ordersApi.getDashboard().then(setStats).catch(console.error);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📊 Admin Dashboard</h2>
          <p className="text-gray-500 text-sm mt-0.5">Real-time overview • Auto refreshes every 10s</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm text-green-700 font-medium">Live</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: '📦', bg: 'bg-blue-600', change: '+12%' },
          { label: 'Pending Orders', value: stats?.pendingOrders ?? 0, icon: '⏳', bg: 'bg-yellow-500', change: '-3%' },
          { label: 'Active Orders', value: stats?.activeOrders ?? 0, icon: '🚚', bg: 'bg-purple-600', change: '+5%' },
          { label: 'Delivered Today', value: stats?.deliveredToday ?? 0, icon: '✅', bg: 'bg-green-600', change: '+18%' },
          { label: 'Active Drivers', value: stats?.activeDrivers ?? 0, icon: '👤', bg: 'bg-indigo-600', change: '+2%' },
          { label: "Today's Revenue", value: `₹${(stats?.todayRevenue ?? 0).toLocaleString()}`, icon: '💰', bg: 'bg-emerald-600', change: '+24%' },
        ].map(c => (
          <div key={c.label} className={`${c.bg} rounded-2xl p-5 text-white shadow-lg`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wide">{c.label}</p>
                <p className="text-3xl font-bold mt-2">{c.value}</p>
                <span className={`text-xs mt-2 inline-block px-2 py-0.5 rounded-full ${c.change.startsWith('+') ? 'bg-white/20 text-white' : 'bg-red-400/30 text-white'}`}>
                  {c.change} vs yesterday
                </span>
              </div>
              <span className="text-4xl opacity-80">{c.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Main Chart */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Orders & Revenue Today</h3>
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('orders')}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                Orders
              </button>
              <button onClick={() => setActiveTab('revenue')}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${activeTab === 'revenue' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                Revenue
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val) => activeTab === 'revenue' ? `₹${val}` : val} />
              <Area type="monotone" dataKey={activeTab === 'orders' ? 'orders' : 'revenue'}
                stroke="#3b82f6" fill="url(#colorOrders)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.color}`}></div>
                <div>
                  <p className="text-xs text-gray-700">{a.event}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Weekly Bar Chart */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Weekly Orders Overview</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={[
              { day: 'Mon', orders: 28 }, { day: 'Tue', orders: 35 },
              { day: 'Wed', orders: 42 }, { day: 'Thu', orders: 38 },
              { day: 'Fri', orders: 55 }, { day: 'Sat', orders: 62 },
              { day: 'Sun', orders: 48 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* KPI Cards */}
        <div className="space-y-3">
          {[
            { label: 'Avg Delivery Time', value: '28 min', icon: '⏱️', color: 'text-blue-600' },
            { label: 'Customer Rating', value: '4.8 ⭐', icon: '😊', color: 'text-yellow-600' },
            { label: 'On-Time Rate', value: '94%', icon: '🎯', color: 'text-green-600' },
            { label: 'Cancellation Rate', value: '2.1%', icon: '❌', color: 'text-red-600' },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{k.label}</p>
                <p className={`text-lg font-bold mt-0.5 ${k.color}`}>{k.value}</p>
              </div>
              <span className="text-2xl">{k.icon}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
