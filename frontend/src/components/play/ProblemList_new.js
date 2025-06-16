import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Paper,
  Box,
  Button,
  Chip,
  useTheme,
  Link as MuiLink
} from '@mui/material';
import { Launch as LaunchIcon } from '@mui/icons-material';

const ProblemList = ({ problems, solvedProblems, onBackClick, isDuel }) => {
  const theme = useTheme();

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
          bgcolor: theme.palette.primary.main, 
          color: 'white'
        }}
      >
        <Typography variant="h6">
          Your Problems
        </Typography>
      </Box>
      
      <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, flexGrow: 1 }}>
        <Box sx={{ mt: 1 }}>
          {problems.map((problem, index) => {
            const problemKey = `${problem.contestId}${problem.index}`;
            const isSolvedByAnyone = solvedProblems[problemKey] ? 
              Object.values(solvedProblems[problemKey]).some(solved => solved) : 
              false;
            
            return (
              <Paper
                key={problem.contestId + problem.index}
                elevation={1}
                sx={{
                  p: { xs: 2, sm: 3 },
                  mb: 3,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: 3,
                    bgcolor: 'background.default',
                    transform: 'translateY(-2px)'
                  },
                  bgcolor: isSolvedByAnyone ? 'rgba(76, 175, 80, 0.1)' : 'inherit',
                  border: isSolvedByAnyone ? `2px solid ${theme.palette.success.main}` : 'inherit',
                  boxShadow: isSolvedByAnyone ? `0 0 8px rgba(76, 175, 80, 0.4)` : 'inherit'
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
                    {index + 1}. {problem.name}
                    {isSolvedByAnyone && (
                      <Chip 
                        label="Solved" 
                        color="success" 
                        size="small" 
                        sx={{ ml: 1, fontWeight: 'bold' }}
                      />
                    )}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    mt: 1,
                    flexWrap: 'wrap'
                  }}>
                    <Chip 
                      label={`${problem.rating || 'Unknown'} Rating`} 
                      size="small" 
                      color={
                        !problem.rating ? 'default' :
                        problem.rating < 1200 ? 'success' :
                        problem.rating < 1800 ? 'info' :
                        problem.rating < 2400 ? 'warning' : 'error'
                      }
                      variant="outlined"
                      sx={{ fontWeight: 'medium' }}
                    />
                    {problem.tags && problem.tags.slice(0, 3).map(tag => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                    {problem.tags && problem.tags.length > 3 && (
                      <Chip 
                        label={`+${problem.tags.length - 3}`} 
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  endIcon={<LaunchIcon />}
                  component={MuiLink}
                  href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    whiteSpace: 'nowrap',
                    textTransform: 'none',
                    color: 'white',
                    textDecoration: 'none',
                    minWidth: '100px',
                    alignSelf: { xs: 'flex-end', sm: 'center' }
                  }}
                >
                  Solve
                </Button>
              </Paper>
            );
          })}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={onBackClick}
          >
            Back to {isDuel ? 'Duels' : 'Practice'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProblemList;
