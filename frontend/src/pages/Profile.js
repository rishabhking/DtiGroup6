import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Avatar,
  Divider
} from '@mui/material';
import {
  Person,
  Email,
  Code,
  Save,
  AccountCircle
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile, loading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    codeforceHandle: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        codeforceHandle: user.codeforceHandle || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific errors
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear messages
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    const errors = {};
    
    if (formData.firstName && formData.firstName.length > 50) {
      errors.firstName = 'First name cannot exceed 50 characters';
    }
    
    if (formData.lastName && formData.lastName.length > 50) {
      errors.lastName = 'Last name cannot exceed 50 characters';
    }
    
    if (formData.codeforceHandle && formData.codeforceHandle.length > 50) {
      errors.codeforceHandle = 'Codeforces handle cannot exceed 50 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const result = await updateProfile(formData);
    
    if (result.success) {
      setSuccess('Profile updated successfully!');
      setError('');
    } else {
      setError(result.error || 'Failed to update profile');
      setSuccess('');
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: 'primary.main', 
              mx: 'auto', 
              mb: 2,
              fontSize: '2rem'
            }}
          >
            {user.username.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Profile Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account information
          </Typography>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Read-only information */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Account Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                value={user.username}
                disabled
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'action.disabled' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={user.email}
                disabled
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'action.disabled' }} />
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Editable information */}
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Personal Information
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
                margin="normal"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Codeforces Handle"
                name="codeforceHandle"
                value={formData.codeforceHandle}
                onChange={handleChange}
                error={!!formErrors.codeforceHandle}
                helperText={formErrors.codeforceHandle || 'Your Codeforces username for tracking submissions'}
                margin="normal"
                InputProps={{
                  startAdornment: <Code sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            sx={{ mt: 3, px: 4 }}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Profile;
