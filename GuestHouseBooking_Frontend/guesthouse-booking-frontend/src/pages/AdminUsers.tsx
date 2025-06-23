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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Add, Edit, Delete, Visibility, VisibilityOff } from '@mui/icons-material';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api';
import { User, UserRole } from '../types';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: UserRole.USER,
    isEnabled: true,
    isAccountNonLocked: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditing(user);
      setForm({
        username: user.username,
        email: user.email,
        password: '', // Don't populate password for security
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber || '',
        role: user.role,
        isEnabled: user.isEnabled || true,
        isAccountNonLocked: user.isAccountNonLocked || true,
      });
    } else {
      setEditing(null);
      setForm({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: UserRole.USER,
        isEnabled: true,
        isAccountNonLocked: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setShowPassword(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.checked });
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        // For updates, only send password if it's been changed
        const { password, ...updateData } = form;
        const finalUpdateData = password ? { ...updateData, password } : updateData;
        await updateUser(editing.id, finalUpdateData);
      } else {
        await createUser(form);
      }
      fetchUsers();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'error';
      case UserRole.USER:
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (isEnabled: boolean, isAccountNonLocked: boolean) => {
    if (!isEnabled) return 'error';
    if (!isAccountNonLocked) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Manage Users
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        color="primary"
        startIcon={<Add />}
        onClick={() => handleOpenDialog()}
        sx={{ mb: 2 }}
      >
        Add User
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Total Bookings</TableCell>
              <TableCell>Active Bookings</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phoneNumber || 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={getRoleColor(user.role)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.isEnabled && user.isAccountNonLocked ? 'Active' : 
                           !user.isEnabled ? 'Disabled' : 'Locked'}
                    color={getStatusColor(user.isEnabled || false, user.isAccountNonLocked || false)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{user.totalBookings || 0}</TableCell>
                <TableCell>{user.activeBookings || 0}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenDialog(user)}>
                    <Edit />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(user.id)} 
                    color="error"
                    disabled={user.role === UserRole.ADMIN}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            name="username"
            value={form.username}
            onChange={handleFormChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleFormChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label={editing ? 'New Password (leave blank to keep current)' : 'Password'}
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleFormChange}
            required={!editing}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="First Name"
            name="firstName"
            value={form.firstName}
            onChange={handleFormChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Last Name"
            name="lastName"
            value={form.lastName}
            onChange={handleFormChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Phone Number"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleFormChange}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={form.role}
              onChange={handleSelectChange}
              label="Role"
            >
              <MenuItem value={UserRole.USER}>User</MenuItem>
              <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                name="isEnabled"
                checked={form.isEnabled}
                onChange={handleSwitchChange}
              />
            }
            label="Account Enabled"
            sx={{ mt: 1 }}
          />
          <FormControlLabel
            control={
              <Switch
                name="isAccountNonLocked"
                checked={form.isAccountNonLocked}
                onChange={handleSwitchChange}
              />
            }
            label="Account Unlocked"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers; 