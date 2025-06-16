import React from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';

// A loading component with optional message
const LoadingState = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
      }}
    >
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Box>
  );
};

// An error state component
const ErrorState = ({ message = 'Something went wrong', retry = null }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        bgcolor: 'error.light',
        color: 'error.contrastText',
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" gutterBottom>
        Oops!
      </Typography>
      <Typography variant="body1" paragraph>
        {message}
      </Typography>
      {retry && (
        <Box sx={{ mt: 2 }}>
          <RetryButton onClick={retry} />
        </Box>
      )}
    </Paper>
  );
};

// An empty state component
const EmptyState = ({ message = 'No data found', icon = null }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        bgcolor: 'background.paper',
        borderRadius: 2,
      }}
    >
      {icon}
      <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Paper>
  );
};

// A retry button component
const RetryButton = ({ onClick }) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        py: 1,
        px: 3,
        bgcolor: 'error.main',
        color: 'error.contrastText',
        borderRadius: 2,
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'error.dark',
        },
      }}
    >
      <Typography variant="button">Retry</Typography>
    </Box>
  );
};

export { LoadingState, ErrorState, EmptyState, RetryButton };
