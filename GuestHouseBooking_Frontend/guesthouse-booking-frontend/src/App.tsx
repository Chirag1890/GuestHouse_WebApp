import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { MainLayout } from './components/Layout/MainLayout';
import { theme } from './theme';
import { UserRole } from './types';
import AdminLayout from './components/Layout/AdminLayout';
import UserLayout from './components/Layout/UserLayout';
import PublicLayout from './components/Layout/PublicLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import GuestHouses from './pages/GuestHouses';
import GuestHouseDetail from './pages/GuestHouseDetail';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import MyBookings from './pages/MyBookings';
import BookingDetails from './pages/BookingDetails';
import AdminDashboard from './pages/AdminDashboard';
import AdminBookings from './pages/AdminBookings';
import BookingForm from './pages/BookingForm';
import AdminGuestHouses from './pages/AdminGuestHouses';
import AdminRooms from './pages/AdminRooms';
import AdminBeds from './pages/AdminBeds';
import AdminUsers from './pages/AdminUsers';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <AuthProvider>
          <Routes>
            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="guesthouses" element={<AdminGuestHouses />} />
              <Route path="rooms" element={<AdminRooms />} />
              <Route path="beds" element={<AdminBeds />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="bookings" element={<AdminBookings />} />
              {/* Add other admin pages here, e.g. Manage Users */}
            </Route>

            {/* User routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={[UserRole.USER, UserRole.ADMIN]}>
                  <UserLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="my-bookings" element={<MyBookings />} />
              <Route path="bookings/:id" element={<BookingDetails />} />
              <Route path="book" element={<BookingForm />} />
            </Route>

            {/* Guest Houses with PublicLayout (no authentication required) */}
            <Route path="/guesthouses" element={<PublicLayout />}>
              <Route index element={<GuestHouses />} />
              <Route path=":id" element={<GuestHouseDetail />} />
            </Route>

            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App; 