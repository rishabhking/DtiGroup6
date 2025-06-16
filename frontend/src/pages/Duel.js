import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Grid,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  CircularProgress,
  Paper,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Alert,
  Snackbar,
  MenuItem,
  Select,  
  FormControl,
  InputLabel,
  Stack,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  SportsEsports as DuelIcon,
  Add as AddIcon, 
  Refresh as RefreshIcon,
  Person as PersonIcon,
  EmojiEvents as TrophyIcon,
  AccessTime as TimeIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  LinkOff as LinkOffIcon,
  PlayArrow as PlayIcon,
  Delete as DeleteIcon,
  AddTask as AddProblemIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import { useTheme } from '@mui/material/styles';
import moment from 'moment';

// Define API_URL 
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const Duel = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State for tab management
  const [tabValue, setTabValue] = useState(0);
  const [duels, setDuels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State for dialog management
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openAddProblemDialog, setOpenAddProblemDialog] = useState(false);
  const [selectedDuel, setSelectedDuel] = useState(null);
  
  // Form states
  const [handle, setHandle] = useState(localStorage.getItem('userHandle') || '');
  const [duelName, setDuelName] = useState('');
  const [duelId, setDuelId] = useState('');
  const [numProblems, setNumProblems] = useState(3);
  const [minRating, setMinRating] = useState(800);
  const [maxRating, setMaxRating] = useState(2500);
  const [waitingForStart, setWaitingForStart] = useState(false);
  
  // New timing states for time-based duels
  const [scheduledStartTime, setScheduledStartTime] = useState('');
  const [duelDurationMinutes, setDuelDurationMinutes] = useState(60);
  const [isPrivate, setIsPrivate] = useState(false);
  
  // Problem states
  const [contestId, setContestId] = useState('');
  const [problemIndex, setProblemIndex] = useState('');
  const [problemName, setProblemName] = useState('');
  const [problemRating, setProblemRating] = useState('');
  
  // Alert states
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Get duels based on current tab
  useEffect(() => {
    fetchDuels();
  }, [tabValue]);  // Fetch duels based on tab value
  
  const fetchDuels = async () => {
    setIsLoading(true);
    setError('');
    try {
      let response;
      const userHandle = localStorage.getItem('userHandle');
      
      switch (tabValue) {
        case 0: // My Waiting duels - show all waiting duels where user is a participant
          if (userHandle) {
            response = await ApiService.getDuelsByUserHandle(userHandle, 'waiting');
          } else {
            response = { duels: [] };
          }
          break;
        case 1: // Public Waiting duels - show only public waiting duels
          response = await ApiService.getDuelsByStatus('waiting');
          if (response.duels) {
            // Filter to show only public (non-private) duels
            response.duels = response.duels.filter(duel => !duel.isPrivate);
          }
          break;
        case 2: // My Active duels - show only active duels where user is a participant
          if (userHandle) {
            response = await ApiService.getDuelsByUserHandle(userHandle, 'active');
          } else {
            response = { duels: [] };
          }
          break;
        case 3: // My Completed duels - show all completed duels where user was a participant
          if (userHandle) {
            response = await ApiService.getDuelsByUserHandle(userHandle, 'completed');
          } else {
            response = { duels: [] };
          }
          break;
        case 4: // My Cancelled duels - show all cancelled duels where user was a participant
          if (userHandle) {
            response = await ApiService.getDuelsByUserHandle(userHandle, 'cancelled');
          } else {
            response = { duels: [] };
          }
          break;
        default:
          response = await ApiService.getAllDuels();
          if (response.duels) {            // For default view, show only public duels
            response.duels = response.duels.filter(duel => !duel.isPrivate);
          }
      }
      
      // Check and update duel statuses before setting them
      const updatedDuels = await checkAndUpdateDuelStatuses(response.duels || []);
      setDuels(updatedDuels);
    } catch (error) {
      console.error('Error fetching duels:', error);
      setError('Failed to fetch duels. Please try again later.');
      showAlert('Failed to fetch duels. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to show alert
  const showAlert = (message, severity = 'info') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Dialog handlers
  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };
  
  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setDuelName('');
    setScheduledStartTime('');
    setDuelDurationMinutes(60);
    setIsPrivate(false);
  };
  
  const handleOpenJoinDialog = () => {
    setOpenJoinDialog(true);
  };
  
  const handleCloseJoinDialog = () => {
    setOpenJoinDialog(false);
    setDuelId('');
  };
  
  const handleOpenDetailsDialog = (duel) => {
    setSelectedDuel(duel);
    setOpenDetailsDialog(true);
  };
  
  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedDuel(null);
  };
  
  // Add Problem Dialog handlers
  const handleOpenAddProblemDialog = (duel) => {
    setSelectedDuel(duel);
    setOpenAddProblemDialog(true);
    resetProblemForm();
  };
  
  const handleCloseAddProblemDialog = () => {
    setOpenAddProblemDialog(false);
    resetProblemForm();
  };
  
  // Reset problem form fields
  const resetProblemForm = () => {
    setContestId('');
    setProblemIndex('');
    setProblemName('');
    setProblemRating('');
  };
  
  // Create a new duel
  const handleCreateDuel = async () => {
    if (!handle || !duelName) {
      showAlert('Please provide both a handle and duel name.', 'warning');
      return;
    }
    
    // Validate scheduled start time (now required)
    if (!scheduledStartTime) {
      showAlert('Please provide a scheduled start time.', 'warning');
      return;
    }
    
    const startTime = new Date(scheduledStartTime);
    const now = new Date();
    
    if (isNaN(startTime.getTime())) {
      showAlert('Please provide a valid start time.', 'warning');
      return;
    }
    
    if (startTime <= now) {
      showAlert('Start time must be in the future.', 'warning');
      return;
    }
    
    setIsLoading(true);
    try {
      const duelData = {
        name: duelName,
        handles: [handle],
        creatorHandle: handle,
        numProblems,
        minRating,
        maxRating,
        status: 'waiting', // Set the initial status to waiting
        scheduledStartTime: scheduledStartTime // Now required
      };
      
      if (duelDurationMinutes && duelDurationMinutes !== 60) {
        duelData.duelDurationMinutes = duelDurationMinutes;
      }
      
      // Set privacy based on isPrivate state
      duelData.isPrivate = isPrivate;
      
      const response = await ApiService.createDuel(duelData);
      if (response.success) {
        showAlert('Duel created successfully!', 'success');
        localStorage.setItem('userHandle', handle);
        handleCloseCreateDialog();
        fetchDuels();
      } else {
        showAlert('Failed to create duel.', 'error');
      }
    } catch (error) {
      console.error('Error creating duel:', error);
      showAlert('Error creating duel: ' + (error.response?.data?.error || error.message), 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Join an existing duel
  const handleJoinDuel = async () => {
    if (!handle || !duelId) {
      showAlert('Please provide both a handle and duel ID.', 'warning');
      return;
    }
    
    setIsLoading(true);
    try {
      // First check if the duel exists and what its status is
      const duelResponse = await ApiService.getDuelById(duelId);
      
      if (!duelResponse.success || !duelResponse.duel) {
        showAlert('Duel not found. Please check the ID.', 'error');
        setIsLoading(false);
        return;
      }
      
      const duel = duelResponse.duel;
      
      // If duel is active, redirect directly to the play page
      if (duel.status === 'active') {
        localStorage.setItem('userHandle', handle);
        // First join the duel
        await ApiService.joinDuel(duelId, handle);
        // Then redirect to the play page
        navigate(`/play/${duelId}`);
        handleCloseJoinDialog();
        return;
      } else if (duel.status === 'waiting') {
        // If waiting, join and show waiting message
        const response = await ApiService.joinDuel(duelId, handle);
        if (response.success) {
          localStorage.setItem('userHandle', handle);
          handleCloseJoinDialog();
          setSelectedDuel(duel);
          setWaitingForStart(true);
          showAlert('Successfully joined the duel! Waiting for the host to start.', 'success');
          fetchDuels();
        } else {
          showAlert('Failed to join duel.', 'error');
        }
      } else {
        // Completed or cancelled
        showAlert(`Cannot join this duel as it is ${duel.status}.`, 'warning');
      }
    } catch (error) {
      console.error('Error joining duel:', error);
      showAlert('Error joining duel: ' + (error.response?.data?.error || error.message), 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add problem to duel
  const handleAddProblem = async () => {
    if (!contestId || !problemIndex) {
      showAlert('Contest ID and Problem Index are required.', 'warning');
      return;
    }
    
    setIsLoading(true);
    try {
      // Prepare problem object
      const problem = {
        contestId: parseInt(contestId),
        index: problemIndex.toUpperCase(),
        name: problemName || null,
        rating: problemRating ? parseInt(problemRating) : null
      };
      
      // Call API to add problem
      const response = await axios.put(`${API_URL}/duels/${selectedDuel.duelId}/add-problems`, {
        problems: [problem]
      });
      
      if (response.data.success) {
        showAlert('Problem added successfully!', 'success');
        handleCloseAddProblemDialog();
        // Refresh duel details
        const updatedDuel = await ApiService.getDuelById(selectedDuel.duelId);
        setSelectedDuel(updatedDuel.duel);
        fetchDuels();
      } else {
        showAlert('Failed to add problem.', 'error');
      }
    } catch (error) {
      console.error('Error adding problem:', error);
      showAlert('Error adding problem: ' + (error.response?.data?.error || error.message), 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Start a duel (change status from waiting to active)
  const handleStartDuel = async (duelId) => {
    setIsLoading(true);
    try {
      // Use the dedicated start duel endpoint
      const response = await ApiService.startDuel(duelId, handle);
      
      if (response.success) {
        showAlert('Duel started successfully!', 'success');
        // Navigate to the play page
        navigate(`/play/${duelId}`);
      } else {
        showAlert('Failed to start duel.', 'error');
      }
    } catch (error) {
      console.error('Error starting duel:', error);
      showAlert('Error starting duel: ' + (error.response?.data?.error || error.message), 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle play button click
  const handlePlayDuel = (duelId) => {
    navigate(`/play/${duelId}`);
  };
  
  // Helper to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return theme.palette.success.main;
      case 'completed':
        return theme.palette.info.main;
      case 'cancelled':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };
  
  // Helper to format date
  const formatDate = (dateString) => {
    return moment(dateString).format('MMM D, YYYY h:mm A');
  };
  
  // Helper to calculate duration
  const getDuelDuration = (duel) => {
    // Show planned duration from duelDurationMinutes (preferred)
    if (duel.duelDurationMinutes) {
      const hours = Math.floor(duel.duelDurationMinutes / 60);
      const minutes = duel.duelDurationMinutes % 60;
      
      if (hours > 0) {
        return minutes > 0 ? hours + 'h ' + minutes + 'm' : hours + 'h';
      } else {
        return minutes + 'm';
      }
    }
    
    // Fallback: show default duration
    return '60m';
  };

  // Get highest scored handle in a duel
  const getLeadingParticipant = (duel) => {
    if (!duel.scores || Object.keys(duel.scores).length === 0) {
      return { handle: 'No scores yet', score: 0 };
    }
    
    let highestScore = -1;
    let leadingHandle = '';
    
    Object.entries(duel.scores).forEach(([handle, score]) => {
      if (score > highestScore) {
        highestScore = score;
        leadingHandle = handle;
      }
    });
    
    return { handle: leadingHandle, score: highestScore };
  };
  
  // Helper functions for empty state messages
  const getEmptyStateTitle = () => {
    const userHandle = localStorage.getItem('userHandle');
    switch (tabValue) {
      case 0:
        return userHandle ? 'No waiting duels found' : 'Please set your handle first';
      case 1:
        return 'No public waiting duels found';
      case 2:
        return userHandle ? 'No active duels found' : 'Please set your handle first';
      case 3:
        return userHandle ? 'No completed duels found' : 'Please set your handle first';
      case 4:
        return userHandle ? 'No cancelled duels found' : 'Please set your handle first';
      default:
        return 'No duels found';
    }
  };

  const getEmptyStateMessage = () => {
    const userHandle = localStorage.getItem('userHandle');
    switch (tabValue) {
      case 0:
        return userHandle 
          ? 'You are not part of any waiting duels. Create a new duel or get invited to one!'
          : 'Set your Codeforces handle to see your duels.';
      case 1:
        return 'No public duels are currently waiting for participants. Create a new duel to get started!';
      case 2:
        return userHandle 
          ? 'You don\'t have any active duels right now. Join a duel to see it here!'
          : 'Set your Codeforces handle to see your active duels.';
      case 3:
        return userHandle 
          ? 'You haven\'t completed any duels yet. Participate in some duels to see them here!'
          : 'Set your Codeforces handle to see your completed duels.';
      case 4:
        return userHandle 
          ? 'You don\'t have any cancelled duels.'
          : 'Set your Codeforces handle to see your cancelled duels.';
      default:
        return 'Create a new duel or join an existing one to get started!';
    }
  };

  // Check and update duel statuses based on start/end times
  const checkAndUpdateDuelStatuses = async (duels) => {
    const now = new Date();
    const userHandle = localStorage.getItem('userHandle');
    const updatedDuels = [];
    let activeUserDuels = [];
    const statusUpdates = [];
    
    for (const duel of duels) {
      let updatedDuel = { ...duel };
      let statusChanged = false;
      
      // Calculate end time if we have start time and duration
      const startTime = duel.startTime ? new Date(duel.startTime) : 
                       duel.scheduledStartTime ? new Date(duel.scheduledStartTime) : null;
      const durationMinutes = duel.duelDurationMinutes || 60;
      const endTime = startTime ? 
                     new Date(startTime.getTime() + durationMinutes * 60 * 1000) : null;
      
      // Update status based on current time
      if (duel.status === 'waiting' && startTime && now >= startTime) {
        updatedDuel.status = 'active';
        updatedDuel.startTime = startTime;
        statusChanged = true;
      } else if (duel.status === 'active' && endTime && now >= endTime) {
        updatedDuel.status = 'completed';
        updatedDuel.endTime = endTime;
        statusChanged = true;
      }
      
      // Collect status updates to execute later
      if (statusChanged) {
        statusUpdates.push({
          duelId: duel.duelId,
          newStatus: updatedDuel.status,
          originalDuel: duel,
          updatedDuel: updatedDuel
        });
      }
      
      // Check if user is in an active duel
      if (updatedDuel.status === 'active' && userHandle && 
          updatedDuel.handles && updatedDuel.handles.includes(userHandle)) {
        activeUserDuels.push(updatedDuel);
      }
      
      updatedDuels.push(updatedDuel);
    }
    
    // Execute status updates sequentially
    for (const update of statusUpdates) {
      try {
        await ApiService.updateDuelStatus(update.duelId, update.newStatus);
      } catch (error) {
        console.error(`Failed to update duel ${update.duelId} status:`, error);
        const index = updatedDuels.findIndex(d => d.duelId === update.duelId);
        if (index !== -1) {
          updatedDuels[index] = update.originalDuel;
        }
      }
    }
    
    // Alert user about active duels they're participating in
    if (activeUserDuels.length > 0) {
      const duelNames = activeUserDuels.map(d => d.name).join(', ');
      const message = 'You have ' + activeUserDuels.length + ' active duel' + 
                     (activeUserDuels.length > 1 ? 's' : '') + ': ' + duelNames;
      showAlert(message, 'warning');
    }
    
    return updatedDuels;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Competitive Duels
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Challenge others to programming duels and improve your skills
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
        <Button 
          variant="contained" 
          color="secondary" 
          startIcon={<RefreshIcon />}
          onClick={fetchDuels}
        >
          Refresh
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Create Duel
        </Button>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={handleOpenJoinDialog}
        >
          Join Duel
        </Button>
      </Box>
      
      <Box sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>          
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="duel tabs">
            <Tab label="My Waiting Duels" />
            <Tab label="Public Waiting Duels" />
            <Tab label="My Active Duels" />
            <Tab label="My Completed Duels" />
            <Tab label="My Cancelled Duels" />
          </Tabs>
        </Box>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>        
        ) : duels.length === 0 ? (          
          <Paper sx={{ p: 4, mt: 2, textAlign: 'center' }}>
            <DuelIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              {getEmptyStateTitle()}
            </Typography>
            <Typography color="text.secondary">
              {getEmptyStateMessage()}
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table sx={{ minWidth: 650 }} aria-label="duels table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Players</TableCell>
                  <TableCell>Problems</TableCell>
                  <TableCell>Leader</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {duels.map((duel) => {
                  const leader = getLeadingParticipant(duel);
                  return (
                    <TableRow 
                      key={duel.duelId}
                      sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)', cursor: 'pointer' } }}
                      onClick={() => handleOpenDetailsDialog(duel)}
                    >
                      <TableCell component="th" scope="row">
                        <Tooltip title={duel.duelId}>
                          <Typography noWrap sx={{ maxWidth: 120 }}>
                            {duel.duelId}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {duel.name}
                          {duel.isPrivate && (
                            <Tooltip title="Private Duel">
                              <LinkOffIcon 
                                color="action" 
                                fontSize="small"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{duel.creatorHandle}</TableCell>
                      <TableCell>{duel.handles?.length || 0}</TableCell>
                      <TableCell>{duel.problems?.length || 0}</TableCell>
                      <TableCell>
                        {leader.handle !== 'No scores yet' ? (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <TrophyIcon color="primary" fontSize="small" />
                            <Typography variant="body2">{leader.handle}: {leader.score}</Typography>
                          </Stack>
                        ) : (
                          'No scores yet'
                        )}                      
                      </TableCell>
                      <TableCell>
                        {duel.startTime ? formatDate(duel.startTime) : 
                         duel.scheduledStartTime ? formatDate(duel.scheduledStartTime) : 
                         'Not scheduled'}
                      </TableCell>
                      <TableCell>{getDuelDuration(duel)}</TableCell><TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {duel.status === 'waiting' && handle === duel.creatorHandle && (
                            <Tooltip title="Start this duel">
                              <IconButton 
                                color="success" 
                                size="small" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartDuel(duel.duelId);
                                }}
                              >
                                <PlayIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {duel.status === 'active' && handle === duel.creatorHandle && (
                            <Tooltip title="Play this duel">
                              <IconButton 
                                color="primary" 
                                size="small" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayDuel(duel.duelId);
                                }}                              >
                                <DuelIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="View details">
                            <IconButton 
                              color="info" 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetailsDialog(duel);
                              }}                            >
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      
      {/* Create Duel Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog}>
        <DialogTitle>Create New Duel</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Create a new programming duel and invite others to compete.
          </DialogContentText>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                id="handle"
                label="Your Codeforces Handle"
                type="text"
                fullWidth
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="duelName"
                label="Duel Name"
                type="text"
                fullWidth
                value={duelName}
                onChange={(e) => setDuelName(e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                margin="dense"
                id="numProblems"
                label="Number of Problems"
                type="number"
                fullWidth
                value={numProblems}
                onChange={(e) => setNumProblems(parseInt(e.target.value))}
                inputProps={{ min: 1, max: 10 }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                margin="dense"
                id="minRating"
                label="Min Problem Rating"
                type="number"
                fullWidth
                value={minRating}
                onChange={(e) => setMinRating(parseInt(e.target.value))}
                inputProps={{ min: 800, max: 3500 }}
              />
            </Grid>            
            <Grid item xs={4}>
              <TextField
                margin="dense"
                id="maxRating"
                label="Max Problem Rating"
                type="number"
                fullWidth
                value={maxRating}
                onChange={(e) => setMaxRating(parseInt(e.target.value))}
                inputProps={{ min: 800, max: 3500 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="scheduledStartTime"
                label="Scheduled Start Time"
                type="datetime-local"
                fullWidth
                required
                value={scheduledStartTime}
                onChange={(e) => setScheduledStartTime(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                id="duelDuration"
                label="Duel Duration (minutes)"
                type="number"
                fullWidth
                value={duelDurationMinutes}
                onChange={(e) => setDuelDurationMinutes(parseInt(e.target.value))}
                inputProps={{ min: 5, max: 300 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                id="duelDurationDisplay"
                label="Duration"
                type="text"
                fullWidth
                disabled
                value={`${Math.floor(duelDurationMinutes / 60)}h ${duelDurationMinutes % 60}m`}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    color="primary"
                  />
                }
                label="Private Duel (only visible to participants)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateDuel} 
            variant="contained" 
            disabled={isLoading || !handle || !duelName}
          >
            {isLoading ? <CircularProgress size={24} /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Join Duel Dialog */}
      <Dialog open={openJoinDialog} onClose={handleCloseJoinDialog}>
        <DialogTitle>Join Existing Duel</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a duel ID to join an existing duel.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="handle"
            label="Your Codeforces Handle"
            type="text"
            fullWidth
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="duelId"
            label="Duel ID"
            type="text"
            fullWidth
            value={duelId}
            onChange={(e) => setDuelId(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseJoinDialog}>Cancel</Button>
          <Button 
            onClick={handleJoinDuel} 
            variant="contained"
            disabled={isLoading || !handle || !duelId}
          >
            {isLoading ? <CircularProgress size={24} /> : "Join"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Problem Dialog */}
      <Dialog open={openAddProblemDialog} onClose={handleCloseAddProblemDialog}>
        <DialogTitle>Add Problem to Duel</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Add a problem from CodeForces to this duel.
          </DialogContentText>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                autoFocus
                margin="dense"
                id="contestId"
                label="Contest ID"
                type="text"
                fullWidth
                value={contestId}
                onChange={(e) => setContestId(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                id="problemIndex"
                label="Problem Index (A, B, etc.)"
                type="text"
                fullWidth
                value={problemIndex}
                onChange={(e) => setProblemIndex(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                id="problemName"
                label="Problem Name (optional)"
                type="text"
                fullWidth
                value={problemName}
                onChange={(e) => setProblemName(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                id="problemRating"
                label="Problem Rating (optional)"
                type="text"
                fullWidth
                value={problemRating}
                onChange={(e) => setProblemRating(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddProblemDialog}>Cancel</Button>
          <Button 
            onClick={handleAddProblem} 
            variant="contained"
            disabled={isLoading || !contestId || !problemIndex}
          >
            {isLoading ? <CircularProgress size={24} /> : "Add Problem"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Waiting for Start Dialog */}
      <Dialog 
        open={waitingForStart} 
        onClose={() => setWaitingForStart(false)}
        aria-labelledby="waiting-dialog-title"
        aria-describedby="waiting-dialog-description"
      >
        <DialogTitle id="waiting-dialog-title">Waiting for Duel to Start</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography id="waiting-dialog-description" variant="body1" gutterBottom>
              You've successfully joined the duel!
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              The duel creator needs to start the duel for you to proceed.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              You'll be automatically redirected once the duel begins.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            variant="contained" 
            color="primary"
            onClick={async () => {
              const response = await ApiService.getDuelById(selectedDuel.duelId);
              
              if (response.success && response.duel) {
                if (response.duel.status === 'active') {
                  setWaitingForStart(false);
                  navigate(`/play/${selectedDuel.duelId}`);
                } else if (response.duel.status === 'waiting') {
                  showAlert('The duel is still waiting to start.', 'info');
                } else {
                  showAlert(`The duel status has changed to ${response.duel.status}.`, 'warning');
                  setWaitingForStart(false);
                  fetchDuels();
                }
              }
            }}
            startIcon={<RefreshIcon />}
          >
            Check Status
          </Button>
          <Button onClick={() => setWaitingForStart(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Duel Details Dialog */}
      {selectedDuel && (
        <Dialog 
          open={openDetailsDialog} 
          onClose={handleCloseDetailsDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Duel Details - {selectedDuel.name}
            <Chip 
              label={selectedDuel.status} 
              color="primary" 
              size="small" 
              sx={{ 
                ml: 1, 
                backgroundColor: getStatusColor(selectedDuel.status),
                color: '#fff'
              }} 
            />
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Duel Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="ID" 
                        secondary={selectedDuel.duelId} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Created By" 
                        secondary={selectedDuel.creatorHandle} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Start Time" 
                        secondary={selectedDuel.startTime ? formatDate(selectedDuel.startTime) : 'Not started yet'} 
                      />
                    </ListItem>
                    {selectedDuel.endTime && (
                      <ListItem>
                        <ListItemText 
                          primary="End Time" 
                          secondary={formatDate(selectedDuel.endTime)} 
                        />
                      </ListItem>
                    )}
                    <ListItem>
                      <ListItemText 
                        primary="Duration" 
                        secondary={getDuelDuration(selectedDuel)} 
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Participants
                  </Typography>
                  <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {selectedDuel.handles?.map((handle, index) => (
                      <ListItem key={index}>
                        <ListItemAvatar>
                          <Avatar>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <span>{handle}</span>
                              {handle === selectedDuel.creatorHandle && (
                                <Chip label="Creator" size="small" color="primary" variant="outlined" />
                              )}
                            </Box>
                          }
                          secondary={`Score: ${selectedDuel.scores?.[handle] || 0}`} 
                        />
                        {selectedDuel.scores?.[handle] > 0 && (
                          <TrophyIcon color="primary" fontSize="small" />
                        )}
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            {selectedDuel.status === 'active' && (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => handlePlayDuel(selectedDuel.duelId)} 
                startIcon={<PlayIcon />}
              >
                Play Now
              </Button>
            )}
            {selectedDuel.status === 'active' && handle === selectedDuel.creatorHandle && (
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => handleOpenAddProblemDialog(selectedDuel)} 
                startIcon={<AddProblemIcon />}
              >
                Add Problem
              </Button>            
            )}
            <Button onClick={handleCloseDetailsDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
      
      {/* Alert Snackbar */}
      <Snackbar 
        open={alertOpen} 
        autoHideDuration={6000} 
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={() => setAlertOpen(false)} 
          severity={alertSeverity}
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Duel;
