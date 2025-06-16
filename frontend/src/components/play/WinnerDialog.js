import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  useTheme
} from '@mui/material';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const WinnerDialog = ({ 
  open, 
  onClose, 
  winner, 
  winnerScore, 
  isDuel, 
  formatTime, 
  duelTiming 
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const getTimeDisplay = () => {
    if (duelTiming) {
      const elapsedTime = duelTiming.elapsedTime || 0;
      return formatTime(elapsedTime);
    }
    return '00:00:00';
  };

  const handleBackToHome = () => {
    onClose();
    navigate(isDuel ? '/duel' : '/practice');
  };

  const handlePlayAgain = () => {
    onClose();
    navigate(isDuel ? '/duel' : '/practice');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          textAlign: 'center'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <TrophyIcon sx={{ fontSize: 60, color: 'warning.main' }} />
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
            🎉 Congratulations! 🎉
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            {winner} Wins!
          </Typography>
          
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Final Score: {winnerScore} points
          </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
            Time: {getTimeDisplay()}
          </Typography>
          
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            bgcolor: theme.palette.success.light, 
            borderRadius: 2,
            border: `2px solid ${theme.palette.success.main}`
          }}>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              All problems have been solved successfully!
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
        <Button
          onClick={handlePlayAgain}
          variant="contained"
          color="primary"
          size="large"
          sx={{ 
            px: 4, 
            py: 1.5, 
            borderRadius: 2, 
            textTransform: 'none',
            fontWeight: 'bold'
          }}
        >
          {isDuel ? 'New Duel' : 'Practice Again'}
        </Button>
        
        <Button
          onClick={handleBackToHome}
          variant="outlined"
          color="primary"
          size="large"
          sx={{ 
            px: 4, 
            py: 1.5, 
            borderRadius: 2, 
            textTransform: 'none',
            fontWeight: 'bold'
          }}
        >
          Back to {isDuel ? 'Duels' : 'Practice'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WinnerDialog;
