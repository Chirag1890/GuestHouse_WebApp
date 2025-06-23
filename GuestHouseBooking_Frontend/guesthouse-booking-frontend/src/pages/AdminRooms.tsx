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
import { getGuestHouses, getRoomsByGuestHouse, createRoom, updateRoom, deleteRoom } from '../services/api';
import { GuestHouse, Room } from '../types';

const AdminRooms: React.FC = () => {
  const [guestHouses, setGuestHouses] = useState<GuestHouse[]>([]);
  const [selectedGuestHouse, setSelectedGuestHouse] = useState<string>('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form, setForm] = useState({
    roomNumber: '',
    description: '',
    roomType: '',
    capacity: '',
    pricePerNight: '',
    isAvailable: true,
  });

  useEffect(() => {
    fetchGuestHouses();
  }, []);

  useEffect(() => {
    if (selectedGuestHouse) {
      fetchRooms(selectedGuestHouse);
    } else {
      setRooms([]);
    }
  }, [selectedGuestHouse]);

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

  const handleOpenDialog = (room?: Room) => {
    if (room) {
      setEditing(room);
      setForm({
        roomNumber: room.roomNumber,
        description: room.description || '',
        roomType: room.roomType || '',
        capacity: String(room.capacity || ''),
        pricePerNight: String(room.pricePerNight || ''),
        isAvailable: room.isAvailable || true,
      });
    } else {
      setEditing(null);
      setForm({
        roomNumber: '',
        description: '',
        roomType: '',
        capacity: '',
        pricePerNight: '',
        isAvailable: true,
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

  const handleSubmit = async () => {
    if (!selectedGuestHouse) return;
    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity) || undefined,
        pricePerNight: Number(form.pricePerNight) || undefined,
        guestHouseId: Number(selectedGuestHouse),
      };
      if (editing) {
        await updateRoom(editing.id, payload);
      } else {
        await createRoom(payload);
      }
      fetchRooms(selectedGuestHouse);
      handleCloseDialog();
    } catch (err: any) {
      setError('Failed to save room');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await deleteRoom(id);
      fetchRooms(selectedGuestHouse);
    } catch (err: any) {
      setError('Failed to delete room');
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Manage Rooms
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
      <Button variant="contained" color="primary" startIcon={<Add />} sx={{ mb: 2 }} onClick={() => handleOpenDialog()} disabled={!selectedGuestHouse}>
        Add Room
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
                <TableCell>Room Number</TableCell>
                <TableCell>Room Type</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Price Per Night</TableCell>
                <TableCell>Available</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>{room.roomNumber}</TableCell>
                  <TableCell>{room.roomType || 'N/A'}</TableCell>
                  <TableCell>{room.capacity || 'N/A'}</TableCell>
                  <TableCell>${room.pricePerNight || 'N/A'}</TableCell>
                  <TableCell>{room.isAvailable ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{room.description || 'N/A'}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(room)}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(room.id)} color="error"><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Room' : 'Add Room'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="normal" label="Room Number" name="roomNumber" value={form.roomNumber} onChange={handleFormChange} required />
          <TextField fullWidth margin="normal" label="Description" name="description" value={form.description} onChange={handleFormChange} />
          <TextField fullWidth margin="normal" label="Room Type" name="roomType" value={form.roomType} onChange={handleFormChange} />
          <TextField fullWidth margin="normal" label="Capacity" name="capacity" value={form.capacity} onChange={handleFormChange} type="number" />
          <TextField fullWidth margin="normal" label="Price Per Night" name="pricePerNight" value={form.pricePerNight} onChange={handleFormChange} type="number" />
          <Box display="flex" alignItems="center" gap={2} mt={2}>
            <label>
              <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} /> Available
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

export default AdminRooms; 