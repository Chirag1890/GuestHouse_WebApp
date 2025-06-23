import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Cancel as CancelIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getBookingsByUser, cancelBooking } from '../services/api';
import { Booking, BookingStatus } from '../types';
import { format } from 'date-fns';

const MyBookings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchBookings();
    } else if (user === null) {
      // User is not authenticated
      setLoading(false);
    }
  }, [user?.id]);

  const fetchBookings = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getBookingsByUser(user.id);
      setBookings(data);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      setCancelling(true);
      await cancelBooking(selectedBooking.id);
      await fetchBookings();
      setCancelDialogOpen(false);
      setSelectedBooking(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
      console.error('Error cancelling booking:', err);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELED':
        return 'error';
      case 'COMPLETED':
        return 'info';
      case 'DENIED':
        return 'error';
      default:
        return 'default';
    }
  };

  // Function to determine what actions are available based on booking status
  const getAvailableActions = (booking: Booking) => {
    const status = booking.status.toUpperCase();
    
    switch (status) {
      case 'PENDING':
        return {
          canView: true,
          canEdit: true,
          canDelete: true,
        };
      case 'CONFIRMED':
        return {
          canView: true,
          canEdit: false,
          canDelete: false,
        };
      case 'CANCELED':
      case 'DENIED':
        return {
          canView: true,
          canEdit: false,
          canDelete: false,
        };
      default:
        return {
          canView: true,
          canEdit: false,
          canDelete: false,
        };
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user?.id) {
    return (
      <Box p={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Bookings
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please log in to view your bookings.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Bookings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {bookings.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No bookings found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You haven't made any bookings yet.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/book')}
          >
            Book a Room
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Guest House</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Bed</TableCell>
                <TableCell>Check-in</TableCell>
                <TableCell>Check-out</TableCell>
                <TableCell>Total Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => {
                const actions = getAvailableActions(booking);
                
                return (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.guestHouseName || 'N/A'}</TableCell>
                    <TableCell>{booking.roomNumber || 'N/A'}</TableCell>
                    <TableCell>{booking.bedNumber || 'N/A'}</TableCell>
                    <TableCell>
                      {format(new Date(booking.checkInDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>${booking.totalPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={booking.status}
                        color={getStatusColor(booking.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {/* View Details - Always available */}
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/bookings/${booking.id}`)}
                        title="View Details"
                        color="primary"
                      >
                        <ViewIcon />
                      </IconButton>
                      
                      {/* Edit Booking - Only for PENDING status */}
                      {actions.canEdit && (
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/bookings/${booking.id}`)}
                          title="Edit Booking"
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      
                      {/* Cancel/Delete Booking - Only for PENDING status */}
                      {actions.canDelete && (
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setCancelDialogOpen(true);
                          }}
                          title="Cancel Booking"
                          color="error"
                        >
                          <CancelIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </Typography>
          {selectedBooking && (
            <Box mt={2}>
              <Typography variant="subtitle2">Booking Details:</Typography>
              <Typography>
                Guest House: {selectedBooking.guestHouseName || 'N/A'}
              </Typography>
              <Typography>
                Room: {selectedBooking.roomNumber || 'N/A'}
              </Typography>
              <Typography>
                Bed: {selectedBooking.bedNumber || 'N/A'}
              </Typography>
              <Typography>
                Check-in: {format(new Date(selectedBooking.checkInDate), 'MMM dd, yyyy')}
              </Typography>
              <Typography>
                Check-out: {format(new Date(selectedBooking.checkOutDate), 'MMM dd, yyyy')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCancelDialogOpen(false)}
            disabled={cancelling}
          >
            Keep Booking
          </Button>
          <Button
            onClick={handleCancelBooking}
            color="error"
            variant="contained"
            disabled={cancelling}
          >
            {cancelling ? <CircularProgress size={24} /> : 'Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyBookings; 