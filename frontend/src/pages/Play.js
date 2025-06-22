import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  useTheme,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { 
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ApiService from '../services/ApiService';

// Import modular components
import ProblemList from '../components/play/ProblemList';
import TimerAndScoreboard from '../components/play/TimerAndScoreboard';
import WinnerDialog from '../components/play/WinnerDialog';
import DuelCountdown from '../components/play/DuelCountdown';

const Play = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { duelId } = useParams(); // Extract duel ID from URL params
  
  // Extract filter data from location state or use defaults
  const { 
    handles, 
    minRating, 
    maxRating, 
    count, 
    trackPerformance, 
    startPerformance
  } = location.state || {};
    // State for duel data
  const [duel, setDuel] = useState(null);
  const [isDuel, setIsDuel] = useState(false);
  const [handle, setHandle] = useState(localStorage.getItem('userHandle') || '');
  
  // State for problems data and loading status
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingProblems, setGeneratingProblems] = useState(false);  
  // Timer states - now simplified for time-based system
  const [duelStatus, setDuelStatus] = useState('waiting');
  const [duelTiming, setDuelTiming] = useState(null);
  
  // Remove old timer references
  const timerRef = useRef(null);
  const isTimerInitialized = useRef(false);
  const isGeneratingRef = useRef(false);
  // Scoring states
  const [problemScores, setProblemScores] = useState([]);
  const [handleScores, setHandleScores] = useState({});
  const [checkingSubmissions, setCheckingSubmissions] = useState(false);
  const lastCheckRef = useRef(0);
  const [solvedProblems, setSolvedProblems] = useState({});
    // Winner alert state
  const [winnerDialogOpen, setWinnerDialogOpen] = useState(false);
  const [winner, setWinner] = useState('');
  const [winnerScore, setWinnerScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  // Countdown state
  const [showCountdown, setShowCountdown] = useState(false);

  // Status change handler for the Timer component
  const handleStatusChange = (newStatus, timing) => {
    setDuelStatus(newStatus);
    setDuelTiming(timing);
    
    // Handle status-specific logic
    switch (newStatus) {
      case 'starting':
        setShowCountdown(true);
        break;
      case 'active':
        setShowCountdown(false);
        // Start checking submissions when duel becomes active
        if (!checkingSubmissions) {
          checkSubmissions();
        }
        break;      case 'completed':
        setShowCountdown(false);
        setGameComplete(true);
        // Update the duel object for practice mode
        if (!isDuel && duel) {
          const updatedDuel = { ...duel, status: 'completed' };
          setDuel(updatedDuel);
        }
        // Perform final submission check
        checkSubmissions();
        break;
      default:
        setShowCountdown(false);        break;
    }
  };

  // Format time function (converts seconds to HH:MM:SS)
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
    // Check if all problems are solved by at least one handle
  const checkAllProblemsSolved = (solvedProblemsMap) => {
    if (!solvedProblemsMap || !problems || problems.length === 0) return false;
    
    // Check each problem
    for (const problem of problems) {
      const problemKey = `${problem.contestId}${problem.index}`;
      
      // Skip if this problem doesn't exist in the solved map
      if (!solvedProblemsMap[problemKey]) return false;
      
      // Check if at least one handle has solved this problem
      const isSolved = Object.values(solvedProblemsMap[problemKey]).some(status => status === true);
      
      // If any problem is not solved, return false
      if (!isSolved) return false;
    }
    
    // All problems are solved
    return true;
  };
  
  // Determine the winner
  const determineWinner = (scores) => {
    if (!scores || Object.keys(scores).length === 0) return { handle: '', score: 0 };
    
    let maxScore = -1;
    let winnerHandle = '';
    
    Object.entries(scores).forEach(([handle, score]) => {
      if (score > maxScore) {
        maxScore = score;
        winnerHandle = handle;
      }
    });
    
    return { handle: winnerHandle, score: maxScore };
  };  // Check submissions for all problems and handles
  const checkSubmissions = async () => {
    // Don't check submissions if:
    // - Already checking
    // - No problems to check
    // - Game is complete
    // - Duel is completed
    if (checkingSubmissions || 
        !problems.length || 
        gameComplete || 
        (isDuel && duel && duel.status === 'completed')) return;
    
    // Get handles to check based on whether we're in a duel or regular practice mode
    const handlesToCheck = isDuel && duel ? duel.handles : handles;
    
    // Early return if we don't have any handles to check
    if (!handlesToCheck || handlesToCheck.length === 0) {
      return;
    }
    setCheckingSubmissions(true);
    try {
      // Create a copy of current scores to update
      const updatedHandleScores = { ...handleScores };
      const updatedSolvedProblems = { ...solvedProblems };
      
      // Initialize scores if not already done
      if (Object.keys(updatedHandleScores).length === 0) {
        handlesToCheck.forEach(handle => {
          updatedHandleScores[handle] = 0;
        });
      }
      
      // Initialize solved problems tracking if not already done
      if (Object.keys(updatedSolvedProblems).length === 0) {
        problems.forEach(problem => {
          const problemKey = `${problem.contestId}${problem.index}`;
          updatedSolvedProblems[problemKey] = {};
          handlesToCheck.forEach(handle => {
            updatedSolvedProblems[problemKey][handle] = false;
          });
        });
      }
      
      // Check each problem for each handle
      for (const problem of problems) {
        const problemKey = `${problem.contestId}${problem.index}`;
        
        if (!updatedSolvedProblems[problemKey]) {
          updatedSolvedProblems[problemKey] = {};
          handlesToCheck.forEach(h => {
            updatedSolvedProblems[problemKey][h] = false;
          });
        }
        
        for (const handle of handlesToCheck) {
          // Skip already solved problems for this handle
          if (updatedSolvedProblems[problemKey][handle]) continue;
          
          try {
            const response = await ApiService.getUserSolves(handle, problem.contestId, problem.index);
            
            // If the problem is solved (API returns submissions)
            if (response.success && response.submissions && response.submissions.length > 0 && response.submissions[0].verdict === 'OK') {
              // Mark problem as solved for this handle
              updatedSolvedProblems[problemKey][handle] = true;
              
              // Add problem rating to handle score
              updatedHandleScores[handle] += problem.rating || 0;
              
              console.log(`${handle} solved problem ${problem.contestId}${problem.index} (+${problem.rating} points)`);
              
              // Update duel scores in the backend if this is a duel
              if (isDuel && duel) {
                try {
                  await ApiService.updateDuelScore(duel.duelId, handle, updatedHandleScores[handle]);
                } catch (scoreError) {
                  console.error('Error updating duel score:', scoreError);
                }
              }
            }
          } catch (error) {
            console.error(`Error checking submissions for ${handle} on problem ${problem.contestId}${problem.index}:`, error);
          }
        }
      }
      
      // Update states with new scores
      setHandleScores(updatedHandleScores);
      setSolvedProblems(updatedSolvedProblems);
        // Check if all problems are solved
      const allSolved = checkAllProblemsSolved(updatedSolvedProblems);
      if (allSolved && !gameComplete) {
        // Get winner
        const winnerData = determineWinner(updatedHandleScores);
        
        // Timer will stop automatically when duel status changes to completed
        
        // Set winner and open dialog
        setWinner(winnerData.handle);
        setWinnerScore(winnerData.score);
        setGameComplete(true);
        setWinnerDialogOpen(true);
          // If this is a duel, mark it as completed
        if (isDuel && duel) {
          try {
            await ApiService.updateDuelStatus(duel.duelId, 'completed');
          } catch (completeError) {
            console.error('Error completing duel:', completeError);
          }
        }
        
        // If this is a practice session and we need to track performance
        if (!isDuel && trackPerformance) {
          try {
            // Count how many problems the user solved
            const userHandle = handle;
            let problemsSolved = 0;
            
            // Count solved problems for this handle
            for (const problem of problems) {
              const problemKey = `${problem.contestId}${problem.index}`;
              if (
                solvedProblems[problemKey] && 
                solvedProblems[problemKey][userHandle] === true
              ) {
                problemsSolved++;
              }
            }
            
            console.log(`Updating performance: ${problemsSolved} problems solved`);
            // Update user performance based on problems solved
            await ApiService.updateUserPerformance(problemsSolved);
          } catch (perfError) {
            console.error('Error updating user performance:', perfError);
          }
        }
      }
    } catch (error) {
      console.error('Error checking submissions:', error);
    } finally {
      setCheckingSubmissions(false);
    }
  };
  // Function to generate problems for a duel
  const generateProblemsForDuel = async (duel) => {
    if (!duel || duel.isGenerated) return false;
    
    // Additional check to prevent multiple generation attempts using ref
    if (generatingProblems || isGeneratingRef.current) {
      console.log('Already generating problems, skipping...');
      return false;
    }
    
    // Set the ref to prevent race conditions
    isGeneratingRef.current = true;
    setGeneratingProblems(true);
    setError('');
    
    try {
      // Prepare request data for problem generation
      const requestData = {
        handles: duel.handles,
        ratingMin: duel.minRating || 800,
        ratingMax: duel.maxRating || 3500,
        count: duel.numProblems || 3
      };
      
      // Get random problems that match criteria
      const response = await ApiService.getMultipleProblems(requestData);
      
      if (response.success && response.problems && response.problems.length > 0) {
        // Add problems to the duel
        const problemsData = response.problems.map(problem => ({
          contestId: problem.contestId,
          index: problem.index,
          name: problem.name,
          rating: problem.rating
        }));
        
        // Update duel with problems
        const updateResponse = await ApiService.addProblemsToDuel(duel.duelId, problemsData);
        
        if (updateResponse.success) {
          // Mark duel as having generated problems
          await ApiService.markDuelAsGenerated(duel.duelId);
          
          // Update local state
          setDuel({...duel, problems: problemsData, isGenerated: true});
          setProblems(response.problems);
          
          // Initialize problem scores array
          const initialProblemScores = response.problems.map(problem => ({
            contestId: problem.contestId,
            index: problem.index,
            score: problem.rating || 0
          }));
          setProblemScores(initialProblemScores);
          
          // Initialize handle scores
          const initialHandleScores = {};
          duel.handles.forEach(handle => {
            initialHandleScores[handle] = 0;
          });
          setHandleScores(initialHandleScores);
          
          return true;
        } else {
          setError('Failed to add problems to duel. Please try again.');
          return false;
        }
      } else {
        setError('No problems found matching the duel criteria. Try adjusting the ratings.');
        return false;
      }
    } catch (error) {
      console.error('Error generating problems for duel:', error);
      setError('Failed to generate problems: ' + (error.message || 'Please try again.'));
      return false;    } finally {
      setGeneratingProblems(false);
      isGeneratingRef.current = false;
    }
  };
  // Fetch problems when component mounts
  useEffect(() => {
    // Clean up any existing timer first
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    const fetchDuelData = async () => {
      if (!duelId) {
        return;
      }
      
      setLoading(true);
      setError('');
      setIsDuel(true);
      
      try {
        // Fetch duel data
        const response = await ApiService.getDuelById(duelId);
        
        if (!response.success || !response.duel) {
          setError('Duel not found or has been removed.');
          setLoading(false);
          return;
        }
        
        const duelData = response.duel;        // Check duel status and handle accordingly
        if (duelData.status === 'completed') {
          // For completed duels, show the final results
          setDuel(duelData);
          setProblems(duelData.problems || []);
          setGameComplete(true);
          
          // Update scores if they exist in the duel data
          if (duelData.scores) {
            const scoreMap = {};
            Object.entries(duelData.scores).forEach(([handle, score]) => {
              scoreMap[handle] = score;
            });
            setHandleScores(scoreMap);
            
            // Find the winner
            const winnerData = determineWinner(scoreMap);
            setWinner(winnerData.handle);
            setWinnerScore(winnerData.score);
          }
          
          // Don't show error for completed duels, we'll display the results
          setLoading(false);        } else if (duelData.status === 'cancelled') {
          setError(`This duel has been cancelled and is no longer available.`);
          setLoading(false);
          return;
        } else if (duelData.status === 'waiting') {
          setError(`This duel is in waiting state. The host needs to start it before you can play.`);
          setLoading(false);
          return;
        } else if (duelData.status === 'starting') {
          // Show countdown for starting duels, but continue with duel setup
          setShowCountdown(true);
        }
        
        // Continue with duel setup for both 'starting' and 'active' status
        setDuel(duelData);
        
        // Check if problems are already generated
        if (duelData.isGenerated && duelData.problems && duelData.problems.length > 0) {
          setProblems(duelData.problems);
          
          // Initialize problem scores array
          const initialProblemScores = duelData.problems.map(problem => ({
            contestId: problem.contestId,
            index: problem.index,
            score: problem.rating || 0
          }));
          setProblemScores(initialProblemScores);          
          // Initialize handle scores
          const initialHandleScores = {};
          duelData.handles.forEach(handle => {
            initialHandleScores[handle] = 0;
          });
          setHandleScores(initialHandleScores);
          
          // Note: Timer is now handled automatically by the Timer component
        } else {
          // Only the creator should generate problems, and only when the duel is active
          // Additional check: don't generate if already generating or if problems exist
          if (duelData.creatorHandle === handle && 
              duelData.status === 'active' && 
              !generatingProblems && 
              !isGeneratingRef.current &&
              (!duelData.problems || duelData.problems.length === 0)) {
            // Generate problems for the duel
            await generateProblemsForDuel(duelData);
            
            // Note: Timer is now handled by the Timer component automatically
          } else if (duelData.creatorHandle !== handle) {
            // If not the creator, just wait for problems to be generated
            setError(`Please wait for the host (${duelData.creatorHandle}) to start the duel and generate problems.`);
          } else if (generatingProblems || isGeneratingRef.current) {
            // If already generating, show appropriate message
            setError('Problems are being generated, please wait...');
          } else if (duelData.problems && duelData.problems.length > 0) {
            // If problems exist but not marked as generated, this shouldn't happen but handle it
            console.warn('Problems exist but duel not marked as generated');
            setProblems(duelData.problems);
          }
        }
      } catch (error) {
        console.error('Error fetching duel data:', error);
        setError('Failed to fetch duel data. ' + (error.message || 'Please try again later.'));
      } finally {
        setLoading(false);
      }
    };
    
    const fetchProblems = async () => {
      // If we have a duelId, fetch duel data instead
      if (duelId) {
        fetchDuelData();
        return;
      }
      
      // Navigate back if we don't have the required filter data
      if (!handles || !handles.length || !count) {
        navigate('/practice');
        return;
      }
      
      setLoading(true);
      setError('');
      
      try {
        // Prepare request data
        const requestData = {
          handles: handles,
          ratingMin: minRating,
          ratingMax: maxRating,
          count: count
        };
        
        // Get random problems
        const response = await ApiService.getMultipleProblems(requestData);
        
        if (response.success && response.problems && response.problems.length > 0) {
          setProblems(response.problems);
          
          // Initialize problem scores array
          const initialProblemScores = response.problems.map(problem => ({
            contestId: problem.contestId,
            index: problem.index,
            score: problem.rating || 0
          }));
          setProblemScores(initialProblemScores);            // Initialize handle scores
          const initialHandleScores = {};
          handles.forEach(handle => {
            initialHandleScores[handle] = 0;
          });
          setHandleScores(initialHandleScores);
          
          // Create a practice session duel-like object with timing info
          const practiceSession = {
            status: 'active',
            startTime: new Date().toISOString(), // Set start time to now
            duelDurationMinutes: count * 30, // 30 minutes per problem
            problems: response.problems,
            handles: handles
          };
          setDuel(practiceSession);
          setDuelStatus('active');
          
          // Log practice session details for debugging
          console.log("Practice session created:", {
            startTime: practiceSession.startTime,
            duration: `${practiceSession.duelDurationMinutes} minutes (${count} problems × 30 min)`,
            problems: response.problems.length,
            handles
          });
            // Update the duel status with timing information
          const timingData = {
            remainingTime: practiceSession.duelDurationMinutes * 60, // convert to seconds
            startTime: practiceSession.startTime
          };
          handleStatusChange('active', timingData);
        } else {
          setError('No problems found matching your criteria. Try adjusting your filters.');
        }
      } catch (error) {
        console.error('Error fetching problems:', error);
        setError('Failed to fetch problems. ' + (error.message || 'Please try again later.'));
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();    // Clean up timer on component unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Reset the timer initialization flag
      isTimerInitialized.current = false;
      // Reset the generation flag
      isGeneratingRef.current = false;
    };
  }, [duelId, handles, minRating, maxRating, count, navigate]);

  // Separate effect for timer management
  useEffect(() => {
    // This effect ensures timer cleanup happens whenever component unmounts or re-renders
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Effect for periodic submission checking during active duels
  useEffect(() => {
    let submissionCheckInterval = null;
    
    // Start checking submissions every 5 seconds when duel is active
    if (isDuel && duelStatus === 'active' && problems.length > 0) {
      submissionCheckInterval = setInterval(() => {
        checkSubmissions();
      }, 5000); // Check every 5 seconds
    }
    
    return () => {
      if (submissionCheckInterval) {
        clearInterval(submissionCheckInterval);
      }
    };
  }, [isDuel, duelStatus, problems.length, checkSubmissions]);

  // Initial submission check after problems load
  useEffect(() => {
    if (problems.length > 0) {
      checkSubmissions();
    }
  }, [problems]);
  // Navigate back if there's no data and not loading
  if (!loading && problems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            {error || "No problems to display"}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
            {generatingProblems ? "Generating problems for your duel..." : "Please go back and try different filters."}
          </Typography>
          {!generatingProblems && (
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate(isDuel ? '/duel' : '/practice')}
            >
              Back to {isDuel ? 'Duels' : 'Practice'}
            </Button>
          )}
        </Box>
      </Container>
    );
  }  // Loading state
  if (loading || generatingProblems) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <CircularProgress size={60} />
          <Typography variant="h5" color="text.secondary">
            {generatingProblems 
              ? "Generating problems for your duel..." 
              : isDuel 
                ? "Loading duel data..." 
                : "Finding the perfect problems for you..."}
          </Typography>
        </Box>
      </Container>
    );
  }
    // For completed duels, determine the winner early
  if (isDuel && duel.status === 'completed' && !winner) {
    const winnerData = determineWinner(handleScores);
    if (winnerData && winnerData.handle) {
      setWinner(winnerData.handle);
      setWinnerScore(winnerData.score);
    }
  }
    // Handle countdown completion
  const handleCountdownComplete = () => {
    setShowCountdown(false);
    // Refresh the duel data to get the updated status
    if (duelId) {
      const refetchDuelData = async () => {
        try {
          const response = await ApiService.getDuelById(duelId);
          if (response.success && response.duel) {
            setDuel(response.duel);
            // If the duel is now active, reload the page to start the normal duel flow
            if (response.duel.status === 'active') {
              window.location.reload();
            }
          }
        } catch (error) {
          console.error('Error refetching duel data after countdown:', error);
        }
      };
      refetchDuelData();
    }
  };

    return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 4 } }}>      <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
        {isDuel && duel && duel.status === 'completed' && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              '& .MuiAlert-message': { fontWeight: 'bold' }
            }}
          >
            This duel has been completed
          </Alert>
        )}
        
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          {isDuel ? `Duel: ${duel?.name || 'Loading...'}` : 'Your Practice Session'}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
          {isDuel ? (
            `Problems for ${duel?.handles?.join(', ') || 'participants'} with rating ${duel?.minRating || 'min'}-${duel?.maxRating || 'max'}`
          ) : (
            `Problems selected for ${handles?.join(', ')} with rating ${minRating}-${maxRating}`
          )}
        </Typography>
        
        {isDuel && duel && duel.status === 'completed' && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
            <Chip 
              icon={<TrophyIcon />} 
              label={`Winner: ${winner || 'No winner determined'}`} 
              color="warning"
              sx={{ fontWeight: 'bold', py: 1, px: 1, '& .MuiChip-icon': { color: theme.palette.warning.main } }}
            />
          </Box>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}        <Grid container spacing={4} sx={{ maxWidth: '1200px', mx: 'auto', alignItems: 'stretch' }}>
        {/* Problems Card */}
        <Grid item xs={12} md={7}>
          <ProblemList 
            problems={problems}
            solvedProblems={solvedProblems}
            onBackClick={() => navigate(isDuel ? '/duel' : '/practice')}
            isDuel={isDuel}
          />        </Grid>          {/* Timer and Scoreboard */}
        <Grid item xs={12} md={5}>
          <TimerAndScoreboard
            duelId={duelId}
            formatTime={formatTime}
            gameComplete={gameComplete}
            handleScores={handleScores}
            solvedProblems={solvedProblems}
            problems={problems}
            isDuel={isDuel}
            duel={duel}
            winner={winner}
            checkSubmissions={checkSubmissions}
            checkingSubmissions={checkingSubmissions}
            onStatusChange={handleStatusChange}
            duelStatus={duelStatus}
            duelTiming={duelTiming}
            isCountingDown={showCountdown}
          />
        </Grid>
      </Grid>      {/* Winner Dialog */}
      <WinnerDialog
        open={winnerDialogOpen}
        onClose={() => setWinnerDialogOpen(false)}
        winner={winner}
        winnerScore={winnerScore}
        isDuel={isDuel}
        formatTime={formatTime}
        duelTiming={duelTiming}
      />
      {/* Countdown Overlay */}
      {showCountdown && isDuel && (
        <DuelCountdown
          duelId={duelId}
          onCountdownComplete={handleCountdownComplete}
        />
      )}
    </Container>
  );
};

export default Play;
