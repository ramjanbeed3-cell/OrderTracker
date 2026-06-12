import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then(r => r.data),
  register: (data: { name: string; email: string; password: string; phone: string; role: number }) =>
    api.post('/auth/register', data).then(r => r.data),
};

export const ordersApi = {
  getAll: (page = 1, pageSize = 20) =>
    api.get(`/orders?page=${page}&pageSize=${pageSize}`).then(r => r.data),
  getById: (id: number) => api.get(`/orders/${id}`).then(r => r.data),
  getMyOrders: () => api.get('/orders/my-orders').then(r => r.data),
  getDriverOrders: () => api.get('/orders/driver-orders').then(r => r.data),
  getPending: () => api.get('/orders/pending').then(r => r.data),
  create: (data: any) => api.post('/orders', data).then(r => r.data),
  updateStatus: (data: { orderId: number; status: number; comment?: string }) =>
    api.put('/orders/status', data).then(r => r.data),
  assignDriver: (orderId: number, driverId: number) =>
    api.put('/orders/assign-driver', { orderId, driverId }).then(r => r.data),
  getDashboard: () => api.get('/orders/dashboard').then(r => r.data),
};

export const driversApi = {
  updateLocation: (lat: number, lng: number) =>
    api.post('/drivers/location', { lat, lng }),
  setAvailability: (isAvailable: boolean) =>
    api.post(`/drivers/availability?isAvailable=${isAvailable}`),
  getActiveLocations: () => api.get('/drivers/active-locations').then(r => r.data),
};

export default api;
