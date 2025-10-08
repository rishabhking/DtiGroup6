import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemButton
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Code as CodeIcon,
  Assignment as AssignmentIcon,
  AccountCircle,
  Settings,
  Logout,
  Login as LoginIcon,
  PersonAdd as SignupIcon,
  DarkMode,
  LightMode
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { darkMode, toggleDarkMode } = useThemeMode();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    await logout();
    handleUserMenuClose();
    navigate('/');
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Practice', icon: <CodeIcon />, path: '/practice' },
    { text: 'Duels', icon: <AssignmentIcon />, path: '/duel' },
    { text: 'Problems', icon: <AssignmentIcon />, path: '/problems' },
  ];
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', width: 240 }}>
      <Typography 
        variant="h6" 
        sx={{ 
          my: 3, 
          fontWeight: 'bold', 
          color: theme.palette.primary.main,
          px: 2
        }}
      >
        <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        CodingSphere
      </Typography>      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton 
            component={Link} 
            to={item.path} 
            key={item.text}
            sx={{
              borderRadius: 2,
              mx: 1,
              mb: 0.5,
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{ 
                '& .MuiListItemText-primary': {
                  fontWeight: 500
                }
              }} 
            />
          </ListItemButton>
        ))}
        
        {/* Dark Mode Toggle for Mobile */}
        <Divider sx={{ my: 1 }} />
        <ListItemButton onClick={toggleDarkMode} sx={{ borderRadius: 2, mx: 1 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            {darkMode ? <LightMode /> : <DarkMode />}
          </ListItemIcon>
          <ListItemText primary={darkMode ? "Light Mode" : "Dark Mode"} />
        </ListItemButton>
        
        {/* Mobile Auth Options */}
        {isAuthenticated ? (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, mx: 1, color: 'error.main' }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </>
        ) : (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItemButton 
              component={Link} 
              to="/login" 
              sx={{ borderRadius: 2, mx: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItemButton>
            <ListItemButton 
              component={Link} 
              to="/signup" 
              sx={{ borderRadius: 2, mx: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <SignupIcon />
              </ListItemIcon>
              <ListItemText primary="Sign Up" />
            </ListItemButton>
          </>
        )}
      </List>
    </Box>
  );
  return (
    <>
      <AppBar 
        position="static" 
        color="default" 
        elevation={0} 
        sx={{ 
          backgroundColor: 'background.paper', 
          borderBottom: '1px solid', 
          borderColor: 'divider' 
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            minHeight: '64px',
            px: { xs: 1, sm: 2 } 
          }}>
            {/* Left Section - Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', flex: '0 0 auto' }}>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 1 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Typography
                variant="h6"
                component={Link}
                to="/"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  color: theme.palette.primary.main,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                <CodeIcon sx={{ mr: 1, fontSize: { xs: '1.3rem', sm: '1.5rem' } }} />
                CodingSphere
              </Typography>
            </Box>

            {/* Center Section - Navigation (Desktop only) */}
            {!isMobile && (
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                flex: '1 1 auto', 
                justifyContent: 'center',
                mx: 3 
              }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.text}
                    component={Link}
                    to={item.path}
                    color="inherit"
                    startIcon={item.icon}
                    sx={{
                      mx: 0.5,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}            {/* Right Section - Dark Mode Toggle & Auth */}
            <Box sx={{ 
              display: 'flex', 
              gap: 1, 
              flex: '0 0 auto',
              alignItems: 'center' 
            }}>
              {/* Dark Mode Toggle */}
              <IconButton
                onClick={toggleDarkMode}
                size="small"
                sx={{
                  ml: 1,
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
                aria-label="toggle dark mode"
              >
                {darkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
              
              {isAuthenticated ? (
                <>
                  <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
                    Welcome, {user.username}
                  </Typography>
                  <IconButton
                    onClick={handleUserMenuOpen}
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      {user.username.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={handleUserMenuClose}
                    onClick={handleUserMenuClose}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem onClick={handleUserMenuClose}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {user.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {user.fullName || user.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleUserMenuClose} component={Link} to="/profile">
                      <ListItemIcon>
                        <Settings fontSize="small" />
                      </ListItemIcon>
                      Profile Settings
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <Logout fontSize="small" />
                      </ListItemIcon>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    color="primary"
                    component={Link}
                    to="/login"
                    sx={{ 
                      px: { xs: 2, sm: 3 },
                      py: 0.8,
                      textTransform: 'none',
                      fontWeight: 500,
                      borderRadius: 2
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to="/signup"
                    sx={{ 
                      px: { xs: 2, sm: 3 },
                      py: 0.8,
                      textTransform: 'none',
                      fontWeight: 500,
                      borderRadius: 2,
                      boxShadow: '0 2px 4px rgba(52, 152, 219, 0.3)'
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;
