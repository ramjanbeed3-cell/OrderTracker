import { useEffect, useRef, useState } from 'react';
import { ordersApi, driversApi } from '../../services/api';
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

const STATUS_TRANSITIONS: Record<string, { next: number; label: string; color: string }> = {
  AssignedToDriver: { next: 3, label: '📦 Confirm Pickup', color: 'bg-purple-600 hover:bg-purple-700' },
  PickedUp: { next: 4, label: '🚚 Start Transit', color: 'bg-indigo-600 hover:bg-indigo-700' },
  InTransit: { next: 5, label: '📍 Mark Nearby', color: 'bg-orange-600 hover:bg-orange-700' },
  NearbyDelivery: { next: 6, label: '✅ Mark Delivered', color: 'bg-green-600 hover:bg-green-700' },
};

export default function DriverDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const watchId = useRef<number | null>(null);
  const { token, user } = useAuthStore();

  const getStatusLabel = (status: any) => {
    if (typeof status === 'number') return STATUS_MAP[status] || 'Pending';
    return status || 'Pending';
  };

  useEffect(() => {
    ordersApi.getDriverOrders().then(setOrders);
    if (!token) return;
    const conn = createConnection(token);
    startConnection(conn);
    conn.on('OrderAssigned', (order: Order) => {
      setOrders(prev => [order, ...prev]);
      toast.success(`🎉 New order assigned: ${order.orderNumber}!`);
    });
    conn.on('OrderStatusChanged', (order: Order) => {
      setOrders(prev => prev.map(o => o.id === order.id ? order : o));
    });
    return () => { conn.stop(); };
  }, [token]);

  const toggleTracking = () => {
    if (isTracking) {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
      setIsTracking(false);
      setCurrentLocation(null);
      toast('📍 Location tracking stopped');
    } else {
      watchId.current = navigator.geolocation.watchPosition(
        pos => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentLocation(loc);
          driversApi.updateLocation(loc.lat, loc.lng);
        },
        () => toast.error('GPS error — check permissions'),
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
      setIsTracking(true);
      toast.success('📍 Live tracking started!');
    }
  };

  const toggleAvailability = async () => {
    await driversApi.setAvailability(!isAvailable);
    setIsAvailable(!isAvailable);
    toast(`You are now ${!isAvailable ? '🟢 Available' : '🔴 Unavailable'}`);
  };

  const handleStatusUpdate = async (order: Order) => {
    const statusLabel = getStatusLabel(order.status);
    const transition = STATUS_TRANSITIONS[statusLabel];
    if (!transition) return;
    await ordersApi.updateStatus({ orderId: order.id, status: transition.next });
    toast.success('✅ Status updated!');
    ordersApi.getDriverOrders().then(setOrders);
  };

  const activeOrders = orders.filter(o =>
    ['AssignedToDriver','PickedUp','InTransit','NearbyDelivery'].includes(getStatusLabel(o.status)));
  const completedOrders = orders.filter(o =>
    getStatusLabel(o.status) === 'Delivered');
  const totalEarnings = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="p-6 space-y-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🚚 Driver Dashboard</h2>
          <p className="text-gray-500 text-sm">Welcome back, {user?.name}!</p>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {isAvailable ? '🟢 Online' : '🔴 Offline'}
        </div>
      </div>

      {/* Control Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-3 font-medium">Availability Status</p>
          <button onClick={toggleAvailability}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
              isAvailable
                ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {isAvailable ? '🟢 I\'m Available' : '🔴 Go Online'}
          </button>
          <p className="text-xs text-gray-400 mt-2 text-center">
            {isAvailable ? 'You can receive orders' : 'You won\'t receive orders'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-3 font-medium">GPS Location</p>
          <button onClick={toggleTracking}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
              isTracking
                ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-200 animate-pulse'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {isTracking ? '📍 Tracking Live' : '📍 Start Tracking'}
          </button>
          {currentLocation && (
            <p className="text-xs text-blue-500 mt-2 text-center">
              {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-600 rounded-xl p-4 text-white text-center">
          <p className="text-3xl font-bold">{activeOrders.length}</p>
          <p className="text-blue-200 text-xs mt-1">Active Orders</p>
        </div>
        <div className="bg-green-600 rounded-xl p-4 text-white text-center">
          <p className="text-3xl font-bold">{completedOrders.length}</p>
          <p className="text-green-200 text-xs mt-1">Delivered</p>
        </div>
        <div className="bg-emerald-600 rounded-xl p-4 text-white text-center">
          <p className="text-xl font-bold">₹{totalEarnings.toFixed(0)}</p>
          <p className="text-emerald-200 text-xs mt-1">Total Earned</p>
        </div>
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Active Orders ({activeOrders.length})
          </h3>
          <div className="space-y-3">
            {activeOrders.map(order => {
              const statusLabel = getStatusLabel(order.status);
              const transition = STATUS_TRANSITIONS[statusLabel];
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-blue-600 px-4 py-2 flex justify-between items-center">
                    <span className="text-white text-xs font-mono font-bold">{order.orderNumber}</span>
                    <span className="text-blue-200 text-xs">{statusLabel}</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">📦</span>
                      <div>
                        <p className="text-xs text-gray-400">Pickup from</p>
                        <p className="text-sm font-medium text-gray-800">{order.pickupAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">🏠</span>
                      <div>
                        <p className="text-xs text-gray-400">Deliver to</p>
                        <p className="text-sm font-medium text-gray-800">{order.deliveryAddress}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                      <div>
                        <p className="text-xs text-gray-400">Order Value</p>
                        <p className="text-lg font-bold text-green-700">₹{order.totalAmount?.toFixed(2)}</p>
                      </div>
                      {transition && (
                        <button onClick={() => handleStatusUpdate(order)}
                          className={`${transition.color} text-white px-4 py-2 rounded-xl text-sm font-bold transition-all`}>
                          {transition.label}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Orders */}
      {completedOrders.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-800 mb-3">✅ Completed Today ({completedOrders.length})</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {completedOrders.slice(0, 5).map((order, i) => (
              <div key={order.id} className={`flex items-center justify-between px-4 py-3 ${i !== 0 ? 'border-t border-gray-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">✅</span>
                  </div>
                  <div>
                    <p className="text-xs font-mono text-gray-600">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">{format(new Date(order.createdAt), 'HH:mm')}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-green-700">₹{order.totalAmount?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeOrders.length === 0 && completedOrders.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-4">🚚</p>
          <p className="font-bold text-gray-700 text-lg">No orders yet!</p>
          <p className="text-gray-400 text-sm mt-2">Make yourself available to receive orders</p>
        </div>
      )}
    </div>
  );
}