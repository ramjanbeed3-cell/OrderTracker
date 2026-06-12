export type UserRole = 'Customer' | 'Driver' | 'Admin';

export type OrderStatus =
  | 'Pending' | 'Confirmed' | 'AssignedToDriver'
  | 'PickedUp' | 'InTransit' | 'NearbyDelivery'
  | 'Delivered' | 'Cancelled' | 'Failed';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

export interface DriverLocation {
  lat: number;
  lng: number;
  lastUpdate: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  driverId: number | null;
  driverName: string | null;
  status: OrderStatus;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  totalAmount: number;
  notes: string | null;
  createdAt: string;
  deliveredAt: string | null;
  items: OrderItem[];
  driverLocation: DriverLocation | null;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  activeOrders: number;
  deliveredToday: number;
  activeDrivers: number;
  todayRevenue: number;
}

export interface LocationUpdate {
  driverId: number;
  driverName: string;
  lat: number;
  lng: number;
  activeOrderId: number | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
