import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  Hotel,
  Bed,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getGuestHousesWithAvailableBeds } from '../services/api';
import { GuestHouse } from '../types';

const GuestHouses: React.FC = () => {
  const navigate = useNavigate();
  const [guestHouses, setGuestHouses] = React.useState<GuestHouse[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const isAuthenticated = Boolean(localStorage.getItem('token'));

  React.useEffect(() => {
    const fetchGuestHouses = async () => {
      try {
        setLoading(true);
        const response = await getGuestHousesWithAvailableBeds();
        console.log('Fetched guest houses with real statistics:', response);
        setGuestHouses(response);
      } catch (err: any) {
        console.error('Error fetching guest houses:', err);
        setError(err?.response?.data?.message || 'Failed to load guest houses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGuestHouses();
  }, []);

  const handleViewDetails = (guestHouseId: number) => {
    navigate(`/guesthouses/${guestHouseId}`);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
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

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Available Guest Houses
      </Typography>

      <Grid container spacing={4}>
        {guestHouses.map((guestHouse) => (
          <Grid item xs={12} md={6} lg={4} key={guestHouse.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <CardMedia
                component="img"
                height="250"
                image={guestHouse.imageUrl || `https://source.unsplash.com/random/800x600?house&sig=${guestHouse.id}`}
                alt={guestHouse.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                  {guestHouse.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {guestHouse.address}, {guestHouse.city}
                  </Typography>
                </Box>

                {guestHouse.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {guestHouse.description.length > 100 
                      ? `${guestHouse.description.substring(0, 100)}...` 
                      : guestHouse.description}
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Contact Information */}
                <Box sx={{ mb: 2 }}>
                  {guestHouse.contactNumber && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Phone sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {guestHouse.contactNumber}
                      </Typography>
                    </Box>
                  )}
                  {guestHouse.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Email sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {guestHouse.email}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Statistics */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip 
                    icon={<Hotel />} 
                    label={`${guestHouse.totalRooms || 0} Rooms`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                  <Chip 
                    icon={<Bed />} 
                    label={`${guestHouse.totalBeds || 0} Beds`} 
                    size="small" 
                    color="secondary" 
                    variant="outlined"
                  />
                  <Chip 
                    icon={<CheckCircle />} 
                    label={`${guestHouse.availableBeds || 0} Available`} 
                    size="small" 
                    color="success" 
                    variant="outlined"
                  />
                </Box>

                {/* Amenities Preview */}
                {guestHouse.amenities && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                      Amenities:
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {guestHouse.amenities.length > 50 
                        ? `${guestHouse.amenities.substring(0, 50)}...` 
                        : guestHouse.amenities}
                    </Typography>
                  </Box>
                )}
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => handleViewDetails(guestHouse.id)}
                >
                  View Details & Book
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {guestHouses.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No guest houses available at the moment.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default GuestHouses; 