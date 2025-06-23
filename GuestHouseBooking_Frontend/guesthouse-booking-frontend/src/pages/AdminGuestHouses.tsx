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
  Card,
  CardMedia,
  Grid,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { getGuestHouses, createGuestHouse, updateGuestHouse, deleteGuestHouse } from '../services/api';
import { GuestHouse } from '../types';

const AdminGuestHouses: React.FC = () => {
  const [guestHouses, setGuestHouses] = useState<GuestHouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GuestHouse | null>(null);
  const [viewing, setViewing] = useState<GuestHouse | null>(null);
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    description: '',
    amenities: '',
    contactNumber: '',
    email: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchGuestHouses();
  }, []);

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

  const handleOpenDialog = (guestHouse?: GuestHouse) => {
    if (guestHouse) {
      setEditing(guestHouse);
      setForm({
        name: guestHouse.name,
        address: guestHouse.address,
        city: guestHouse.city,
        state: guestHouse.state,
        country: guestHouse.country,
        description: guestHouse.description || '',
        amenities: guestHouse.amenities || '',
        contactNumber: guestHouse.contactNumber || '',
        email: guestHouse.email || '',
        imageUrl: guestHouse.imageUrl || '',
      });
    } else {
      setEditing(null);
      setForm({
        name: '',
        address: '',
        city: '',
        state: '',
        country: '',
        description: '',
        amenities: '',
        contactNumber: '',
        email: '',
        imageUrl: '',
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
    try {
      let response;
      if (editing) {
        response = await updateGuestHouse(editing.id, form);
      } else {
        response = await createGuestHouse(form);
      }
      if (response) {
        fetchGuestHouses();
        handleCloseDialog();
      } else {
        setError('Failed to save guest house');
      }
    } catch (err: any) {
      // Show backend error message if available
      const backendMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      setError(backendMsg || 'Failed to save guest house');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this guest house?')) return;
    try {
      await deleteGuestHouse(id);
      fetchGuestHouses();
    } catch (err: any) {
      setError('Failed to delete guest house');
    }
  };

  const handleViewDetails = (guestHouse: GuestHouse) => {
    setViewing(guestHouse);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setViewing(null);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Manage Guest Houses
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Button variant="contained" color="primary" startIcon={<Add />} sx={{ mb: 2 }} onClick={() => handleOpenDialog()}>
        Add Guest House
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
                <TableCell>Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>City</TableCell>
                <TableCell>State</TableCell>
                <TableCell>Country</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {guestHouses.map((gh) => (
                <TableRow key={gh.id}>
                  <TableCell>{gh.name}</TableCell>
                  <TableCell>{gh.address}</TableCell>
                  <TableCell>{gh.city}</TableCell>
                  <TableCell>{gh.state}</TableCell>
                  <TableCell>{gh.country}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleViewDetails(gh)} color="primary"><Visibility /></IconButton>
                    <IconButton onClick={() => handleOpenDialog(gh)}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(gh.id)} color="error"><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Guest House' : 'Add Guest House'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="normal" label="Name" name="name" value={form.name} onChange={handleFormChange} required />
          <TextField fullWidth margin="normal" label="Address" name="address" value={form.address} onChange={handleFormChange} required />
          <TextField fullWidth margin="normal" label="City" name="city" value={form.city} onChange={handleFormChange} required />
          <TextField fullWidth margin="normal" label="State" name="state" value={form.state} onChange={handleFormChange} required />
          <TextField fullWidth margin="normal" label="Country" name="country" value={form.country} onChange={handleFormChange} required />
          <TextField fullWidth margin="normal" label="Description" name="description" value={form.description} onChange={handleFormChange} />
          <TextField fullWidth margin="normal" label="Amenities" name="amenities" value={form.amenities} onChange={handleFormChange} />
          <TextField fullWidth margin="normal" label="Contact Number" name="contactNumber" value={form.contactNumber} onChange={handleFormChange} />
          <TextField fullWidth margin="normal" label="Email" name="email" value={form.email} onChange={handleFormChange} />
          <TextField fullWidth margin="normal" label="Image URL" name="imageUrl" value={form.imageUrl} onChange={handleFormChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={handleCloseDetailsDialog} maxWidth="md" fullWidth>
        <DialogTitle>Guest House Details</DialogTitle>
        <DialogContent>
          {viewing && (
            <Box>
              {viewing.imageUrl && (
                <Card sx={{ mb: 3 }}>
                  <CardMedia
                    component="img"
                    height="300"
                    image={viewing.imageUrl}
                    alt={viewing.name}
                    sx={{ objectFit: 'cover' }}
                  />
                </Card>
              )}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Basic Information</Typography>
                  <Typography><strong>Name:</strong> {viewing.name}</Typography>
                  <Typography><strong>Address:</strong> {viewing.address}</Typography>
                  <Typography><strong>City:</strong> {viewing.city}</Typography>
                  <Typography><strong>State:</strong> {viewing.state}</Typography>
                  <Typography><strong>Country:</strong> {viewing.country}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Contact Information</Typography>
                  <Typography><strong>Contact Number:</strong> {viewing.contactNumber || 'Not provided'}</Typography>
                  <Typography><strong>Email:</strong> {viewing.email || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Description</Typography>
                  <Typography>{viewing.description || 'No description available'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Amenities</Typography>
                  <Typography>{viewing.amenities || 'No amenities listed'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Statistics</Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip label={`${viewing.totalRooms || 0} Rooms`} color="primary" />
                    <Chip label={`${viewing.totalBeds || 0} Total Beds`} color="secondary" />
                    <Chip label={`${viewing.availableBeds || 0} Available Beds`} color="success" />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog}>Close</Button>
          <Button 
            onClick={() => {
              if (viewing) {
                handleCloseDetailsDialog();
                handleOpenDialog(viewing);
              }
            }} 
            variant="contained" 
            color="primary"
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminGuestHouses; 