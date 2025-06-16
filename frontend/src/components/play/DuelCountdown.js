import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import {
  Rocket as RocketIcon
} from '@mui/icons-material';
import ApiService from '../../services/ApiService';

const DuelCountdown = ({ duelId, onCountdownComplete }) => {
  const theme = useTheme();
  const [countdown, setCountdown] = useState(10);
  const [status, setStatus] = useState('starting');
  const [message, setMessage] = useState('Duel starting soon...');

  useEffect(() => {
    const fetchCountdown = async () => {
      try {
        const response = await ApiService.getDuelCountdown(duelId);
        if (response.success) {          setCountdown(response.countdown);
          setStatus(response.status);
          setMessage(response.message);
          
          if (response.countdown === 0 || response.status === 'active') {
            onCountdownComplete && onCountdownComplete();
          }
        }
      } catch (error) {
        console.error('Error fetching countdown:', error);
      }
    };

    // Initial fetch
    fetchCountdown();

    // Set up polling every second
    const interval = setInterval(fetchCountdown, 1000);

    return () => clearInterval(interval);
  }, [duelId, onCountdownComplete]);

  if (status !== 'starting' || countdown === 0) {
    return null; // Don't render if not in countdown state
  }

  return (
    <Card 
      elevation={8}
      sx={{ 
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        minWidth: 400,
        textAlign: 'center',
        bgcolor: 'background.paper',
        border: `3px solid ${theme.palette.primary.main}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <RocketIcon sx={{ fontSize: 60, color: 'primary.main' }} />
        </Box>
        
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
          Duel Starting Soon!
        </Typography>
        
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
          <CircularProgress
            variant="determinate"
            value={(10 - countdown) * 10}
            size={120}
            thickness={6}
            sx={{ color: 'primary.main' }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography 
              variant="h2" 
              component="div" 
              sx={{ 
                fontWeight: 'bold',
                fontFamily: 'monospace',
                color: 'primary.main'
              }}
            >
              {countdown}
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="h6" sx={{ mb: 2 }}>
          {message}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Get ready! The duel will begin automatically when the countdown reaches zero.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DuelCountdown;
