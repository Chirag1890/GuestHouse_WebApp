import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getGuestHouses, getRoomsByGuestHouse, getBedsByRoom, createBooking } from '../services/api';
import { GuestHouse, Room, Bed } from '../types';
import { SelectChangeEvent } from '@mui/material/Select';

const BookingForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [guestHouses, setGuestHouses] = useState<GuestHouse[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [selectedGuestHouse, setSelectedGuestHouse] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedBed, setSelectedBed] = useState('');
  const [form, setForm] = useState({
    checkInDate: '',
    checkOutDate: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    address: '',
    purpose: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchGuestHouses();
    // Pre-select guest house, room, bed, and dates if passed in location.state
    const state = location.state as { guestHouseId?: string | number, roomId?: string | number, bedId?: string | number, checkInDate?: string, checkOutDate?: string };
    if (state) {
      if (state.guestHouseId) {
        setSelectedGuestHouse(String(state.guestHouseId));
        fetchRooms(String(state.guestHouseId));
      }
      if (state.roomId) {
        setSelectedRoom(String(state.roomId));
        fetchBeds(String(state.roomId));
      }
      if (state.bedId) {
        setSelectedBed(String(state.bedId));
      }
      setForm((prev) => ({
        ...prev,
        checkInDate: state.checkInDate || prev.checkInDate,
        checkOutDate: state.checkOutDate || prev.checkOutDate,
      }));
    }
  }, []);

  const fetchGuestHouses = async () => {
    try {
      const data = await getGuestHouses();
      setGuestHouses(data);
    } catch (err: any) {
      setError('Failed to fetch guest houses');
    }
  };

  const fetchRooms = async (guestHouseId: string) => {
    try {
      const data = await getRoomsByGuestHouse(Number(guestHouseId));
      setRooms(data);
    } catch (err: any) {
      setError('Failed to fetch rooms');
    }
  };

  const fetchBeds = async (roomId: string) => {
    try {
      const data = await getBedsByRoom(Number(roomId));
      setBeds(data);
    } catch (err: any) {
      setError('Failed to fetch beds');
    }
  };

  const handleGuestHouseChange = (e: SelectChangeEvent<string>) => {
    const id = e.target.value;
    setSelectedGuestHouse(id);
    setSelectedRoom('');
    setSelectedBed('');
    setRooms([]);
    setBeds([]);
    fetchRooms(id);
  };

  const handleRoomChange = (e: SelectChangeEvent<string>) => {
    const id = e.target.value;
    setSelectedRoom(id);
    setSelectedBed('');
    setBeds([]);
    fetchBeds(id);
  };

  const handleBedChange = (e: SelectChangeEvent<string>) => {
    setSelectedBed(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(false);
    
    // Validate phone number format (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form.phoneNumber)) {
      setError('Phone number must be exactly 10 digits');
      setLoading(false);
      return;
    }
    
    try {
      await createBooking({
        userId: user?.id,
        bedId: Number(selectedBed),
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        gender: form.gender,
        address: form.address,
        purpose: form.purpose,
      });
      setSuccess(true);
      setTimeout(() => navigate('/my-bookings'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3} maxWidth={600} mx="auto">
      <Typography variant="h4" gutterBottom>
        Book a Room
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Booking successful! Redirecting...</Alert>}
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Guest House</InputLabel>
            <Select value={selectedGuestHouse} onChange={handleGuestHouseChange} required>
              {guestHouses.map((gh) => (
                <MenuItem key={gh.id} value={gh.id}>{gh.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" disabled={!selectedGuestHouse}>
            <InputLabel>Room</InputLabel>
            <Select value={selectedRoom} onChange={handleRoomChange} required>
              {rooms.map((room) => (
                <MenuItem key={room.id} value={room.id}>{room.roomNumber}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" disabled={!selectedRoom}>
            <InputLabel>Bed</InputLabel>
            <Select value={selectedBed} onChange={handleBedChange} required>
              {beds.map((bed) => (
                <MenuItem key={bed.id} value={bed.id}>{bed.bedNumber}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField fullWidth margin="normal" label="Check-in Date" name="checkInDate" type="date" InputLabelProps={{ shrink: true }} value={form.checkInDate} onChange={handleInputChange} required />
          <TextField fullWidth margin="normal" label="Check-out Date" name="checkOutDate" type="date" InputLabelProps={{ shrink: true }} value={form.checkOutDate} onChange={handleInputChange} required />
          <TextField fullWidth margin="normal" label="First Name" name="firstName" value={form.firstName} onChange={handleInputChange} required />
          <TextField fullWidth margin="normal" label="Last Name" name="lastName" value={form.lastName} onChange={handleInputChange} required />
          <TextField fullWidth margin="normal" label="Email" name="email" type="email" value={form.email} onChange={handleInputChange} required />
          <TextField fullWidth margin="normal" label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={handleInputChange} required helperText="Enter exactly 10 digits (e.g., 1234567890)" />
          <TextField fullWidth margin="normal" label="Gender" name="gender" value={form.gender} onChange={handleInputChange} required />
          <TextField fullWidth margin="normal" label="Address" name="address" value={form.address} onChange={handleInputChange} required />
          <TextField fullWidth margin="normal" label="Purpose" name="purpose" value={form.purpose} onChange={handleInputChange} />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Book Now'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default BookingForm; 