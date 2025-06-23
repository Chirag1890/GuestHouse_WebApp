import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Hotel as HotelIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  BookOnline as BookOnlineIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

export const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    // Check if the path requires admin role
    const isAdminPath = path.startsWith('/admin');
    
    // If trying to access admin path but not admin, redirect to unauthorized
    if (isAdminPath && !isAdmin) {
      navigate('/unauthorized', { replace: true });
      return;
    }

    // If authenticated, proceed with navigation
    if (user) {
      navigate(path, { replace: true });
      if (isMobile) {
        setMobileOpen(false);
      }
    } else {
      // If not authenticated, redirect to login
      navigate('/login', { 
        replace: true,
        state: { from: path }
      });
    }
  };

  const handleLogout = () => {
    logout();
    // Use replace to prevent back navigation
    navigate('/login', { replace: true });
  };

  // Filter menu items based on user role
  const menuItems = React.useMemo(() => {
    const items = [
      { text: 'Home', path: '/', icon: <HomeIcon /> },
      { text: 'Guest Houses', path: '/guesthouses', icon: <HotelIcon /> },
      { text: 'My Bookings', path: '/my-bookings', icon: <BookOnlineIcon /> },
      { text: 'Book a Room', path: '/book', icon: <BookOnlineIcon /> },
    ];

    // Only add admin dashboard for admin users
    if (isAdmin) {
      items.push({ text: 'Admin Dashboard', path: '/admin', icon: <DashboardIcon /> });
    }

    return items;
  }, [isAdmin]);

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Guest House Booking
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            selected={location.pathname === item.path}
            onClick={() => handleNavigation(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {user?.firstName} {user?.lastName}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}; 