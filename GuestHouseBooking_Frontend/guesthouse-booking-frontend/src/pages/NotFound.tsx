import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      p={3}
      textAlign="center"
    >
      <Typography variant="h1" color="textSecondary" gutterBottom>
        404
      </Typography>
      <Typography variant="h4" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate(isAuthenticated ? '/' : '/login')}
      >
        {isAuthenticated ? 'Go to Home' : 'Go to Login'}
      </Button>
    </Box>
  );
};

export default NotFound; 