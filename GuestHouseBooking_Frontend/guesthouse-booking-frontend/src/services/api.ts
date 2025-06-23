import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { 
  User, 
  GuestHouse, 
  Room, 
  Bed, 
  Booking, 
  AuthResponse, 
  DashboardStats,
  LoginForm,
  RegisterForm,
  BookingForm,
  BookingFilters,
  GuestHouseFilters,
  BookingStatus
} from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// JWT Token Management
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp && decoded.exp < currentTime;
  } catch (e) {
    console.error('Error decoding token:', e);
    return true;
  }
};

// Request Interceptor: Attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !isTokenExpired(token)) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      method: response.config.method,
    });
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const isLoginPage = window.location.pathname.includes('/login');
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    console.error('❌ API Error', {
      url: error.config?.url,
      status,
      message: error.message,
    });

    if (status === 401 && !isLoginPage && !isLoginRequest) {
      console.warn('🔒 Unauthorized – Token expired or invalid. Redirecting to login.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.replace('/login');
    }

    return Promise.reject(error);
  }
);

// ===== AUTHENTICATION API =====
export const login = async (credentials: LoginForm): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

export const register = async (userData: RegisterForm): Promise<User> => {
  const response = await api.post<User>('/users/register', userData);
  return response.data;
};

export const forgotPassword = async (email: string): Promise<void> => {
  await api.post('/auth/forgot-password', { email });
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  await api.post('/auth/reset-password', { token, newPassword });
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (e) {
    console.warn('Logout API call failed, but continuing with local cleanup');
  }
};

// ===== GUEST HOUSE API =====
export const getGuestHouses = async (): Promise<GuestHouse[]> => {
  const response = await api.get<GuestHouse[]>('/guesthouses');
  return response.data;
};

export const getGuestHouseById = async (id: number): Promise<GuestHouse> => {
  const response = await api.get<GuestHouse>(`/guesthouses/${id}`);
  return response.data;
};

export const getGuestHousesWithRooms = async (): Promise<GuestHouse[]> => {
  const response = await api.get<GuestHouse[]>('/guesthouses/with-rooms');
  return response.data;
};

export const getGuestHousesWithAvailableBeds = async (): Promise<GuestHouse[]> => {
  const response = await api.get<GuestHouse[]>('/guesthouses/with-available-beds');
  return response.data;
};

export const createGuestHouse = async (data: Partial<GuestHouse>): Promise<GuestHouse> => {
  const response = await api.post<GuestHouse>('/guesthouses', data);
  return response.data;
};

export const updateGuestHouse = async (id: number, data: Partial<GuestHouse>): Promise<GuestHouse> => {
  const response = await api.put<GuestHouse>(`/guesthouses/${id}`, data);
  return response.data;
};

export const deleteGuestHouse = async (id: number): Promise<void> => {
  await api.delete(`/guesthouses/${id}`);
};

// ===== ROOM API =====
export const getRooms = async (): Promise<Room[]> => {
  const response = await api.get<Room[]>('/rooms');
  return response.data;
};

export const getRoomById = async (id: number): Promise<Room> => {
  const response = await api.get<Room>(`/rooms/${id}`);
  return response.data;
};

export const getRoomsByGuestHouse = async (guestHouseId: number): Promise<Room[]> => {
  const response = await api.get<Room[]>(`/rooms/by-guesthouse/${guestHouseId}`);
  return response.data;
};

export const createRoom = async (data: Partial<Room>): Promise<Room> => {
  const response = await api.post<Room>('/rooms', data);
  return response.data;
};

export const updateRoom = async (id: number, data: Partial<Room>): Promise<Room> => {
  const response = await api.put<Room>(`/rooms/${id}`, data);
  return response.data;
};

export const deleteRoom = async (id: number): Promise<void> => {
  await api.delete(`/rooms/${id}`);
};

// ===== BED API =====
export const getBeds = async (): Promise<Bed[]> => {
  const response = await api.get<Bed[]>('/beds');
  return response.data;
};

export const getBedById = async (id: number): Promise<Bed> => {
  const response = await api.get<Bed>(`/beds/${id}`);
  return response.data;
};

