import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersApi } from '../../services/api';
import { Order } from '../../types';
import { useAuthStore } from '../../context/authStore';
import { createConnection, startConnection, joinOrderGroup } from '../../services/signalr';
import { format } from 'date-fns';

const STATUS_MAP: Record<number, string> = {
  0: 'Pending', 1: 'Confirmed', 2: 'AssignedToDriver',
  3: 'PickedUp', 4: 'InTransit', 5: 'NearbyDelivery',
  6: 'Delivered', 7: 'Cancelled', 8: 'Failed'
};

const TIMELINE_STEPS = [
  { key: 'Pending', label: 'Order Placed', icon: '📋', desc: 'Your order has been received' },
  { key: 'Confirmed', label: 'Confirmed', icon: '✅', desc: 'Restaurant confirmed your order' },
  { key: 'AssignedToDriver', label: 'Driver Assigned', icon: '👤', desc: 'A driver is heading to pickup' },
  { key: 'PickedUp', label: 'Picked Up', icon: '📦', desc: 'Driver picked up your order' },
  { key: 'InTransit', label: 'On the Way', icon: '🚚', desc: 'Your order is on the way!' },
  { key: 'Delivered', label: 'Delivered', icon: '🎉', desc: 'Order delivered successfully!' },
];

const STATUS_ORDER = ['Pending','Confirmed','AssignedToDriver','PickedUp','InTransit','Delivered'];

export default function CustomerOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const getStatusLabel = (status: any) => {
    if (typeof status === 'number') return STATUS_MAP[status] || 'Pending';
    return status || 'Pending';
  };

  useEffect(() => {
    ordersApi.getById(Number(id)).then(o => { setOrder(o); setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (!token || !id) return;
    const conn = createConnection(token);
    startConnection(conn).then(() => joinOrderGroup(Number(id)));
    conn.on('OrderStatusChanged', (updated: Order) => {
      if (updated.id === Number(id)) setOrder(updated);
    });
    return () => { conn.stop(); };
  }, [token, id]);

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-bounce">📦</div>
        <p className="text-gray-500">Loading order details...</p>
      </div>
    </div>
  );

  if (!order) return <div className="p-6 text-center text-gray-400">Order not found</div>;

  const statusLabel = getStatusLabel(order.status);
  const currentStep = STATUS_ORDER.indexOf(statusLabel);
  const isCancelled = statusLabel === 'Cancelled';
  const isDelivered = statusLabel === 'Delivered';

  const estimatedTime = () => {
    if (isDelivered) return 'Delivered!';
    if (isCancelled) return 'Cancelled';
    const steps = STATUS_ORDER.indexOf(statusLabel);
    const remaining = (5 - steps) * 8;
    return `~${remaining} mins`;
  };

  return (
    <div className="p-6 space-y-5 bg-gray-50 min-h-screen">
      {/* Back Button */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/customer')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm">
          ← Back to Orders
        </button>
      </div>

      {/* Order Header */}
      <div className={`rounded-2xl p-5 text-white ${isDelivered ? 'bg-green-600' : isCancelled ? 'bg-red-500' : 'bg-blue-600'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wide">Order Number</p>
            <p className="font-mono text-lg font-bold mt-1">{order.orderNumber}</p>
            <p className="text-white/80 text-sm mt-1">{format(new Date(order.createdAt), 'MMM d, yyyy • HH:mm')}</p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs">Estimated Time</p>
            <p className="text-2xl font-bold mt-1">{estimatedTime()}</p>
            <p className="text-white/80 text-sm mt-1">₹{order.totalAmount?.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-6">Order Progress</h3>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200"></div>
            <div
              className="absolute left-6 top-6 w-0.5 bg-blue-500 transition-all duration-1000"
              style={{ height: `${currentStep >= 0 ? (currentStep / (TIMELINE_STEPS.length - 1)) * 100 : 0}%` }}>
            </div>

            <div className="space-y-6 relative">
              {TIMELINE_STEPS.map((step, index) => {
                const isCompleted = currentStep >= index;
                const isCurrent = currentStep === index;
                return (
                  <div key={step.key} className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 border-2 transition-all duration-500 ${
                      isCompleted
                        ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200'
                        : 'bg-white border-gray-200'
                    } ${isCurrent ? 'animate-pulse scale-110' : ''}`}>
                      {step.icon}
                    </div>
                    <div className="pt-2.5">
                      <p className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                        {isCurrent && <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Current</span>}
                      </p>
                      <p className={`text-sm mt-0.5 ${isCompleted ? 'text-gray-500' : 'text-gray-300'}`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
          <p className="text-4xl mb-2">❌</p>
          <p className="font-bold text-red-700">Order Cancelled</p>
          <p className="text-red-500 text-sm mt-1">This order has been cancelled</p>
        </div>
      )}

      {/* Driver Info */}
      {order.driverName && !isCancelled && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3">Your Delivery Partner</h3>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {order.driverName[0]}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-lg">{order.driverName}</p>
              <p className="text-gray-500 text-sm">🚚 Delivery Partner</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                <span className="text-xs text-gray-400">4.9 rating</span>
              </div>
            </div>
            <div className="text-right">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xl">📞</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">📦 Pickup</p>
          <p className="text-sm font-medium text-gray-800">{order.pickupAddress}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">🏠 Delivery</p>
          <p className="text-sm font-medium text-gray-800">{order.deliveryAddress}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">🛍️ Order Items</h3>
        <div className="space-y-3">
          {order.items?.map(item => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm">
                  🍽️
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Subtotal</span>
            <span>₹{order.totalAmount?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Delivery Fee</span>
            <span className="text-green-600">FREE</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 mt-2 pt-2 border-t">
            <span>Total</span>
            <span className="text-green-700 text-lg">₹{order.totalAmount?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Delivered Banner */}
      {isDelivered && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
          <p className="text-4xl mb-2">🎉</p>
          <p className="font-bold text-green-700 text-lg">Order Delivered!</p>
          <p className="text-green-500 text-sm mt-1">
            Delivered on {order.deliveredAt ? format(new Date(order.deliveredAt), 'MMM d, yyyy at HH:mm') : '—'}
          </p>
          <div className="flex justify-center gap-1 mt-3">
            {[1,2,3,4,5].map(s => <span key={s} className="text-yellow-400 text-2xl">⭐</span>)}
          </div>
          <p className="text-gray-500 text-sm mt-2">Rate your experience</p>
        </div>
      )}
    </div>
  );
}
