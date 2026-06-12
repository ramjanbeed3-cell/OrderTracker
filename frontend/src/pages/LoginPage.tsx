import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuthStore } from '../context/authStore';
import toast from 'react-hot-toast';

const roleMap: Record<number, string> = { 1: 'Customer', 2: 'Driver', 3: 'Admin' };

export default function LoginPage() {
  const [email, setEmail] = useState('admin@ordertracker.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      const user = {
        ...data.user,
        role: typeof data.user.role === 'number' ? roleMap[data.user.role] : data.user.role
      };
      localStorage.setItem('token', data.token);
      setAuth(data.token, user);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'Admin') navigate('/admin', { replace: true });
      else if (user.role === 'Driver') navigate('/driver', { replace: true });
      else navigate('/customer', { replace: true });
    } catch {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🚀 OrderTracker</h1>
          <p className="text-gray-500 mt-2">Real-Time Delivery Platform</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="input-field" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="input-field" placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary py-3">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
          <p className="font-semibold mb-1">Demo Credentials:</p>
          <p>Admin: admin@ordertracker.com / Admin@123</p>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}