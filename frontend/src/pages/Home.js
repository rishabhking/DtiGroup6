import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Stack,
  useTheme,
  Avatar,
} from '@mui/material';
import {
  Code as CodeIcon,
  Terminal as TerminalIcon,
  People as PeopleIcon,
  EmojiEvents as EmojiEventsIcon,
  Speed as SpeedIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Home = () => {
  const theme = useTheme();
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: 8, pb: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
            }}
          >
            CodingSphere
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{
              mb: 4,
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            The ultimate platform for competitive programming. 
            Practice problems, challenge friends, and improve your coding skills.
          </Typography>
          
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            sx={{ justifyContent: 'center', mb: 6 }}
          >
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/practice"
              startIcon={<TerminalIcon />}
              sx={{
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                borderRadius: 2,
              }}
            >
              Start Practicing
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/duel"
              startIcon={<PeopleIcon />}
              sx={{
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                borderRadius: 2,
              }}
            >
              Challenge Friends
            </Button>
          </Stack>
        </Box>        {/* Features Grid */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 60,
                  height: 60,
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <CodeIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Practice Mode
              </Typography>
              <Typography color="text.secondary">
                Solve problems at your own pace with customizable difficulty levels
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                sx={{
                  bgcolor: 'secondary.main',
                  width: 60,
                  height: 60,
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <PeopleIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Dueling System
              </Typography>
              <Typography color="text.secondary">
                Real-time competitions with friends and live scoring
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                sx={{
                  bgcolor: 'success.main',
                  width: 60,
                  height: 60,
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <EmojiEventsIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Progress Tracking
              </Typography>
              <Typography color="text.secondary">
                Monitor your performance and see detailed statistics with Ratings.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                sx={{
                  bgcolor: 'warning.main',
                  width: 60,
                  height: 60,
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <PsychologyIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Smart Problem Practice
              </Typography>
              <Typography color="text.secondary">
               Suggestions based on your performance and rating.
              </Typography>
            </Box>
          </Grid>
        </Grid>        {/* How It Works */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 4 }}
          >
            How It Works
          </Typography>
          
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Practice Mode
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  1. Enter your Codeforces handle<br/>
                  2. Set difficulty range and problem count<br/>
                  3. Start solving with integrated timer
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  to="/practice"
                  sx={{ borderRadius: 2 }}
                >
                  Try Practice
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                  Duel Mode
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  1. Create or join a duel room<br/>
                  2. Wait for opponents to join<br/>
                  3. Compete in real-time coding challenges
                </Typography>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/duel"
                  sx={{ borderRadius: 2 }}
                >
                  Start Duel
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                  Smart Practice
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  1. System analyzes your performance<br/>
                  2. AI suggests optimal difficulty problems<br/>
                  3. Personalized learning path generation
                </Typography>
                <Button
                  variant="contained"
                  color="warning"
                  component={Link}
                  to="/practice"
                  sx={{ borderRadius: 2 }}
                >
                  Get Recommendations
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Key Features */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 4 }}
          >
            Why Choose CodingSphere?
          </Typography>
          
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={6} sm={3}>
              <Box sx={{ p: 2 }}>
                <SpeedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Fast & Responsive
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Box sx={{ p: 2 }}>
                <CodeIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Codeforces Integration
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Box sx={{ p: 2 }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Multiplayer Support
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Box sx={{ p: 2 }}>
                <EmojiEventsIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Live Scoring
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Footer CTA */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 6,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Ready to Start Coding?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of developers improving their skills on CodingSphere
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'center' }}
          >
            <Button
              variant="contained"
              color="secondary"
              size="large"
              component={Link}
              to="/practice"
              sx={{ px: 4, py: 1.5, borderRadius: 2 }}
            >
              Start Practice
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/duel"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Create Duel
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
