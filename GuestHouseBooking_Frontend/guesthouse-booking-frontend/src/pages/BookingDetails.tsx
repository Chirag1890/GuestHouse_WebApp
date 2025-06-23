import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Edit, Delete, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { getBookingById, updateBooking, deleteBooking } from '../services/api';
import { Booking, BookingStatus } from '../types';

const BookingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    address: '',
    purpose: '',
  });

  useEffect(() => {
    if (id && user?.id) {
      fetchBookingDetails();
    } else if (user === null) {
      setLoading(false);
    }
  }, [id, user?.id]);

  const fetchBookingDetails = async () => {
    if (!id || !user?.id) {
      setError('Invalid booking ID or user not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getBookingById(Number(id));
      
      // Check if user can access this booking
      if (data.userId !== user.id && user.role !== 'ADMIN') {
        setError('You are not authorized to view this booking');
        setLoading(false);
        return;
      }
      
      setBooking(data);
      setForm({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        address: data.address,
        purpose: data.purpose || '',
      });
    } catch (err: any) {
      console.error('Error fetching booking details:', err);
      setError(err.response?.data?.message || 'Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdateBooking = async () => {
    if (!booking) return;
    
    try {
      setUpdating(true);
      setError(null);
      await updateBooking(booking.id, form);
      await fetchBookingDetails();
      setEditDialogOpen(false);
    } catch (err: any) {
      console.error('Error updating booking:', err);
      setError(err.response?.data?.message || 'Failed to update booking');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!booking) return;
    
    try {
      setDeleting(true);
      setError(null);
      await deleteBooking(booking.id);
      navigate('/my-bookings');
    } catch (err: any) {
      console.error('Error deleting booking:', err);
      setError(err.response?.data?.message || 'Failed to delete booking');
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return 'success';
      case BookingStatus.PENDING:
        return 'warning';
      case BookingStatus.CANCELED:
        return 'error';
      case BookingStatus.COMPLETED:
        return 'info';
      case BookingStatus.DENIED:
        return 'error';
      default:
        return 'default';
    }
  };

  const canEdit = booking?.status === BookingStatus.PENDING;
  const canDelete = booking?.status === BookingStatus.PENDING;

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
          Booking Details
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please log in to view booking details.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Booking Details
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/my-bookings')}>
          Back to My Bookings
        </Button>
      </Box>
    );
  }

  if (!booking) {
    return (
      <Box p={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Booking Details
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          Booking not found
        </Alert>
        <Button variant="contained" onClick={() => navigate('/my-bookings')}>
          Back to My Bookings
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/my-bookings')}
        >
          Back to My Bookings
        </Button>
        <Typography variant="h4" component="h1">
          Booking Details
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Booking Status Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" gutterBottom>
                  Booking Status
                </Typography>
                <Chip
                  label={booking.status}
                  color={getStatusColor(booking.status)}
                  size="medium"
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Booking ID: {booking.id}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Guest House Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Guest House Details
              </Typography>
              <Typography><strong>Guest House:</strong> {booking.guestHouseName || 'N/A'}</Typography>
              <Typography><strong>Room:</strong> {booking.roomNumber || 'N/A'}</Typography>
              <Typography><strong>Bed:</strong> {booking.bedNumber || 'N/A'}</Typography>
              <Typography><strong>Total Price:</strong> ${booking.totalPrice.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Dates */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Stay Details
              </Typography>
              <Typography><strong>Check-in:</strong> {format(new Date(booking.checkInDate), 'MMM dd, yyyy')}</Typography>
              <Typography><strong>Check-out:</strong> {format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}</Typography>
              <Typography><strong>Purpose:</strong> {booking.purpose || 'Not specified'}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Guest Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Guest Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>First Name:</strong> {booking.firstName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Last Name:</strong> {booking.lastName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Email:</strong> {booking.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Phone:</strong> {booking.phoneNumber}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Gender:</strong> {booking.gender}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Address:</strong> {booking.address}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box display="flex" gap={2} justifyContent="center">
            {canEdit && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Edit />}
                onClick={handleEdit}
              >
                Edit Booking
              </Button>
            )}
            {canDelete && (
              <Button
                variant="contained"
                color="error"
                startIcon={<Delete />}
                onClick={handleDelete}
              >
                Cancel Booking
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Booking Details</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={form.firstName}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={form.lastName}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={form.gender}
                  onChange={handleSelectChange}
                  label="Gender"
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={form.address}
                onChange={handleFormChange}
                required
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Purpose of Stay"
                name="purpose"
                value={form.purpose}
                onChange={handleFormChange}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={updating}>
            Cancel
          </Button>
          <Button onClick={handleUpdateBooking} variant="contained" disabled={updating}>
            {updating ? <CircularProgress size={24} /> : 'Update Booking'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </Typography>
          <Box mt={2}>
            <Typography variant="subtitle2">Booking Details:</Typography>
            <Typography>Guest House: {booking.guestHouseName || 'N/A'}</Typography>
            <Typography>Room: {booking.roomNumber || 'N/A'}</Typography>
            <Typography>Bed: {booking.bedNumber || 'N/A'}</Typography>
            <Typography>
              Check-in: {format(new Date(booking.checkInDate), 'MMM dd, yyyy')}
            </Typography>
            <Typography>
              Check-out: {format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Keep Booking
          </Button>
          <Button onClick={handleDeleteBooking} color="error" variant="contained" disabled={deleting}>
            {deleting ? <CircularProgress size={24} /> : 'Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingDetails; 