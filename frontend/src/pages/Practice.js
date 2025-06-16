// filepath: e:\CodingSphere3\frontend\src\pages\Practice.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  InputAdornment,
  CircularProgress,
  useTheme,
  IconButton,
  Paper,
  Chip,
  Link as MuiLink,
  Divider,
} from '@mui/material';
import { 
  Code as CodeIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  FormatListNumbered as FormatListNumberedIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';
import ApiService from '../services/ApiService';

const Practice = () => {
  const theme = useTheme();
  const navigate = useNavigate();
    // Form state
  const [handle, setHandle] = useState(localStorage.getItem('userHandle') || '');
  const [minRating, setMinRating] = useState(800);
  const [maxRating, setMaxRating] = useState(1600);
  const [problemCount, setProblemCount] = useState(3);
  // Additional state for smart rating feature
  const [userRating, setUserRating] = useState(0);
  const [userPerformance, setUserPerformance] = useState(5);
  const [isSmartRatingEnabled, setIsSmartRatingEnabled] = useState(false);
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isValid, setIsValid] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  // Automatically validate handle from localStorage on component mount
  useEffect(() => {
    const savedHandle = localStorage.getItem('userHandle');
    if (savedHandle && savedHandle.trim() !== '') {
      // Validate the handle automatically
      validateHandle(savedHandle);
    }
    // We're deliberately not including validateHandle in the dependency array
    // because we only want this to run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to validate handle
  const validateHandle = async (handleToValidate) => {
    if (!handleToValidate.trim()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    setIsValid(null);
    setSubmitted(true);

    try {
      // Verify the handle
      const response = await ApiService.verifyCodeforcesHandle(handleToValidate);
      console.log(response);
      setIsValid(response.valid);
      
      if (response.valid) {
        setSuccess(`Handle "${handleToValidate}" is valid!`);
        // Fetch user rating and performance when handle is valid
        fetchUserRatingAndPerformance(handleToValidate);
      } else {
        setError(`Handle "${handleToValidate}" is not a valid Codeforces handle.`);
      }
    } catch (error) {
      console.error('Error verifying handle:', error);
      setError('Failed to verify handle. Please try again later.');
      setIsValid(false);
    } finally {
      setLoading(false);
    }  };

  // Function to fetch user rating and performance
  const fetchUserRatingAndPerformance = async (validHandle) => {
    try {
      // Get Codeforces user info
      const ratingResponse = await ApiService.getCodeforcesUserInfo(validHandle);
      
      if (ratingResponse.success && ratingResponse.rating) {
        setUserRating(ratingResponse.rating);
        console.log('User rating fetched:', ratingResponse.rating);
      }
      
      // Get user performance from backend
      let performance = 5; // Default value
      try {
        const performanceResponse = await ApiService.getUserPerformance();
        
        if (performanceResponse.success) {
          performance = performanceResponse.performance;
          setUserPerformance(performance);
          console.log('User performance fetched:', performance);
        }
      } catch (perfError) {
        console.error('Error fetching user performance:', perfError);
        // Default to 5 if there's an error
        setUserPerformance(5);
      }      // Enable smart rating by default if we have a valid rating
      if (ratingResponse.rating > 0) {
        console.log('FETCH - Got valid rating:', ratingResponse.rating, 'enabling smart rating');
        setIsSmartRatingEnabled(true);
        
        // Apply the smart rating calculation immediately
        console.log('FETCH - About to call updateRatingRange with rating:', ratingResponse.rating, 'performance:', performance);
        updateRatingRange(ratingResponse.rating, performance);
        
        // Add a timeout to check if state was updated
        setTimeout(() => {
          console.log('FETCH - After updateRatingRange, current state values - min:', minRating, 'max:', maxRating);
        }, 100);
      }
      
    } catch (error) {
      console.error('Error fetching user rating:', error);
      // Don't enable smart rating if there was an error
      setIsSmartRatingEnabled(false);
    }
  };
    // Function to calculate and update rating range based on user's rating and performance
  const updateRatingRange = (rating, performance) => {
    // Round the rating to the nearest 100
    const currentRating = Math.round(rating / 100) * 100;
    
    // Adjust rating based on performance
    const adjustedRating = currentRating + (performance - 5) * 100;
    
    // Ensure rating stays within valid range
    const newMinRating = Math.max(800, Math.min(2500, adjustedRating));
    const newMaxRating = Math.min(2500, newMinRating + 200);
    
    console.log('Smart rating calculated:', { 
      originalRating: rating, 
      currentRating,
      performance,
      adjustedRating, 
      minRating: newMinRating, 
      maxRating: newMaxRating
    });
    
    // Display values right before setting state
    console.log('BEFORE STATE UPDATE - Current min rating:', minRating, 'Current max rating:', maxRating);
    console.log('BEFORE STATE UPDATE - Setting to min:', newMinRating, 'max:', newMaxRating);
    
    // Update rating range state
    setMinRating(newMinRating);
    setMaxRating(newMaxRating);
  };  // Function to toggle smart rating
  const toggleSmartRating = () => {
    const newState = !isSmartRatingEnabled;
    console.log('TOGGLE - Smart rating changing from', isSmartRatingEnabled, 'to', newState);
    setIsSmartRatingEnabled(newState);
    
    if (newState) {
      // If enabling smart rating, update the rating range if we have the data
      if (userRating > 0) {
        console.log('TOGGLE - Enabling smart rating with rating:', userRating, 'performance:', userPerformance);
        updateRatingRange(userRating, userPerformance);
        
        // Add a timeout to check state after update
        setTimeout(() => {
          console.log('TOGGLE - State after enabling smart rating - min:', minRating, 'max:', maxRating);
        }, 100);
      } else {
        console.log('Smart rating enabled but no user rating available');
        
        // If we don't have the rating data yet, fetch it
        if (isValid && handle) {
          fetchUserRatingAndPerformance(handle);
        }
      }
    } else {
      // If disabling smart rating, reset to default values
      console.log('TOGGLE - Disabling smart rating, resetting to default values 800-1600');
      setMinRating(800);
      setMaxRating(1600);
      
      // Add a timeout to check state after update
      setTimeout(() => {
        console.log('TOGGLE - State after disabling smart rating - min:', minRating, 'max:', maxRating);
      }, 100);
      
      console.log('Smart rating disabled, reset to default range');
    }
  };

  // Handle input changes with validation
  const handleMinRatingChange = (value) => {
    const newValue = Number(value);
    if (!isNaN(newValue) && newValue >= 800 && newValue <= 3000) {
      setMinRating(newValue);
      if (newValue > maxRating) {
        setMaxRating(newValue);
      }
    }
  };

  const handleMaxRatingChange = (value) => {
    const newValue = Number(value);
    if (!isNaN(newValue) && newValue >= 800 && newValue <= 3000) {
      setMaxRating(newValue);
      if (newValue < minRating) {
        setMinRating(newValue);
      }
    }
  };

  const handleProblemCountChange = (value) => {
    const newValue = Number(value);
    if (!isNaN(newValue) && newValue >= 1 && newValue <= 10) {
      setProblemCount(newValue);
    }
  };

  const incrementRating = (setter, value) => {
    const newValue = value + 100;
    if (newValue <= 3000) {
      setter(newValue);
    }
  };

  const decrementRating = (setter, value) => {
    const newValue = value - 100;
    if (newValue >= 800) {
      setter(newValue);
    }
  };

  // Handle form submission for verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!handle.trim()) {
      setError('Please enter a Codeforces handle');
      return;
    }
    
    // Use the validateHandle function    await validateHandle(handle);
  };
  
  // Handle finding random problems and redirecting to the Play page
  const handleFindProblems = () => {
    if (!isValid) {
      setError('Please verify your Codeforces handle first.');
      return;
    }
    
    // Save the valid handle to localStorage for future use
    localStorage.setItem('userHandle', handle);
      // Calculate the final rating values to use
    // Important: Make copies of state values to avoid synchronization issues
    let finalMinRating = minRating;
    let finalMaxRating = maxRating;
    
    console.log('BEFORE CALCULATION - Current state values:', {
      minRating,
      maxRating,
      userRating,
      userPerformance,
      isSmartRatingEnabled
    });
    
    // If smart rating is enabled, recalculate the values directly
    if (isSmartRatingEnabled && userRating > 0) {
      // Round the rating to the nearest 100
      const currentRating = Math.round(userRating / 100) * 100;
      
      // Adjust rating based on performance
      const adjustedRating = currentRating + (userPerformance - 5) * 100;
      
      // Ensure rating stays within valid range
      finalMinRating = Math.max(800, Math.min(2500, adjustedRating));
      finalMaxRating = Math.min(2500, finalMinRating + 200);
      
      console.log('Using smart rating values:', {
        originalRating: userRating,
        performance: userPerformance,
        minRating: finalMinRating,
        maxRating: finalMaxRating
      });
    } else {      console.log('Using manual rating values:', {
        minRating: finalMinRating,
        maxRating: finalMaxRating
      });
    }
      // Log the final values just before navigation
    console.log('NAVIGATION - Final values being passed to Play page:', {
      handle,
      minRating: finalMinRating,
      maxRating: finalMaxRating,
      problemCount,
      userPerformance
    });
    
    // Navigate to Play page with filter data and performance tracking
    navigate('/play', { 
      state: { 
        handles: [handle], // Pass as array for future extensibility
        minRating: finalMinRating,
        maxRating: finalMaxRating,
        count: problemCount,
        trackPerformance: true, // Flag to indicate we should update performance after session
        startPerformance: userPerformance // Initial performance value
      }
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Codeforces Practice
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
          Verify your Codeforces handle and get personalized problem recommendations
        </Typography>      </Box>
      <Grid container spacing={4} sx={{ maxWidth: '1080px', mx: 'auto' }}>
        {/* Form Card */}
        <Grid item xs={12} md={10} sx={{ mx: 'auto' }}>
          <Card 
            elevation={3} 
            sx={{ 
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: theme.palette.primary.main, 
                color: 'white'
              }}
            >
              <Typography variant="h6">
                Problem Finder
              </Typography>
            </Box>
              <CardContent sx={{ p: 4, flexGrow: 1 }}>
              {/* Two-column layout with verification on the left and filters on the right */}
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                {/* Left Column: Handle Verification */}                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    flex: '1', 
                    gap: 3,
                    pr: 2,
                    borderRight: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Box 
                    component="form" 
                    onSubmit={handleSubmit} 
                    sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '90%' }}
                  >
                    {/* Codeforces Handle */}
                    <TextField
                      label="Codeforces Handle"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      fullWidth
                      required
                      variant="outlined"
                      helperText="Enter your Codeforces handle to verify"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CodeIcon color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: isValid !== null && (
                          <InputAdornment position="end">
                            {isValid ? 
                              <CheckIcon color="success" /> : 
                              <CloseIcon color="error" />
                            }
                          </InputAdornment>
                        )
                      }}
                      color={isValid === true ? "success" : isValid === false ? "error" : "primary"}
                    />

                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary" 
                      size="large"
                      fullWidth
                      disabled={loading || !handle.trim()}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                    >
                      {loading ? 'Verifying...' : 'Verify Handle'}
                    </Button>
                  </Box>

                  {/* Error and Success Messages */}
                  <Box>
                    {error && (
                      <Alert severity="error" sx={{ width: '100%', mb: error && success ? 2 : 0 }}>
                        {error}
                      </Alert>
                    )}
                    
                    {success && (
                      <Alert severity="success" sx={{ width: '100%' }}>
                        {success}
                      </Alert>
                    )}
                  </Box>
                </Box>

                {/* Right Column: Problem Filters - Always visible but disabled until verified */}                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    flex: '1',
                    gap: 2,
                    pl: 3,
                    opacity: isValid ? 1 : 0.6,
                    pointerEvents: isValid ? 'auto' : 'none',
                    position: 'relative'
                  }}
                >                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      inset: 0, 
                      zIndex: isValid ? -1 : 1,
                      display: isValid ? 'none' : 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(2px)',
                      borderRadius: 1
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      color="text.secondary" 
                      fontWeight="bold" 
                      sx={{ 
                        bgcolor: 'background.paper', 
                        py: 1, 
                        px: 2, 
                        borderRadius: 1,
                        boxShadow: 1
                      }}
                    >
                      Verify handle to enable filters
                    </Typography>
                  </Box>
                    <Typography 
                    variant="subtitle1" 
                    fontWeight="bold" 
                    sx={{ 
                      pb: 1, 
                      mb: 2, 
                      borderBottom: '2px solid',
                      borderColor: theme.palette.secondary.main
                    }}
                  >
                    Problem Filters
                  </Typography>
                    {/* Rating Range */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography 
                      variant="subtitle2" 
                      gutterBottom 
                      sx={{ color: theme.palette.text.primary, fontWeight: 'medium' }}
                    >
                      Problem Rating Range
                    </Typography>
                    
                    {/* Smart Rating Toggle */}
                    {userRating > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color={isSmartRatingEnabled ? "secondary" : "text.secondary"}>
                          Smart Rating
                        </Typography>                        <Chip
                          label={isSmartRatingEnabled ? "On" : "Off"}
                          color={isSmartRatingEnabled ? "secondary" : "default"}
                          size="small"
                          onClick={toggleSmartRating}
                          clickable
                        />
                      </Box>
                    )}
                  </Box>
                  
                  {/* Smart Rating Info - only show when enabled */}
                  {isSmartRatingEnabled && userRating > 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="caption">
                        Based on your CF rating ({userRating}) and performance level ({userPerformance}/10)
                      </Typography>
                    </Alert>
                  )}                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Min Rating"
                      value={minRating}
                      onChange={(e) => handleMinRatingChange(e.target.value)}
                      type="number"
                      disabled={!isValid}
                      InputProps={{
                        inputProps: { min: 800, max: 3000, step: 100 },
                        endAdornment: (
                          <InputAdornment position="end">
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <IconButton
                                size="small"
                                onClick={() => incrementRating(setMinRating, minRating)}
                                edge="end"
                                sx={{ p: 0.5 }}
                                disabled={!isValid}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => decrementRating(setMinRating, minRating)}
                                edge="end"
                                sx={{ p: 0.5 }}
                                disabled={!isValid}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Max Rating"
                      value={maxRating}
                      onChange={(e) => handleMaxRatingChange(e.target.value)}
                      type="number"
                      disabled={!isValid}
                      InputProps={{
                        inputProps: { min: 800, max: 3000, step: 100 },
                        endAdornment: (
                          <InputAdornment position="end">
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <IconButton
                                size="small"
                                onClick={() => incrementRating(setMaxRating, maxRating)}
                                edge="end"
                                sx={{ p: 0.5 }}
                                disabled={!isValid}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => decrementRating(setMaxRating, maxRating)}
                                edge="end"
                                sx={{ p: 0.5 }}
                                disabled={!isValid}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ flex: 1 }}
                    />
                  </Box>

                  {/* Problem Count */}
                  <TextField
                    label="Number of Problems"
                    value={problemCount}
                    onChange={(e) => handleProblemCountChange(e.target.value)}
                    type="number"
                    disabled={!isValid}
                    InputProps={{
                      inputProps: { min: 1, max: 10 },
                      endAdornment: (
                        <InputAdornment position="end">
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                if (problemCount < 10) setProblemCount(problemCount + 1);
                              }}
                              edge="end"
                              sx={{ p: 0.5 }}
                              disabled={!isValid}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                if (problemCount > 1) setProblemCount(problemCount - 1);
                              }}
                              edge="end"
                              sx={{ p: 0.5 }}
                              disabled={!isValid}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </InputAdornment>
                      ),
                    }}
                    helperText="Number of problems to find (1-10)"
                  />                  <Button 
                    onClick={handleFindProblems}
                    variant="contained" 
                    color="secondary" 
                    size="large"
                    fullWidth
                    disabled={!isValid}
                    startIcon={<FormatListNumberedIcon />}
                    sx={{ mt: 2 }}
                  >
                    Find Random Problems
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Practice;
