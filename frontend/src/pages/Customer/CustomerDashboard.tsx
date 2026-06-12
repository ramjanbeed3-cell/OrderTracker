import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

const STATUS_EMOJI: Record<string, string> = {
  Pending: '⏳', Confirmed: '✅', AssignedToDriver: '👤',
  PickedUp: '📦', InTransit: '🚚', NearbyDelivery: '📍',
  Delivered: '🎉', Cancelled: '❌', Failed: '⚠️',
};

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  AssignedToDriver: 'bg-purple-100 text-purple-700 border-purple-200',
  PickedUp: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  InTransit: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  NearbyDelivery: 'bg-orange-100 text-orange-700 border-orange-200',
  Delivered: 'bg-green-100 text-green-700 border-green-200',
  Cancelled: 'bg-red-100 text-red-700 border-red-200',
  Failed: 'bg-red-100 text-red-700 border-red-200',
};

const FOOD_SUGGESTIONS = [
  { name: 'Biryani', emoji: '🍛', price: '₹250', time: '30 min' },
  { name: 'Pizza', emoji: '🍕', price: '₹350', time: '25 min' },
  { name: 'Burger', emoji: '🍔', price: '₹150', time: '20 min' },
  { name: 'Noodles', emoji: '🍜', price: '₹180', time: '15 min' },
  { name: 'Dosa', emoji: '🥞', price: '₹80', time: '10 min' },
  { name: 'Ice Cream', emoji: '🍦', price: '₹90', time: '5 min' },
];

