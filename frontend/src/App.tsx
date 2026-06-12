import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './context/authStore';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminMap from './pages/Admin/AdminMap';
import CustomerDashboard from './pages/Customer/CustomerDashboard';
import CustomerOrderDetail from './pages/Customer/CustomerOrderDetail';
import DriverDashboard from './pages/Driver/DriverDashboard';
import Layout from './components/Layout/Layout';

function ProtectedRoute({ children, roles }: { children: JSX.Element; roles?: string[] }) {
  const { token, user } = useAuthStore();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    if (user.role === 'Driver') return <Navigate to="/driver" replace />;
    return <Navigate to="/customer" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<ProtectedRoute roles={['Admin']}><Layout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="map" element={<AdminMap />} />
        </Route>
        <Route path="/customer" element={<ProtectedRoute roles={['Customer']}><Layout /></ProtectedRoute>}>
          <Route index element={<CustomerDashboard />} />
          <Route path="order/:id" element={<CustomerOrderDetail />} />
        </Route>
        <Route path="/driver" element={<ProtectedRoute roles={['Driver']}><Layout /></ProtectedRoute>}>
          <Route index element={<DriverDashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}