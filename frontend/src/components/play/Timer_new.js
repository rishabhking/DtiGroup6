import React from 'react';
import {
  Box,
  Button,
  Typography,
  useTheme
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Replay as ResetIcon,
  TimerOutlined as TimerIcon
} from '@mui/icons-material';

const Timer = ({ 
  time, 
  isRunning, 
  onStart, 
  onStop, 
  onReset, 
  gameComplete,
  isDuel,
  duel
}) => {
  const theme = useTheme();

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  return (
    <Box sx={{ 
      textAlign: 'center', 
      width: '100%'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
        <TimerIcon sx={{ fontSize: 40, color: theme.palette.secondary.main }} />
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: '700', 
            fontFamily: 'monospace',
            fontSize: { xs: '2rem', sm: '2.5rem' },
            color: theme.palette.secondary.dark
          }}
        >
          {formatTime(time)}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
        {!gameComplete && !(isDuel && duel && duel.status === 'completed') && (
          <>
            <Button
              variant={isRunning ? "outlined" : "contained"}
              color={isRunning ? "secondary" : "success"}
              startIcon={isRunning ? <PauseIcon /> : <PlayIcon />}
              onClick={isRunning ? onStop : onStart}
              sx={{ 
                px: 3, 
                py: 1, 
                borderRadius: 2, 
                textTransform: 'none', 
                fontWeight: 'medium',
                minWidth: '120px'
              }}
            >
              {isRunning ? 'Pause' : 'Start'}
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ResetIcon />}
              onClick={onReset}
              sx={{ 
                px: 3, 
                py: 1, 
                borderRadius: 2, 
                textTransform: 'none', 
                fontWeight: 'medium',
                minWidth: '120px'
              }}
            >
              Reset
            </Button>
          </>
        )}
        
        {gameComplete && (
          <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
            🎉 All problems solved! Great job!
          </Typography>
        )}
        
        {isDuel && duel && duel.status === 'completed' && (
          <Typography variant="body2" color="warning.main" sx={{ fontWeight: 'bold' }}>
            🏆 Duel Complete!
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Timer;
