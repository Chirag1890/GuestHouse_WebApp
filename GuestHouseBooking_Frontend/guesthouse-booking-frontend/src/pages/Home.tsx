import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Hotel, Book, Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getGuestHouses } from '../services/api';
import { GuestHouse } from '../types';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [guestHouses, setGuestHouses] = useState<GuestHouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuestHouses = async () => {
      try {
        const data = await getGuestHouses();
        setGuestHouses(data);
      } catch (err) {
        setError('Failed to load guest houses');
        console.error('Error fetching guest houses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuestHouses();
  }, []);

  const features = [
    {
      title: 'Browse Guest Houses',
      description: 'Explore our selection of comfortable guest houses.',
      icon: <Hotel sx={{ fontSize: 40 }} />,
      action: () => navigate('/guesthouses'),
      buttonText: 'View Guest Houses',
    },
    {
      title: 'Book Your Stay',
      description: 'Easy booking process with instant confirmation.',
      icon: <Book sx={{ fontSize: 40 }} />,
      action: () => navigate(isAuthenticated ? '/book' : '/login'),
      buttonText: isAuthenticated ? 'Book Now' : 'Login to Book',
    },
    {
      title: 'Manage Your Bookings',
      description: 'View and manage your booking history.',
      icon: <Person sx={{ fontSize: 40 }} />,
      action: () => navigate(isAuthenticated ? '/my-bookings' : '/login'),
      buttonText: isAuthenticated ? 'My Bookings' : 'Login to View',
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Guest House Booking
        </Typography>
        <Typography variant="h6" color="textSecondary" paragraph>
          Find and book comfortable accommodations for your stay
        </Typography>
        {isAuthenticated && (
          <Typography variant="body1" color="primary">
            Welcome back, {user?.firstName}!
          </Typography>
        )}
      </Box>

      {/* Features Section */}
      <Box mb={6}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center">
          What We Offer
        </Typography>
        <Grid container spacing={4} mt={2}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box color="primary.main" mb={2}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={feature.action}
                  >
                    {feature.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Guest Houses Section */}
      <Box>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center">
          Available Guest Houses
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {guestHouses.length > 0 ? (
          <Grid container spacing={3}>
            {guestHouses.slice(0, 6).map((guestHouse) => (
              <Grid item xs={12} sm={6} md={4} key={guestHouse.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {guestHouse.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {guestHouse.city}, {guestHouse.state}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {guestHouse.description}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      {guestHouse.availableBeds || 0} beds available
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(`/guesthouses/${guestHouse.id}`)}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1" textAlign="center" color="textSecondary">
            No guest houses available at the moment.
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default Home; 