import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  useTheme,
  Chip,
  Button
} from '@mui/material';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';

const Scoreboard = ({ 
  handleScores, 
  solvedProblems, 
  problems, 
  isDuel, 
  duel, 
  winner, 
  gameComplete,
  checkSubmissions,
  checkingSubmissions,
  embedded = false
}) => {
  const theme = useTheme();

  // Sort handles by score (descending)
  const sortedHandles = Object.entries(handleScores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

  return (
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
          bgcolor: theme.palette.success.main, 
          color: 'white'
        }}
      >
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrophyIcon />
          Scoreboard
        </Typography>
      </Box>
      
      <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, flexGrow: 1 }}>
        {isDuel && duel && duel.status === 'completed' && winner && (
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Chip 
              icon={<TrophyIcon />} 
              label={`Winner: ${winner}`} 
              color="warning"
              sx={{ 
                fontWeight: 'bold', 
                py: 1, 
                px: 1, 
                '& .MuiChip-icon': { color: theme.palette.warning.main } 
              }}
            />
          </Box>
        )}

        {sortedHandles.length > 0 ? (
          <List sx={{ width: '100%' }}>
            {sortedHandles.map(([handle, score], index) => {
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
      </CardContent>
    </Card>
  );
};

export default Scoreboard;
