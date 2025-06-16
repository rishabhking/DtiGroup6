import React from 'react';
import { Box, Container, Grid, Typography, Link as MuiLink, IconButton } from '@mui/material';
import {
  GitHub as GitHubIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: (theme) => theme.palette.background.paper,
        p: 6,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography
              variant="h6"
              color="primary"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}
            >
              <CodeIcon sx={{ mr: 1 }} /> CodingSphere
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enhance your coding skills with our platform. Practice, learn, and compete with fellow
              developers from around the world.
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <IconButton color="primary" aria-label="GitHub" component="a" href="https://github.com">
                <GitHubIcon />
              </IconButton>
              <IconButton color="primary" aria-label="Twitter" component="a" href="https://twitter.com">
                <TwitterIcon />
              </IconButton>
              <IconButton color="primary" aria-label="LinkedIn" component="a" href="https://linkedin.com">
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Resources
            </Typography>
            <Typography variant="body2" component={Link} to="/problems" color="text.secondary" display="block" sx={{ mb: 1, textDecoration: 'none' }}>
              Problem Set
            </Typography>
            <Typography variant="body2" component={Link} to="/challenges" color="text.secondary" display="block" sx={{ mb: 1, textDecoration: 'none' }}>
              Challenges
            </Typography>
            <Typography variant="body2" component={Link} to="/leaderboard" color="text.secondary" display="block" sx={{ mb: 1, textDecoration: 'none' }}>
              Leaderboard
            </Typography>
            <Typography variant="body2" component={Link} to="/community" color="text.secondary" display="block" sx={{ textDecoration: 'none' }}>
              Community
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Company
            </Typography>
            <Typography variant="body2" component={Link} to="/about" color="text.secondary" display="block" sx={{ mb: 1, textDecoration: 'none' }}>
              About Us
            </Typography>
            <Typography variant="body2" component={Link} to="/contact" color="text.secondary" display="block" sx={{ mb: 1, textDecoration: 'none' }}>
              Contact
            </Typography>
            <Typography variant="body2" component={Link} to="/privacy" color="text.secondary" display="block" sx={{ mb: 1, textDecoration: 'none' }}>
              Privacy Policy
            </Typography>
            <Typography variant="body2" component={Link} to="/terms" color="text.secondary" display="block" sx={{ textDecoration: 'none' }}>
              Terms of Service
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ mt: 5 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            {'Copyright © '}
            <MuiLink color="inherit" component={Link} to="/">
              CodingSphere
            </MuiLink>{' '}
            {new Date().getFullYear()}
            {'.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
