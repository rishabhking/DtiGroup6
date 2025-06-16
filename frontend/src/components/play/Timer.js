import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  useTheme,
  Alert
} from '@mui/material';
import {
  TimerOutlined as TimerIcon
} from '@mui/icons-material';
import ApiService from '../../services/ApiService';

const Timer = ({ 
  duelId,
  isDuel,
  duel,
  onStatusChange
}) => {
  const theme = useTheme();
  const [status, setStatus] = useState(duel?.status || 'waiting');
  const [timeDisplay, setTimeDisplay] = useState('00:00:00');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);
  
  // Calculate time remaining client-side
  useEffect(() => {
    // Debug what duel data we're getting
    console.log("Timer component mounted/updated with duelId:", duelId);
    console.log("isDuel:", isDuel);
    console.log("Duel object:", duel);
    
    // In practice mode there is no duelId, but we still need to set up the timer
    if ((isDuel && !duelId) || !duel) {
      console.log("Missing required data for timer setup");
      return;
    }
    
    // Clear previous interval if it exists
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // First update status based on duel data to avoid initial delay
    if (duel) {
      console.log("Updating status from duel object");
      updateStatusFromDuel(duel);
      // Do initial timer calculation
      updateTimerDisplay(duel);
    } else {
      console.log("No duel object available yet");
    }

    // Do an initial fetch to synchronize status with server - only for actual duels
    if (isDuel && duelId) {
      const initialFetch = async () => {
        try {
          console.log("Fetching initial duel status from server");
          // Initial fetch to synchronize with server
          const response = await ApiService.getDuelStatus(duelId);
          console.log("Server response:", response);
          
          if (response.success) {
            setStatus(response.status);
            // Keep countdown updated from server
            setCountdown(response.countdown || 0);
            
            // Notify parent of status changes
            if (onStatusChange) {
              const timeData = { 
                timeUntilStart: duel ? calculateTimeUntilStart(duel) : 0,
                remainingTime: duel ? calculateRemainingTime(duel) : 0
              };
              console.log("Notifying parent with timing data:", timeData);
              onStatusChange(response.status, timeData);
            }
          }
        } catch (error) {
          console.error('Error fetching duel status:', error);
          setError('Failed to synchronize with server');
        }
      };
      
      initialFetch();
    }
    
    // Set up interval for client-side time calculation
    if (duel) {
      console.log("Setting up timer interval");
      intervalRef.current = setInterval(() => {
        // Update the timer every second
        updateTimerDisplay(duel);
      }, 1000);
    } else {
      console.log("No duel object yet, not setting up interval");
    }
    
    return () => {
      console.log("Cleaning up timer interval");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [duelId, isDuel, duel, onStatusChange]);

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

  const getTimerColor = () => {
    switch (status) {
      case 'waiting':
        return theme.palette.info.main;
      case 'starting':
        return theme.palette.warning.main;
      case 'active':
        return theme.palette.success.main;
      case 'completed':
        return theme.palette.error.main;
      default:
        return theme.palette.text.primary;
    }
  };

  const getStatusLabel = () => {
    // Check if we're in practice mode
    const isPractice = !isDuel;
    
    switch (status) {
      case 'waiting':
        return isPractice ? 'Practice Session Ready' : 'Waiting to Start';
      case 'starting':
        return isPractice ? 'Starting Practice Session' : 'Starting Soon';
      case 'active':
        return isPractice ? 'Practice Time Remaining' : 'Duel Time Remaining';
      case 'completed':
        return isPractice ? 'Practice Session Complete' : 'Duel Completed';
      default:
        return 'Unknown Status';
    }
  };

  // Helper function to calculate time until start
  const calculateTimeUntilStart = (duel) => {
    if (!duel || !duel.scheduledStartTime) return 0;
    
    const now = new Date();
    const startTime = new Date(duel.scheduledStartTime);
    
    const diffSeconds = Math.floor((startTime - now) / 1000);
    return Math.max(0, diffSeconds);
  };

  // Helper function to calculate remaining time
  const calculateRemainingTime = (duel) => {
    if (!duel) return 0;
    
    const now = new Date();
    let completionTime;
    
    console.log("Calculating time for duel/practice:", { 
      isPractice: !isDuel,
      status: duel.status, 
      startTime: duel.startTime, 
      scheduledStartTime: duel.scheduledStartTime,
      durationMinutes: duel.duelDurationMinutes
    });
    
    if (duel.startTime) {
      // If duel has started, use actual start time + duration
      const startTime = new Date(duel.startTime);
      const durationMs = (duel.duelDurationMinutes || 60) * 60 * 1000;
      completionTime = new Date(startTime.getTime() + durationMs);
      console.log("Using startTime to calculate: completionTime =", completionTime);
    } else if (duel.scheduledStartTime && duel.status === 'active') {
      // If duel should be active but startTime missing, use scheduled time
      const startTime = new Date(duel.scheduledStartTime);
      const durationMs = (duel.duelDurationMinutes || 60) * 60 * 1000;
      completionTime = new Date(startTime.getTime() + durationMs);
      console.log("Using scheduledStartTime to calculate: completionTime =", completionTime);
    } else if (duel.status === 'active') {
      // Fallback: If active but no time info, use current time + standard duration
      console.log("No timing info available, using current time + 60min as fallback");
      const durationMs = (duel.duelDurationMinutes || 60) * 60 * 1000;
      completionTime = new Date(now.getTime() + durationMs);
    } else {
      // No valid time reference
      console.log("No valid time reference found");
      return 0;
    }
    
    const diffSeconds = Math.floor((completionTime - now) / 1000);
    console.log("Time difference in seconds:", diffSeconds);
    return Math.max(0, diffSeconds);
  };

  // Update status based on duel data
  const updateStatusFromDuel = (duel) => {
    if (!duel) {
      console.log("updateStatusFromDuel called without duel object");
      return;
    }
    
    console.log("Updating status from duel/practice data:", {
      isPractice: !isDuel,
      currentStatus: duel.status,
      startTime: duel.startTime,
      durationMinutes: duel.duelDurationMinutes
    });
    
    const now = new Date();
    const currentStatus = duel.status || 'waiting';
    
    // Calculate duel completion time
    let startTime = null;
    if (duel.startTime) {
      startTime = new Date(duel.startTime);
      console.log("Using actual startTime:", startTime);
    }
    
    let scheduledStartTime = null;
    if (duel.scheduledStartTime) {
      scheduledStartTime = new Date(duel.scheduledStartTime);
      console.log("Using scheduledStartTime:", scheduledStartTime);
    }
    
    const durationMinutes = duel.duelDurationMinutes || 60;
    console.log("Duration minutes:", durationMinutes);
    
    // Practice mode always starts immediately with startTime set
    const isPracticeMode = !isDuel;
    
    // Check if the duel/practice should be completed
    if (startTime && currentStatus === 'active') {
      const completionTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
      console.log("Calculated completion time:", completionTime);
      
      if (now >= completionTime) {
        console.log(`${isPracticeMode ? "Practice" : "Duel"} should be completed based on time`);
        // Should be completed
        setStatus('completed');
        setTimeDisplay('00:00:00');
        if (onStatusChange) {
          onStatusChange('completed', { remainingTime: 0 });
        }
        return;
      }
    }
    
    // Check if waiting duel should be active
    if (currentStatus === 'waiting' && scheduledStartTime && now >= scheduledStartTime) {
      console.log("Waiting duel should now be active");
      setStatus('active');
      if (onStatusChange) {
        onStatusChange('active', { remainingTime: durationMinutes * 60 });
      }
    } else if (isPracticeMode && currentStatus === 'active') {
      // For practice mode, make sure status is active
      console.log("Practice mode is active");
      setStatus('active');
    } else {
      // Update current status
      console.log(`Setting status to: ${currentStatus}`);
      setStatus(currentStatus);
    }
    
    // If active but no startTime, create estimated startTime for calculation
    if (currentStatus === 'active' && !duel.startTime) {
      console.log("Active session with no startTime - creating estimated value");
      // This will help with time calculation
      const estimatedStartTime = new Date(now.getTime() - (5 * 60 * 1000)); // Assume started 5 min ago
      duel.startTime = estimatedStartTime.toISOString();
    }
  };

  // Update the timer display based on current status and duel info
  const updateTimerDisplay = (duel) => {
    if (!duel) {
      console.log("updateTimerDisplay called without duel object");
      return;
    }
    
    // Debug info to console
    console.log("Timer Debug Info:", {
      status,
      duelId,
      duelObject: duel,
      startTime: duel.startTime,
      scheduledStartTime: duel.scheduledStartTime,
      duelDurationMinutes: duel.duelDurationMinutes,
      currentTime: new Date().toISOString()
    });
    
    let timeValue = 0;
    let currentStatus = status || duel.status || 'waiting';
    
    switch (currentStatus) {
      case 'waiting':
        timeValue = calculateTimeUntilStart(duel);
        console.log("Waiting state, time until start:", timeValue);
        break;
      case 'starting':
        // Keep countdown value from the server
        timeValue = countdown || 10; // Default to 10 seconds if not provided
        console.log("Starting state, countdown:", timeValue);
        break;
      case 'active':
        timeValue = calculateRemainingTime(duel);
        console.log("Active state, remaining time:", timeValue);
        
        // Check if time is up
        if (timeValue <= 0) {
          console.log("Time is up, changing status to completed");
          setStatus('completed');
          if (onStatusChange) {
            onStatusChange('completed', { remainingTime: 0 });
          }
        }
        break;
      case 'completed':
        timeValue = 0;
        console.log("Completed state, time set to 0");
        break;
      default:
        timeValue = 0;
        console.log("Unknown status, defaulting time to 0");
    }
    
    const formattedTime = formatTime(timeValue);
    console.log(`Setting time display to: ${formattedTime} (${timeValue} seconds)`);
    setTimeDisplay(formattedTime);
  };

  // Create a test duel object if we're not getting proper duel data
  useEffect(() => {
    if (isDuel && duelId && !duel) {
      console.log("No duel data provided, creating test duel");
      
      // This is just for testing - should be removed in production
      const testDuel = {
        duelId: duelId,
        status: 'active',
        startTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // Started 10 min ago
        duelDurationMinutes: 60,
        handles: ["TestUser1", "TestUser2"]
      };
      
      // Use the test duel for display
      updateStatusFromDuel(testDuel);
      updateTimerDisplay(testDuel);
    }
  }, [isDuel, duelId, duel]);
  
  return (
    <Box sx={{ 
      textAlign: 'center', 
      width: '100%'
    }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
        <TimerIcon sx={{ fontSize: 40, color: getTimerColor() }} />
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: '700', 
            fontFamily: 'monospace',
            color: getTimerColor(),
            textAlign: 'center'
          }}
        >
          {timeDisplay}
        </Typography>
      </Box>
      
      <Typography variant="h6" sx={{ mb: 2, color: getTimerColor() }}>
        {getStatusLabel()}
      </Typography>
      
      {message && (
        <Typography variant="body1" sx={{ mb: 2, color: theme.palette.text.secondary }}>
          {message}
        </Typography>
      )}
      
      {status === 'starting' && countdown > 0 && (
        <Box sx={{
          p: 2,
          backgroundColor: theme.palette.warning.light,
          color: theme.palette.warning.contrastText,
          borderRadius: 1,
          mb: 2
        }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Starting in {countdown} seconds...
          </Typography>
        </Box>
      )}
      
      {!isDuel && (
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
          <Button
            variant="contained"
            disabled={true}
            sx={{ minWidth: 120 }}
          >
            Practice Mode
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Timer;
