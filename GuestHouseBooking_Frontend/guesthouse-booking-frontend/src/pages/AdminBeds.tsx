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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { getGuestHouses, getRoomsByGuestHouse, getBedsByRoom, createBed, updateBed, deleteBed } from '../services/api';
import { GuestHouse, Room, Bed } from '../types';

const AdminBeds: React.FC = () => {
  const [guestHouses, setGuestHouses] = useState<GuestHouse[]>([]);
  const [selectedGuestHouse, setSelectedGuestHouse] = useState<string>('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Bed | null>(null);
  const [form, setForm] = useState({
    bedNumber: '',
    pricePerNight: '',
    isAvailable: true,
    isAvailableForBooking: true,
  });

  useEffect(() => {
    fetchGuestHouses();
  }, []);

  useEffect(() => {
    if (selectedGuestHouse) {
      fetchRooms(selectedGuestHouse);
      setSelectedRoom('');
      setBeds([]);
    } else {
      setRooms([]);
      setSelectedRoom('');
      setBeds([]);
    }
  }, [selectedGuestHouse]);

  useEffect(() => {
    if (selectedRoom) {
      fetchBeds(selectedRoom);
    } else {
      setBeds([]);
    }
  }, [selectedRoom]);

  const fetchGuestHouses = async () => {
    setLoading(true);
    try {
      const data = await getGuestHouses();
      setGuestHouses(data);
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch guest houses');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async (guestHouseId: string) => {
    setLoading(true);
    try {
      const data = await getRoomsByGuestHouse(Number(guestHouseId));
      setRooms(data);
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchBeds = async (roomId: string) => {
    setLoading(true);
    try {
      const data = await getBedsByRoom(Number(roomId));
      setBeds(data);
      setError(null);
    } catch (err: any) {
      setError('Failed to fetch beds');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (bed?: Bed) => {
    if (bed) {
      setEditing(bed);
      setForm({
        bedNumber: bed.bedNumber,
        pricePerNight: String(bed.pricePerNight || ''),
        isAvailable: bed.isAvailable || false,
        isAvailableForBooking: bed.isAvailableForBooking || false,
      });
    } else {
      setEditing(null);
      setForm({
        bedNumber: '',
        pricePerNight: '',
        isAvailable: true,
        isAvailableForBooking: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.checked });
  };

  const handleSubmit = async () => {
    if (!selectedRoom) return;
    try {
      const payload = {
        bedNumber: form.bedNumber,
        pricePerNight: Number(form.pricePerNight),
        isAvailable: form.isAvailable,
        isAvailableForBooking: form.isAvailableForBooking,
        roomId: Number(selectedRoom),
      };
      if (editing) {
        await updateBed(editing.id, payload);
      } else {
        await createBed(payload);
      }
      fetchBeds(selectedRoom);
      handleCloseDialog();
    } catch (err: any) {
      console.error('Error saving bed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save bed';
      setError(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this bed?')) return;
    try {
      await deleteBed(id);
      fetchBeds(selectedRoom);
    } catch (err: any) {
      setError('Failed to delete bed');
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Manage Beds
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <FormControl fullWidth margin="normal">
        <InputLabel>Guest House</InputLabel>
        <Select value={selectedGuestHouse} onChange={e => setSelectedGuestHouse(e.target.value)} required>
          {guestHouses.map((gh) => (
            <MenuItem key={gh.id} value={gh.id}>{gh.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal" disabled={!selectedGuestHouse}>
        <InputLabel>Room</InputLabel>
        <Select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} required>
          {rooms.map((room) => (
            <MenuItem key={room.id} value={room.id}>{room.roomNumber}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button variant="contained" color="primary" startIcon={<Add />} sx={{ mb: 2 }} onClick={() => handleOpenDialog()} disabled={!selectedRoom}>
        Add Bed
      </Button>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Bed Number</TableCell>
                <TableCell>Price Per Night</TableCell>
                <TableCell>Available</TableCell>
                <TableCell>Available For Booking</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {beds.map((bed) => (
                <TableRow key={bed.id}>
                  <TableCell>{bed.bedNumber}</TableCell>
                  <TableCell>{bed.pricePerNight}</TableCell>
                  <TableCell>{bed.isAvailable ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{bed.isAvailableForBooking ? 'Yes' : 'No'}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(bed)}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(bed.id)} color="error"><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Bed' : 'Add Bed'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="normal" label="Bed Number" name="bedNumber" value={form.bedNumber} onChange={handleFormChange} required />
          <TextField fullWidth margin="normal" label="Price Per Night" name="pricePerNight" value={form.pricePerNight} onChange={handleFormChange} required type="number" />
          <Box display="flex" alignItems="center" gap={2} mt={2}>
            <label>
              <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleCheckboxChange} /> Available
            </label>
            <label>
              <input type="checkbox" name="isAvailableForBooking" checked={form.isAvailableForBooking} onChange={handleCheckboxChange} /> Available For Booking
            </label>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminBeds; 