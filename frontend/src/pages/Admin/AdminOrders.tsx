import { useEffect, useState, useCallback } from 'react';
import { ordersApi } from '../../services/api';
import { Order } from '../../types';
import { useAuthStore } from '../../context/authStore';
import { createConnection, startConnection } from '../../services/signalr';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_MAP: Record<number, string> = {
  0: 'Pending', 1: 'Confirmed', 2: 'AssignedToDriver',
  3: 'PickedUp', 4: 'InTransit', 5: 'NearbyDelivery',
  6: 'Delivered', 7: 'Cancelled', 8: 'Failed'
};

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  AssignedToDriver: 'bg-purple-100 text-purple-800 border-purple-200',
  PickedUp: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  InTransit: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  NearbyDelivery: 'bg-orange-100 text-orange-800 border-orange-200',
  Delivered: 'bg-green-100 text-green-800 border-green-200',
  Cancelled: 'bg-red-100 text-red-800 border-red-200',
  Failed: 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_EMOJI: Record<string, string> = {
  Pending: '⏳', Confirmed: '✅', AssignedToDriver: '👤',
  PickedUp: '📦', InTransit: '🚚', NearbyDelivery: '📍',
  Delivered: '🎉', Cancelled: '❌', Failed: '⚠️'
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { token } = useAuthStore();

  const getStatusLabel = (status: any) => {
    if (typeof status === 'number') return STATUS_MAP[status] || 'Pending';
    return status || 'Pending';
  };

  const loadOrders = useCallback(async () => {
    const result = await ordersApi.getAll();
    setOrders(result.items || []);
    setFiltered(result.items || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  useEffect(() => {
    if (!token) return;
    const conn = createConnection(token);
    startConnection(conn);
    conn.on('NewOrderCreated', (order: Order) => {
      setOrders(prev => [order, ...prev]);
      toast.success(`🆕 New order ${order.orderNumber}!`);
    });
    conn.on('OrderStatusChanged', (order: Order) => {
      setOrders(prev => prev.map(o => o.id === order.id ? order : o));
      toast(`📦 Order ${order.orderNumber} updated!`);
    });
    return () => { conn.stop(); };
  }, [token, loadOrders]);

  // Search & Filter
  useEffect(() => {
    let result = [...orders];
    if (search) {
      result = result.filter(o =>
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        o.deliveryAddress?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== 'All') {
      result = result.filter(o => getStatusLabel(o.status) === statusFilter);
    }
    setFiltered(result);
  }, [search, statusFilter, orders]);

  const handleUpdateStatus = async (orderId: number, status: number) => {
    await ordersApi.updateStatus({ orderId, status });
    toast.success('✅ Status updated!');
    loadOrders();
  };

  const handleAssignDriver = async (orderId: number) => {
    await ordersApi.assignDriver(orderId, 2);
    toast.success('🚚 Suresh Driver assigned!');
    loadOrders();
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => getStatusLabel(o.status) === 'Pending').length,
    active: orders.filter(o => ['AssignedToDriver','PickedUp','InTransit'].includes(getStatusLabel(o.status))).length,
    delivered: orders.filter(o => getStatusLabel(o.status) === 'Delivered').length,
  };

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-spin">⚙️</div>
        <p className="text-gray-500">Loading orders...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📦 All Orders</h2>
          <p className="text-sm text-gray-500">{filtered.length} of {orders.length} orders</p>
        </div>
        <button onClick={loadOrders} className="btn-secondary text-sm flex items-center gap-2">
          🔄 Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'bg-blue-600', emoji: '📦' },
          { label: 'Pending', value: stats.pending, color: 'bg-yellow-500', emoji: '⏳' },
          { label: 'Active', value: stats.active, color: 'bg-purple-600', emoji: '🚚' },
          { label: 'Delivered', value: stats.delivered, color: 'bg-green-600', emoji: '✅' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-4 text-white`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white/70 text-xs">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
              <span className="text-2xl">{s.emoji}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          <input
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by order #, customer, address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          {Object.values(STATUS_MAP).map(s => (
            <option key={s} value={s}>{STATUS_EMOJI[s]} {s}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Order #', 'Customer', 'Items', 'Status', 'Driver', 'Amount', 'Date', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(order => {
              const statusLabel = getStatusLabel(order.status);
              return (
                <tr key={order.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedOrder(order)}>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-blue-600 font-semibold">{order.orderNumber}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                        {order.customerName?.[0]}
                      </div>
                      <span className="text-gray-700 font-medium">{order.customerName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-32">
                    {order.items && order.items.length > 0
                      ? order.items.map(i => `${i.name}×${i.quantity}`).join(', ')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[statusLabel] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {STATUS_EMOJI[statusLabel]} {statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {order.driverName ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-600">
                          {order.driverName[0]}
                        </div>
                        <span className="text-gray-700 text-xs">{order.driverName}</span>
                      </div>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 font-bold text-green-700">₹{order.totalAmount?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{format(new Date(order.createdAt), 'MMM d, HH:mm')}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1 flex-wrap">
                      {statusLabel === 'Pending' && (
                        <>
                          <button onClick={() => handleAssignDriver(order.id)}
                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 font-medium">
                            Assign 🚚
                          </button>
                          <button onClick={() => handleUpdateStatus(order.id, 7)}
                            className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 font-medium">
                            Cancel
                          </button>
                        </>
                      )}
                      {statusLabel === 'AssignedToDriver' && (
                        <button onClick={() => handleUpdateStatus(order.id, 3)}
                          className="text-xs bg-purple-600 text-white px-2 py-1 rounded-lg hover:bg-purple-700 font-medium">
                          Picked 📦
                        </button>
                      )}
                      {statusLabel === 'PickedUp' && (
                        <button onClick={() => handleUpdateStatus(order.id, 4)}
                          className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-lg hover:bg-indigo-700 font-medium">
                          Transit 🚚
                        </button>
                      )}
                      {statusLabel === 'InTransit' && (
                        <button onClick={() => handleUpdateStatus(order.id, 6)}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded-lg hover:bg-green-700 font-medium">
                          Delivered ✅
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium">No orders found</p>
            <p className="text-sm mt-1">Try changing your search or filter</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Order #</span>
                <span className="font-mono text-sm font-bold text-blue-600">{selectedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Customer</span>
                <span className="text-sm font-medium">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Status</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[getStatusLabel(selectedOrder.status)]}`}>
                  {STATUS_EMOJI[getStatusLabel(selectedOrder.status)]} {getStatusLabel(selectedOrder.status)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Driver</span>
                <span className="text-sm">{selectedOrder.driverName || 'Not assigned'}</span>
              </div>
              <hr />
              <div>
                <p className="text-gray-500 text-sm mb-2">📦 Pickup</p>
                <p className="text-sm text-gray-700">{selectedOrder.pickupAddress}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-2">🏠 Delivery</p>
                <p className="text-sm text-gray-700">{selectedOrder.deliveryAddress}</p>
              </div>
              <hr />
              <div>
                <p className="text-gray-500 text-sm mb-2">🛍️ Items</p>
                {selectedOrder.items?.map(item => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-sm pt-2 border-t">
                  <span>Total</span>
                  <span className="text-green-700">₹{selectedOrder.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