const QUICK_ADDRESSES = [
  { label: 'Home', icon: '🏠', address: 'Banjara Hills, Hyderabad', lat: 17.4126, lng: 78.4482 },
  { label: 'Work', icon: '🏢', address: 'HITEC City, Hyderabad', lat: 17.4474, lng: 78.3762 },
  { label: 'Gym', icon: '💪', address: 'Madhapur, Hyderabad', lat: 17.4486, lng: 78.3908 },
];

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [newOrder, setNewOrder] = useState({
    pickupAddress: '', deliveryAddress: '',
    pickupLat: 0, pickupLng: 0, deliveryLat: 0, deliveryLng: 0,
    items: [{ name: '', quantity: 1, price: 0 }], notes: ''
  });
  const { token, user } = useAuthStore();

  const getStatusLabel = (status: any) => {
    if (typeof status === 'number') return STATUS_MAP[status] || 'Pending';
    return status || 'Pending';
  };

  useEffect(() => {
    ordersApi.getMyOrders().then(setOrders);
    if (!token) return;
    const conn = createConnection(token);
    startConnection(conn);
    conn.on('OrderStatusChanged', (order: Order) => {
      setOrders(prev => prev.map(o => o.id === order.id ? order : o));
      const label = getStatusLabel(order.status);
      toast(`${STATUS_EMOJI[label]} Order ${order.orderNumber}: ${label}`, { duration: 4000 });
    });
    return () => { conn.stop(); };
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await ordersApi.create(newOrder);
    toast.success('🎉 Order placed successfully!');
    setShowCreate(false);
    setNewOrder({
      pickupAddress: '', deliveryAddress: '',
      pickupLat: 0, pickupLng: 0, deliveryLat: 0, deliveryLng: 0,
      items: [{ name: '', quantity: 1, price: 0 }], notes: ''
    });
    ordersApi.getMyOrders().then(setOrders);
  };

  const quickOrder = (item: typeof FOOD_SUGGESTIONS[0], addr: typeof QUICK_ADDRESSES[0]) => {
    setNewOrder({
      pickupAddress: 'MG Road, Hyderabad',
      pickupLat: 17.4325, pickupLng: 78.4272,
      deliveryAddress: addr.address,
      deliveryLat: addr.lat, deliveryLng: addr.lng,
      items: [{ name: item.name, quantity: 1, price: parseInt(item.price.replace('₹','')) }],
      notes: `Quick order - ${item.name}`
    });
    setShowCreate(true);
  };

  const activeOrders = orders.filter(o => !['Delivered','Cancelled','Failed'].includes(getStatusLabel(o.status)));
  const historyOrders = orders.filter(o => ['Delivered','Cancelled','Failed'].includes(getStatusLabel(o.status)));
  const totalSpent = orders.filter(o => getStatusLabel(o.status) === 'Delivered').reduce((s, o) => s + (o.totalAmount || 0), 0);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-orange-100 text-sm">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}! 👋</p>
            <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
            <p className="text-orange-100 text-sm mt-0.5">What would you like to order today?</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="bg-white text-orange-600 font-bold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm">
            + New Order
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Total Orders', value: orders.length, icon: '📦' },
            { label: 'Active', value: activeOrders.length, icon: '🚚' },
            { label: 'Total Spent', value: `₹${totalSpent.toFixed(0)}`, icon: '💰' },
          ].map(s => (
            <div key={s.label} className="bg-white/20 backdrop-blur rounded-xl p-3 text-center">
              <p className="text-xl">{s.icon}</p>
              <p className="text-white font-bold text-lg">{s.value}</p>
              <p className="text-orange-100 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Quick Order Section */}
        <div>
          <h3 className="font-bold text-gray-800 mb-3">🔥 Quick Order</h3>
          <div className="grid grid-cols-3 gap-2">
            {FOOD_SUGGESTIONS.map(item => (
              <button key={item.name} onClick={() => quickOrder(item, QUICK_ADDRESSES[0])}
                className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center hover:shadow-md hover:border-orange-200 transition-all">
                <p className="text-2xl mb-1">{item.emoji}</p>
                <p className="text-xs font-semibold text-gray-800">{item.name}</p>
                <p className="text-xs text-orange-600 font-medium">{item.price}</p>
                <p className="text-xs text-gray-400">{item.time}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Addresses */}
        <div>
          <h3 className="font-bold text-gray-800 mb-3">📍 Deliver To</h3>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {QUICK_ADDRESSES.map(addr => (
              <button key={addr.label}
                onClick={() => setNewOrder(p => ({...p, deliveryAddress: addr.address, deliveryLat: addr.lat, deliveryLng: addr.lng}))}
                className="flex-shrink-0 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100 flex items-center gap-2 hover:border-orange-200 transition-all">
                <span>{addr.icon}</span>
                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-800">{addr.label}</p>
                  <p className="text-xs text-gray-400 max-w-24 truncate">{addr.address}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Orders Tabs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">My Orders</h3>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button onClick={() => setActiveTab('active')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'active' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>
                Active ({activeOrders.length})
              </button>
              <button onClick={() => setActiveTab('history')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'history' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>
                History ({historyOrders.length})
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {(activeTab === 'active' ? activeOrders : historyOrders).map(order => {
              const statusLabel = getStatusLabel(order.status);
              return (
                <Link key={order.id} to={`/customer/order/${order.id}`}
                  className="block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                  {/* Order Header */}
                  <div className={`px-4 py-2 flex justify-between items-center ${
                    statusLabel === 'Delivered' ? 'bg-green-600' :
                    statusLabel === 'Cancelled' ? 'bg-red-500' :
                    statusLabel === 'InTransit' ? 'bg-blue-600' : 'bg-gray-800'
                  }`}>
                    <span className="text-white text-xs font-mono font-bold">{order.orderNumber}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-white/20 text-white`}>
                      {STATUS_EMOJI[statusLabel]} {statusLabel}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {/* Items */}
                        {order.items && order.items.length > 0 && (
                          <div className="flex gap-2 mb-2 flex-wrap">
                            {order.items.map(item => (
                              <span key={item.id} className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-lg font-medium">
                                🍽️ {item.name} ×{item.quantity}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <span>📍</span> {order.deliveryAddress}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {format(new Date(order.createdAt), 'MMM d, yyyy • HH:mm')}
                        </p>
                        {order.driverName && (
                          <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                            <span>🚚</span> {order.driverName} is delivering
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-lg font-bold text-green-700">₹{order.totalAmount?.toFixed(2)}</p>
                        <p className="text-xs text-blue-600 mt-1">View details →</p>
                      </div>
                    </div>

                    {/* Active order progress bar */}
                    {activeTab === 'active' && statusLabel !== 'Pending' && (
                      <div className="mt-3 pt-3 border-t border-gray-50">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{['Pending','Confirmed','AssignedToDriver','PickedUp','InTransit','Delivered'].indexOf(statusLabel)}/5 steps</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${(['Pending','Confirmed','AssignedToDriver','PickedUp','InTransit','Delivered'].indexOf(statusLabel) / 5) * 100}%` }}>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}

            {(activeTab === 'active' ? activeOrders : historyOrders).length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <p className="text-4xl mb-3">{activeTab === 'active' ? '🚚' : '📋'}</p>
                <p className="font-semibold text-gray-700">
                  {activeTab === 'active' ? 'No active orders' : 'No order history'}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {activeTab === 'active' ? 'Place an order to get started!' : 'Your completed orders will appear here'}
                </p>
                {activeTab === 'active' && (
                  <button onClick={() => setShowCreate(true)}
                    className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-xl font-semibold text-sm hover:bg-orange-600">
                    Order Now 🚀
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 sm:items-center p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white rounded-t-3xl px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">🛵 Place New Order</h3>
                <button onClick={() => setShowCreate(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200">✕</button>
              </div>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">📦 Pickup Address</label>
                <input className="input-field" placeholder="Enter pickup location" required
                  value={newOrder.pickupAddress} onChange={e => setNewOrder(p => ({...p, pickupAddress: e.target.value}))} />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input className="input-field text-sm" placeholder="Lat (e.g 17.4325)" type="number" step="any"
                    onChange={e => setNewOrder(p => ({...p, pickupLat: parseFloat(e.target.value)}))} />
                  <input className="input-field text-sm" placeholder="Lng (e.g 78.4272)" type="number" step="any"
                    onChange={e => setNewOrder(p => ({...p, pickupLng: parseFloat(e.target.value)}))} />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">🏠 Delivery Address</label>
                <input className="input-field" placeholder="Enter delivery location" required
                  value={newOrder.deliveryAddress} onChange={e => setNewOrder(p => ({...p, deliveryAddress: e.target.value}))} />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input className="input-field text-sm" placeholder="Lat" type="number" step="any"
                    value={newOrder.deliveryLat || ''}
                    onChange={e => setNewOrder(p => ({...p, deliveryLat: parseFloat(e.target.value)}))} />
                  <input className="input-field text-sm" placeholder="Lng" type="number" step="any"
                    value={newOrder.deliveryLng || ''}
                    onChange={e => setNewOrder(p => ({...p, deliveryLng: parseFloat(e.target.value)}))} />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">🛍️ Items</label>
                <div className="space-y-2">
                  {newOrder.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2">
                      <input className="input-field text-sm col-span-1" placeholder="Item name" required
                        value={item.name}
                        onChange={e => { const items = [...newOrder.items]; items[i].name = e.target.value; setNewOrder(p => ({...p, items})); }} />
                      <input className="input-field text-sm" placeholder="Qty" type="number" min="1" defaultValue="1"
                        onChange={e => { const items = [...newOrder.items]; items[i].quantity = parseInt(e.target.value); setNewOrder(p => ({...p, items})); }} />
                      <input className="input-field text-sm" placeholder="₹ Price" type="number" step="any" required
                        value={item.price || ''}
                        onChange={e => { const items = [...newOrder.items]; items[i].price = parseFloat(e.target.value); setNewOrder(p => ({...p, items})); }} />
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setNewOrder(p => ({...p, items: [...p.items, {name:'',quantity:1,price:0}]}))}
                  className="mt-2 text-orange-600 text-sm font-medium flex items-center gap-1">
                  + Add another item
                </button>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">📝 Notes (optional)</label>
                <textarea className="input-field" placeholder="Special instructions..." rows={2}
                  onChange={e => setNewOrder(p => ({...p, notes: e.target.value}))} />
              </div>

              {/* Total Preview */}
              <div className="bg-orange-50 rounded-xl p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated Total</span>
                  <span className="font-bold text-orange-700">
                    ₹{newOrder.items.reduce((s, i) => s + (i.price * i.quantity), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Delivery Fee</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 btn-secondary py-3 rounded-xl font-semibold">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors">
                  🚀 Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}