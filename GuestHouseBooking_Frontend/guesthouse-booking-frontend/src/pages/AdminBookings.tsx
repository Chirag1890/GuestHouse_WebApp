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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import { format } from 'date-fns';
import { 
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as DenyIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getBookings, approveBooking, denyBooking } from '../services/api';
import { Booking } from '../types';

// Admin Bookings Management Component
const AdminBookings: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getBookings();
      setBookings(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBooking = async () => {
    if (!selectedBooking) return;

    try {
      setUpdating(true);
      await approveBooking(selectedBooking.id);
      await fetchBookings();
      setApproveDialogOpen(false);
      setSelectedBooking(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve booking');
      console.error('Error approving booking:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDenyBooking = async () => {
    if (!selectedBooking) return;

    try {
      setUpdating(true);
      await denyBooking(selectedBooking.id, rejectionReason);
      await fetchBookings();
      setDenyDialogOpen(false);
      setSelectedBooking(null);
      setRejectionReason('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to deny booking');
      console.error('Error denying booking:', err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate('/admin')} color="primary">
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Booking Management
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Guest House</TableCell>
              <TableCell>Room</TableCell>
              <TableCell>Bed</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Check-in</TableCell>
              <TableCell>Check-out</TableCell>
              <TableCell>Total Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.guestHouseName || 'N/A'}</TableCell>
                <TableCell>{booking.roomNumber || 'N/A'}</TableCell>
                <TableCell>{booking.bedNumber || 'N/A'}</TableCell>
                <TableCell>{booking.userName || 'N/A'}</TableCell>
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
                    color={getStatusColor(booking.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/bookings/${booking.id}`)}
                      color="primary"
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  
                  {booking.status === 'PENDING' && (
                    <>
                      <Tooltip title="Approve Booking">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setApproveDialogOpen(true);
                          }}
                          color="success"
                        >
                          <ApproveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Deny Booking">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setDenyDialogOpen(true);
                          }}
                          color="error"
                        >
                          <DenyIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Approve Booking Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to approve this booking?
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
                User: {selectedBooking.userName || 'N/A'}
              </Typography>
              <Typography>
                Check-in: {format(new Date(selectedBooking.checkInDate), 'MMM dd, yyyy')}
              </Typography>
              <Typography>
                Check-out: {format(new Date(selectedBooking.checkOutDate), 'MMM dd, yyyy')}
              </Typography>
              <Typography>
                Total Price: ${selectedBooking.totalPrice.toFixed(2)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setApproveDialogOpen(false)}
            disabled={updating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApproveBooking}
            color="success"
            variant="contained"
            disabled={updating}
          >
            {updating ? 'Approving...' : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deny Booking Dialog */}
      <Dialog
        open={denyDialogOpen}
        onClose={() => setDenyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Deny Booking</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to deny this booking?
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason (Optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            sx={{ mt: 2 }}
          />
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
                User: {selectedBooking.userName || 'N/A'}
              </Typography>
              <Typography>
                Check-in: {format(new Date(selectedBooking.checkInDate), 'MMM dd, yyyy')}
              </Typography>
              <Typography>
                Check-out: {format(new Date(selectedBooking.checkOutDate), 'MMM dd, yyyy')}
              </Typography>
              <Typography>
                Total Price: ${selectedBooking.totalPrice.toFixed(2)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDenyDialogOpen(false)}
            disabled={updating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDenyBooking}
            color="error"
            variant="contained"
            disabled={updating}
          >
            {updating ? 'Denying...' : 'Deny'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminBookings; 