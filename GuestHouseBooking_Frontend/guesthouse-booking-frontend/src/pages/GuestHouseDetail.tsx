import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from '@mui/material';
import {
  Hotel as HotelIcon,
  Bed as BedIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn,
  Phone,
  Email,
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { getGuestHouseById, getRoomsByGuestHouse, getAvailableBeds, createBooking } from '../services/api';
import { GuestHouse, Room, Bed } from '../types';

const GuestHouseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [guestHouse, setGuestHouse] = React.useState<GuestHouse | null>(null);
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null);
  const [checkInDate, setCheckInDate] = React.useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = React.useState<Date | null>(null);
  const [availableBeds, setAvailableBeds] = React.useState<Bed[]>([]);
  const [selectedBed, setSelectedBed] = React.useState<Bed | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = React.useState(false);
  const isAuthenticated = Boolean(localStorage.getItem('token'));
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchGuestHouseDetails = async () => {
    try {
      setLoading(true);
      const [guestHouseResponse, roomsResponse] = await Promise.all([
        getGuestHouseById(Number(id)),
        getRoomsByGuestHouse(Number(id)),
      ]);
      console.log('Fetched guest house details with real statistics:', guestHouseResponse);
      console.log('Guest house image URL:', guestHouseResponse.imageUrl);
      console.log('Fetched rooms:', roomsResponse);
      setGuestHouse(guestHouseResponse);
      setRooms(roomsResponse);
    } catch (err) {
      console.error('Error fetching guest house details:', err);
      setError('Failed to load guest house details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableBeds = async (room: Room) => {
    if (!checkInDate || !checkOutDate) return;

    try {
      const response = await getAvailableBeds(
        room.id,
        format(checkInDate, 'yyyy-MM-dd'),
        format(checkOutDate, 'yyyy-MM-dd')
      );
      setAvailableBeds(response);
    } catch (err) {
      setError('Failed to load available beds.');
    }
  };

  React.useEffect(() => {
    fetchGuestHouseDetails();
  }, [id]);

  const handleRoomSelect = async (room: Room) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedRoom(room);
    if (checkInDate && checkOutDate) {
      fetchAvailableBeds(room);
    }
  };

  const handleBookingSubmit = async () => {
    if (!selectedBed || !checkInDate || !checkOutDate) return;

    try {
      await createBooking({
        bedId: selectedBed.id,
        checkInDate: format(checkInDate, 'yyyy-MM-dd'),
        checkOutDate: format(checkOutDate, 'yyyy-MM-dd'),
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        gender: 'Not specified',
        address: 'Not specified',
        purpose: 'Leisure',
      });
      navigate('/my-bookings');
    } catch (err) {
      setError('Failed to create booking. Please try again.');
    }
  };

  const handleBookRoom = () => {
    if (!guestHouse) return;
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    navigate('/book', { state: { guestHouseId: guestHouse.id } });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!guestHouse) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Guest house not found.</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleBookRoom}>
          {isAuthenticated ? 'Book a Room' : 'Login to Book'}
        </Button>
      </Box>
      <Card sx={{ mb: 4 }}>
        <CardMedia
          component="img"
          height="400"
          image={guestHouse.imageUrl || `https://source.unsplash.com/random/1200x800?house&sig=${guestHouse.id}`}
          alt={guestHouse.name}
          sx={{ 
            objectFit: 'cover',
            backgroundColor: 'grey.200'
          }}
          onError={(e) => {
            console.log('Image failed to load, using fallback');
            const target = e.target as HTMLImageElement;
            target.src = `https://source.unsplash.com/random/1200x800?house&sig=${guestHouse.id}`;
          }}
        />
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            {guestHouse.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationOn sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
            <Typography variant="subtitle1" color="text.secondary">
              {guestHouse.address}, {guestHouse.city}, {guestHouse.state}
            </Typography>
          </Box>

          {guestHouse.description && (
            <Typography variant="body1" paragraph>
              {guestHouse.description}
            </Typography>
          )}

          {/* Contact Information */}
          {(guestHouse.contactNumber || guestHouse.email) && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Contact Information
              </Typography>
              {guestHouse.contactNumber && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Phone sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {guestHouse.contactNumber}
                  </Typography>
                </Box>
              )}
              {guestHouse.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {guestHouse.email}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Real Available Beds Statistics */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Availability Statistics
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip 
                icon={<HotelIcon />} 
                label={`${guestHouse.totalRooms || 0} Rooms`} 
                color="primary" 
                variant="outlined"
              />
              <Chip 
                icon={<BedIcon />} 
                label={`${guestHouse.totalBeds || 0} Total Beds`} 
                color="secondary" 
                variant="outlined"
              />
              <Chip 
                icon={<CheckCircleIcon />} 
                label={`${guestHouse.availableBeds || 0} Available Beds`} 
                color="success" 
                variant="outlined"
              />
            </Box>
          </Box>

          {/* Amenities */}
          {guestHouse.amenities && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Amenities
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {guestHouse.amenities}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Book Your Stay
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
              <DatePicker
                label="Check-in Date"
                value={checkInDate}
                onChange={(newValue) => setCheckInDate(newValue)}
                disablePast
              />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
              <DatePicker
                label="Check-out Date"
                value={checkOutDate}
                onChange={(newValue) => setCheckOutDate(newValue)}
                minDate={checkInDate || undefined}
              />
            </Box>
          </Box>
        </LocalizationProvider>
      </Box>

      <Divider sx={{ mb: 4 }} />

      <Typography variant="h5" gutterBottom>
        Available Rooms
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {rooms.map((room) => (
          <Box key={room.id} sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                height: '100%',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => handleRoomSelect(room)}
            >
              <Typography variant="h6" gutterBottom>
                Room {room.roomNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {room.description}
              </Typography>
            </Paper>
          </Box>
        ))}
      </Box>

      <Dialog open={Boolean(selectedRoom && availableBeds.length > 0)} onClose={() => setSelectedRoom(null)}>
        <DialogTitle>Select a Bed</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {availableBeds.map((bed) => (
              <Box key={bed.id}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    bgcolor: selectedBed?.id === bed.id ? 'action.selected' : 'background.paper',
                  }}
                  onClick={() => setSelectedBed(bed)}
                >
                  <Typography variant="subtitle1">Bed {bed.bedNumber}</Typography>
                </Paper>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRoom(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!selectedBed}
            onClick={() => {
              if (selectedBed && selectedRoom && guestHouse && checkInDate && checkOutDate) {
                navigate('/book', {
                  state: {
                    guestHouseId: guestHouse.id,
                    roomId: selectedRoom.id,
                    bedId: selectedBed.id,
                    checkInDate: format(checkInDate, 'yyyy-MM-dd'),
                    checkOutDate: format(checkOutDate, 'yyyy-MM-dd'),
                  },
                });
              }
            }}
          >
            Book this Bed
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={bookingDialogOpen} onClose={() => setBookingDialogOpen(false)}>
        <DialogTitle>Confirm Booking</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Please confirm your booking details:
          </Typography>
          <Typography variant="body2">
            Check-in: {checkInDate ? format(checkInDate, 'PP') : ''}
          </Typography>
          <Typography variant="body2">
            Check-out: {checkOutDate ? format(checkOutDate, 'PP') : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleBookingSubmit}>
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GuestHouseDetail; 