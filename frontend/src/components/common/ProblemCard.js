import React from 'react';
import { Card, CardContent, CardMedia, Typography, CardActions, Button, Box, Chip } from '@mui/material';
import { AccessTime as AccessTimeIcon, Task as TaskIcon, Code as CodeIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const ProblemCard = ({ problem }) => {
  const {
    id,
    title,
    description,
    difficulty,
    timeLimit,
    memoryLimit,
    tags,
    image,
  } = problem;

  // Map difficulty to color
  const difficultyColor = {
    easy: 'success',
    medium: 'warning',
    hard: 'error',
  }[difficulty?.toLowerCase()] || 'default';

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {image && (
        <CardMedia
          component="img"
          height="140"
          image={image}
          alt={title}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
          <Chip 
            label={difficulty} 
            color={difficultyColor} 
            size="small" 
            sx={{ textTransform: 'capitalize' }} 
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description?.length > 100 
            ? `${description.substring(0, 100)}...` 
            : description}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {timeLimit || '1s'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TaskIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {memoryLimit || '256MB'}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
          {tags?.slice(0, 3).map((tag) => (
            <Chip 
              key={tag} 
              label={tag} 
              size="small" 
              variant="outlined" 
              sx={{ fontSize: '0.7rem' }}
            />
          ))}
          {tags?.length > 3 && (
            <Chip 
              label={`+${tags.length - 3}`} 
              size="small"
              variant="outlined" 
              sx={{ fontSize: '0.7rem' }}
            />
          )}
        </Box>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          variant="contained" 
          color="primary" 
          component={Link}
          to={`/problem/${id}`}
          startIcon={<CodeIcon />}
          fullWidth
        >
          Solve Problem
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProblemCard;