export const getBedsByRoom = async (roomId: number): Promise<Bed[]> => {
  const response = await api.get<Bed[]>(`/beds/by-room/${roomId}`);
  return response.data;
};

export const getAvailableBeds = async (
  roomId: number,
  checkIn: string,
  checkOut: string
): Promise<Bed[]> => {
  const response = await api.get<Bed[]>('/beds/available', {
    params: { roomId, checkIn, checkOut },
  });
  return response.data;
};

export const createBed = async (data: Partial<Bed>): Promise<Bed> => {
  const response = await api.post<Bed>('/beds', data);
  return response.data;
};

export const updateBed = async (id: number, data: Partial<Bed>): Promise<Bed> => {
  const response = await api.put<Bed>(`/beds/${id}`, data);
  return response.data;
};

export const deleteBed = async (id: number): Promise<void> => {
  await api.delete(`/beds/${id}`);
};

export const updateBedAvailability = async (): Promise<string> => {
  const response = await api.post<string>('/beds/update-availability');
  return response.data;
};

// ===== BOOKING API =====
export const createBooking = async (bookingData: BookingForm): Promise<Booking> => {
  const response = await api.post<Booking>('/bookings', bookingData);
  return response.data;
};

export const getBookings = async (filters?: BookingFilters): Promise<Booking[]> => {
  const response = await api.get<Booking[]>('/bookings', {
    params: filters,
  });
  return response.data;
};

export const getBookingById = async (id: number): Promise<Booking> => {
  const response = await api.get<Booking>(`/bookings/${id}`);
  return response.data;
};

export const getBookingsByUser = async (userId: number, status?: BookingStatus): Promise<Booking[]> => {
  const response = await api.get<Booking[]>(`/bookings/by-user/${userId}`, {
    params: { status },
  });
  return response.data;
};

export const getActiveBookings = async (): Promise<Booking[]> => {
  const response = await api.get<Booking[]>('/bookings/active');
  return response.data;
};

export const updateBooking = async (id: number, bookingData: Partial<Booking>): Promise<Booking> => {
  const response = await api.put<Booking>(`/bookings/${id}`, bookingData);
  return response.data;
};

export const cancelBooking = async (id: number): Promise<Booking> => {
  const response = await api.put<Booking>(`/bookings/${id}/cancel`);
  return response.data;
};

export const completeBooking = async (id: number): Promise<Booking> => {
  const response = await api.put<Booking>(`/bookings/${id}/complete`);
  return response.data;
};

export const deleteBooking = async (id: number): Promise<void> => {
  await api.delete(`/bookings/${id}`);
};

export const approveBooking = async (id: number): Promise<Booking> => {
  const response = await api.put<Booking>(`/bookings/${id}/approve`);
  return response.data;
};

export const denyBooking = async (id: number, rejectionReason?: string): Promise<Booking> => {
  console.log('=== Frontend Deny Booking Debug ===');
  console.log('Booking ID:', id);
  console.log('Rejection Reason:', rejectionReason);
  console.log('Request Body:', rejectionReason || '');
  
  const response = await api.put<Booking>(`/bookings/${id}/deny`, rejectionReason || '');
  console.log('Response Status:', response.status);
  console.log('Response Data:', response.data);
  console.log('===================================');
  
  return response.data;
};

// ===== DASHBOARD API =====
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>('/dashboard/stats');
  return response.data;
};

export const getPeriodReport = async (startDate: string, endDate: string): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>('/dashboard/report', {
    params: { startDate, endDate },
  });
  return response.data;
};

export const getApprovedRevenueBreakdown = async (): Promise<string> => {
  const response = await api.get<string>('/dashboard/approved-revenue');
  return response.data;
};

// ===== USER API =====
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/users');
  return response.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const response = await api.get<User>(`/users/${id}`);
  return response.data;
};

export const createUser = async (userData: Partial<User>): Promise<User> => {
  const response = await api.post<User>('/users', userData);
  return response.data;
};

export const updateUser = async (id: number, userData: Partial<User>): Promise<User> => {
  const response = await api.put<User>(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export default api; 