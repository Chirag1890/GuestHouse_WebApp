import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats, getPeriodReport } from '../services/api';
import { DashboardStats } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Welcome back, {user?.firstName}!
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          mt: 2,
        }}
      >
        <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Guest Houses
              </Typography>
              <Typography variant="h4">{stats.totalGuestHouses}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Rooms
              </Typography>
              <Typography variant="h4">{stats.totalRooms}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Beds
              </Typography>
              <Typography variant="h4">{stats.totalBeds}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Available Beds
              </Typography>
              <Typography variant="h4">{stats.availableBeds || stats.totalBeds || 0}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Bookings
              </Typography>
              <Typography variant="h4">{stats.activeBookings}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4">${(stats.totalRevenue || 0).toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4">{stats.totalUsers}</Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard; 