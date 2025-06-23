import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Chip,
} from '@mui/material';
import {
  Hotel as HotelIcon,
  Bed as BedIcon,
  MeetingRoom as RoomIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, updateBedAvailability } from '../services/api';
import { DashboardStats } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Admin Dashboard Component with Statistics
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      console.log('=== Frontend Dashboard Stats Debug ===');
      console.log('Received data:', data);
      console.log('Total Guest Houses:', data.totalGuestHouses);
      console.log('Total Rooms:', data.totalRooms);
      console.log('Total Beds:', data.totalBeds);
      console.log('Available Beds:', data.availableBeds);
      console.log('Total Revenue:', data.totalRevenue);
      console.log('Total Users:', data.totalUsers);
      console.log('Total Bookings:', data.totalBookings);
      console.log('Pending Bookings:', data.pendingBookings);
      console.log('Confirmed Bookings:', data.confirmedBookings);
      console.log('Completed Bookings:', data.completedBookings);
      console.log('Canceled Bookings:', data.canceledBookings);
      console.log('Denied Bookings:', data.deniedBookings);
      console.log('Active Bookings:', data.activeBookings);
      console.log('=====================================');
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard statistics');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      // First update bed availability
      await updateBedAvailability();
      // Then refresh dashboard stats
      await fetchDashboardStats();
    } catch (err: any) {
      setError('Failed to refresh dashboard data');
      console.error('Error refreshing dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color = 'primary',
    subtitle = '',
    onClick
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
    subtitle?: string;
    onClick?: () => void;
  }) => (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 4, transform: 'translateY(-2px)' } : {},
        transition: 'all 0.2s ease-in-out'
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={`${color}.main`}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box 
            sx={{ 
              color: `${color}.main`,
              backgroundColor: `${color}.light`,
              borderRadius: '50%',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
        <Box display="flex" gap={2}>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={handleRefresh}
            startIcon={<RefreshIcon />}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/admin/bookings')}
          >
            Manage Bookings
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {stats && (
        <>
          {/* Key Statistics */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Guest Houses"
                value={stats.totalGuestHouses || 0}
                icon={<HotelIcon />}
                color="primary"
                subtitle="Active properties"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Rooms"
                value={stats.totalRooms || 0}
                icon={<RoomIcon />}
                color="secondary"
                subtitle="All room types"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Beds"
                value={stats.totalBeds || 0}
                icon={<BedIcon />}
                color="info"
                subtitle="All bed capacity"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Available Beds"
                value={stats.availableBeds || 0}
                icon={<BedIcon />}
                color="success"
                subtitle="Ready for booking"
              />
            </Grid>
          </Grid>

          {/* Revenue and Booking Statistics */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Revenue"
                value={`$${(stats.totalRevenue || 0).toFixed(2)}`}
                icon={<MoneyIcon />}
                color="success"
                subtitle="All time earnings"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Bookings"
                value={stats.totalBookings || 0}
                icon={<AssignmentIcon />}
                color="primary"
                subtitle="All bookings"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Active Bookings"
                value={stats.activeBookings || 0}
                icon={<ScheduleIcon />}
                color="warning"
                subtitle="Currently active"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Users"
                value={stats.totalUsers || 0}
                icon={<PeopleIcon />}
                color="info"
                subtitle="Registered users"
              />
            </Grid>
          </Grid>

          {/* Booking Status Overview */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Booking Status Overview
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip label="Pending" color="warning" size="small" />
                      <Typography variant="h6">{stats.pendingBookings || 0}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip label="Confirmed" color="success" size="small" />
                      <Typography variant="h6">{stats.confirmedBookings || 0}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip label="Completed" color="info" size="small" />
                      <Typography variant="h6">{stats.completedBookings || 0}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip label="Cancelled/Denied" color="error" size="small" />
                      <Typography variant="h6">{(stats.canceledBookings || 0) + (stats.deniedBookings || 0)}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/admin/bookings')}
                    startIcon={<AssignmentIcon />}
                  >
                    Manage Bookings
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate('/admin/guesthouses')}
                    startIcon={<HotelIcon />}
                  >
                    Manage Guest Houses
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate('/admin/rooms')}
                    startIcon={<RoomIcon />}
                  >
                    Manage Rooms
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate('/admin/beds')}
                    startIcon={<BedIcon />}
                  >
                    Manage Beds
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate('/admin/users')}
                    startIcon={<PeopleIcon />}
                  >
                    Manage Users
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default AdminDashboard; 