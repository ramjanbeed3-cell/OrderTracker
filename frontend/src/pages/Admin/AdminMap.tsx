import { useEffect, useState } from 'react';
import { useAuthStore } from '../../context/authStore';
import { createConnection, startConnection } from '../../services/signalr';
import { driversApi } from '../../services/api';
import { LocationUpdate } from '../../types';

export default function AdminMap() {
  const [drivers, setDrivers] = useState<LocationUpdate[]>([]);
  const { token } = useAuthStore();

  useEffect(() => {
    driversApi.getActiveLocations().then((locs: LocationUpdate[]) => setDrivers(locs));
  }, []);

  useEffect(() => {
    if (!token) return;
    const conn = createConnection(token);
    startConnection(conn);
    conn.on('DriverLocationUpdated', (loc: LocationUpdate) => {
      setDrivers(prev => {
        const existing = prev.find(d => d.driverId === loc.driverId);
        if (existing) return prev.map(d => d.driverId === loc.driverId ? loc : d);
        return [...prev, loc];
      });
    });
    return () => { conn.stop(); };
  }, [token]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">🗺️ Live Driver Map</h2>
        <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
          {drivers.length} Active Driver{drivers.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200 h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px'}}>
          </div>
          <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-300 opacity-40"></div>
          <div className="absolute top-0 bottom-0 left-1/2 w-2 bg-gray-300 opacity-40"></div>
          {drivers.map((d, i) => (
            <div key={d.driverId} className="absolute animate-bounce"
              style={{ top: `${30 + i * 20}%`, left: `${40 + i * 15}%` }}>
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg shadow-lg border-2 border-white">🚚</div>
              <div className="bg-white text-xs px-2 py-1 rounded shadow mt-1 text-center font-medium">{d.driverName}</div>
            </div>
          ))}
          {drivers.length === 0 && (
            <div className="text-center z-10">
              <p className="text-4xl mb-3">🗺️</p>
              <p className="text-gray-500 font-medium">No active drivers</p>
            </div>
          )}
          <div className="absolute bottom-3 right-3 bg-white rounded-lg px-3 py-1 text-xs text-gray-500 shadow">📍 Hyderabad, India</div>
          <div className="absolute top-3 left-3 bg-white rounded-lg px-3 py-1 text-xs text-gray-500 shadow">🔴 Live Tracking</div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">Active Drivers</h3>
          {drivers.map(d => (
            <div key={d.driverId} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">{d.driverName[0]}</div>
                <div>
                  <p className="font-medium text-gray-900">{d.driverName}</p>
                  <p className="text-xs text-gray-400">{d.lat !== 0 ? `${d.lat.toFixed(4)}, ${d.lng.toFixed(4)}` : 'Location updating...'}</p>
                </div>
                <span className="ml-auto w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse"></span>
              </div>
            </div>
          ))}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">Legend</p>
            <div className="space-y-1 text-xs text-gray-500">
              <div>🚚 Active Driver</div>
              <div>📦 Pickup Point</div>
              <div>🏠 Delivery Point</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Online Drivers', value: drivers.length, icon: '👤', color: 'text-blue-600' },
          { label: 'Delivering Now', value: drivers.filter(d => d.activeOrderId).length, icon: '🚚', color: 'text-green-600' },
          { label: 'Available', value: drivers.filter(d => !d.activeOrderId).length, icon: '✅', color: 'text-purple-600' },
          { label: 'Coverage Area', value: 'Hyderabad', icon: '🗺️', color: 'text-indigo-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.icon} {s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}