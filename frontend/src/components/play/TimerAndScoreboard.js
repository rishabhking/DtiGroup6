import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  List,
  ListItem,
  ListItemText,
  Button
} from '@mui/material';
import {
  TimerOutlined as TimerIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';

import Timer from './Timer';

const TimerAndScoreboard = ({ 
  duelId,
  formatTime,
  gameComplete,
  handleScores,
  solvedProblems,
  problems,
  isDuel,
  duel,
  winner,
  checkSubmissions,
  checkingSubmissions,
  onStatusChange,
  duelStatus,
  duelTiming,
  isCountingDown = false
}) => {
  const theme = useTheme();

  return (
    <Card 
      elevation={3} 
      sx={{ 
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.background.paper,
        position: 'sticky',
        top: 24
      }}
    >      <Box 
        sx={{ 
          p: 2, 
          bgcolor: duel && duel.status === 'completed' ? theme.palette.warning.main : theme.palette.secondary.main, 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6">
          {isDuel ? 'Duel Timer' : 'Practice Timer'}
        </Typography>
        {duel && duel.status === 'completed' && (
          <TrophyIcon sx={{ mr: 1 }} />
        )}
      </Box>
      
      <CardContent sx={{
        p: { xs: 3, md: 4 }, 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        textAlign: 'center',
        height: '100%'
      }}>        
        {/* Timer Component */}
        {isCountingDown ? (
          // Show countdown message
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <TimerIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              Duel Starting Soon!
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Please wait for the countdown to finish...
            </Typography>
          </Box>
        ) : isDuel && duel && duel.status === 'completed' ? (
          // Show trophy and winner for completed duels
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <TrophyIcon sx={{ fontSize: 60, color: theme.palette.warning.main, mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              Duel Complete
            </Typography>
            {winner ? (
              <Typography variant="h5" sx={{ color: theme.palette.warning.dark }}>
                Winner: {winner}
              </Typography>
            ) : (
              <Typography variant="h6" color="text.secondary">
                No winner determined
              </Typography>
            )}
          </Box>        ) : (
          // Normal timer display for active duels/practice
          <Timer
            duelId={duelId}
            isDuel={isDuel}
            duel={duel}
            onStatusChange={onStatusChange}
          />
        )}        {/* Scoreboard */}
        <Box sx={{ 
          mt: 3,
          p: 3, 
          bgcolor: theme.palette.grey[50], 
          borderRadius: 2, 
          width: '100%',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0px 2px 8px rgba(0,0,0,0.05)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TrophyIcon sx={{ color: theme.palette.warning.dark, mr: 1 }} />
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              Scoreboard
            </Typography>
          </Box>
          
          {Object.keys(handleScores).length > 0 ? (
            <List disablePadding>
              {Object.entries(handleScores)
                .sort(([,a], [,b]) => b - a) // Sort by descending score
                .map(([handle, score], index) => {
                  // Count solved problems for this handle
                  const solvedCount = Object.entries(solvedProblems).reduce((count, [problemKey, handleStatus]) => {
                    return count + (handleStatus && handleStatus[handle] ? 1 : 0);
                  }, 0);
                  
                  // Check if this is the creator in a duel
                  const isCreator = isDuel && duel && handle === duel.creatorHandle;
                  
                  return (
                    <ListItem 
                      key={handle} 
                      disablePadding 
                      sx={{ 
                        py: 1, 
                        px: 2,
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: index === 0 && score > 0 ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                        border: index === 0 && score > 0 ? `1px solid ${theme.palette.warning.light}` : 'none'
                      }}
                    >
                      <ListItemText 
                        primary={
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 'medium', 
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <span>
                              {index === 0 && score > 0 && '🏆 '}
                              {handle} {isCreator && '(Host)'}
                            </span>
                            <span style={{ fontWeight: 'bold' }}>
                              {score} pts ({solvedCount}/{problems.length})
                            </span>
                          </Typography>
                        }
                      />
                    </ListItem>
                  );
                })}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No handles to display scores for.
            </Typography>
          )}
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            {isDuel && duel && duel.status === 'completed' ? (
              <Typography variant="caption" color="text.secondary">
                Final scores for this duel
              </Typography>
            ) : (
              <>
                <Typography variant="caption" color="text.secondary">
                  Scores update every 15 seconds!
                </Typography>
                <Button
                  size="small"
                  color="primary"
                  onClick={checkSubmissions}
                  disabled={checkingSubmissions || (isDuel && duel && duel.status === 'completed')}
                  sx={{ display: 'block', mx: 'auto', mt: 1 }}
                >
                  {checkingSubmissions ? 'Checking...' : 'Check Now'}
                </Button>
              </>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TimerAndScoreboard;
