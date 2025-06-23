export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: number;
  username: string;
  password?: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
  isEnabled?: boolean;
  isAccountNonLocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  fullName?: string;
  totalBookings?: number;
  activeBookings?: number;
}

export interface GuestHouse {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  description?: string;
  amenities?: string;
  contactNumber?: string;
  email?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  totalRooms?: number;
  totalBeds?: number;
  availableBeds?: number;
}

export interface Room {
  id: number;
  roomNumber: string;
  guestHouseId: number;
  roomType?: string;
  capacity?: number;
  pricePerNight?: number;
  description?: string;
  isAvailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  guestHouseName?: string;
  totalBeds?: number;
  availableBeds?: number;
}

export interface Bed {
  id: number;
  bedNumber: string;
  roomId: number;
  bedType?: string;
  pricePerNight?: number;
  isAvailable?: boolean;
  isAvailableForBooking?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  roomNumber?: string;
  guestHouseId?: number;
  guestHouseName?: string;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELED = 'CANCELED',
  COMPLETED = 'COMPLETED',
  DENIED = 'DENIED'
}

export interface Booking {
  id: number;
  userId?: number;
  bedId: number;
  roomId?: number;
  guestHouseId?: number;
  checkInDate: string;
  checkOutDate: string;
  status: BookingStatus;
  totalPrice: number;
  purpose?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  userName?: string;
  bedNumber?: string;
  roomNumber?: string;
  guestHouseName?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  address: string;
  rejectionReason?: string;
  cancellationReason?: string;
  guestHouse?: GuestHouse;
  room?: Room;
  bed?: Bed;
  user?: User;
}

export interface DashboardStats {
  totalUsers?: number;
  totalGuestHouses?: number;
  totalRooms?: number;
  totalBeds?: number;
  availableBeds?: number;
  totalBookings?: number;
  activeBookings?: number;
  completedBookings?: number;
  canceledBookings?: number;
  pendingBookings?: number;
  confirmedBookings?: number;
  deniedBookings?: number;
  totalRevenue?: number;
  averageBookingValue?: number;
  occupancyRate?: number;
  periodStartDate?: string;
  periodEndDate?: string;
  periodBookings?: number;
  periodRevenue?: number;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  role: UserRole;
  id: number;
  firstName: string;
  lastName: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface BookingForm {
  userId?: number;
  bedId: number;
  checkInDate: string;
  checkOutDate: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  address: string;
  purpose?: string;
}

export interface BookingFilters {
  status?: BookingStatus;
  checkInDate?: string;
  checkOutDate?: string;
  guestHouseId?: number;
  userId?: number;
}

export interface GuestHouseFilters {
  city?: string;
  state?: string;
  country?: string;
  hasAvailableBeds?: boolean;
} 