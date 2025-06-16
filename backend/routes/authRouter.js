import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// JWT Secret from environment variable or default
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Validation middleware
const validateSignup = [
    body('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('firstName')
        .optional()
        .isLength({ max: 50 })
        .withMessage('First name cannot exceed 50 characters'),
    body('lastName')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Last name cannot exceed 50 characters'),
    body('codeforceHandle')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Codeforces handle cannot exceed 50 characters')
];

const validateLogin = [
    body('identifier')
        .notEmpty()
        .withMessage('Email or username is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Helper function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// Helper function to set cookie
const setTokenCookie = (res, token) => {
    res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', validateSignup, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { username, email, password, firstName, lastName, codeforceHandle } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: username }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: existingUser.email === email.toLowerCase() 
                    ? 'User with this email already exists' 
                    : 'Username is already taken'
            });
        }

        // Create new user
        const user = new User({
            username,
            email: email.toLowerCase(),
            password,
            firstName,
            lastName,
            codeforceHandle
        });

        await user.save();

        // Generate JWT token
        const token = generateToken(user._id);

        // Set cookie
        setTokenCookie(res, token);

        // Store user session
        req.session.userId = user._id.toString();
        req.session.username = user.username;

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                codeforceHandle: user.codeforceHandle,
                fullName: user.fullName,
                createdAt: user.createdAt
            },
            token
        });

    } catch (error) {
        console.error('Signup error:', error);
        
        // Handle MongoDB duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                error: `${field.charAt(0).toUpperCase() + field.slice(1)} is already taken`
            });
        }

        res.status(500).json({
            success: false,
            error: 'Server error during registration',
            message: error.message
        });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateLogin, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { identifier, password } = req.body;

        // Find user by email or username
        const user = await User.findByEmailOrUsername(identifier);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Account has been deactivated. Please contact support.'
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Update last login
        await user.updateLastLogin();

        // Generate JWT token
        const token = generateToken(user._id);

        // Set cookie
        setTokenCookie(res, token);

        // Store user session
        req.session.userId = user._id.toString();
        req.session.username = user.username;

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                codeforceHandle: user.codeforceHandle,
                fullName: user.fullName,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during login',
            message: error.message
        });
    }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', (req, res) => {
    try {
        // Clear cookie
        res.clearCookie('authToken');
        
        // Destroy session
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Error during logout'
                });
            }

            res.json({
                success: true,
                message: 'Logout successful'
            });
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during logout',
            message: error.message
        });
    }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me', async (req, res) => {
    try {
        // Get token from cookie or Authorization header
        const token = req.cookies.authToken || req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                codeforceHandle: user.codeforceHandle,
                fullName: user.fullName,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt,
                isVerified: user.isVerified,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Get user info error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', async (req, res) => {
    try {
        // Get token from cookie or Authorization header
        const token = req.cookies.authToken || req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Update allowed fields
        const allowedUpdates = ['firstName', 'lastName', 'codeforceHandle'];
        const updates = {};
        
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        // Update user
        Object.assign(user, updates);
        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                codeforceHandle: user.codeforceHandle,
                fullName: user.fullName,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during profile update',
            message: error.message
        });
    }
});

/**
 * @route   GET /api/auth/performance
 * @desc    Get the user's performance score
 * @access  Private
 */
router.get('/performance', authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id;
        
        const user = await User.findById(userId).select('performance');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        res.json({
            success: true,
            performance: user.performance || 5 // Default to 5 if not set
        });
    } catch (error) {
        console.error('Error getting user performance:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

/**
 * @route   POST /api/auth/performance
 * @desc    Update the user's performance based on problems solved
 * @access  Private
 */
router.post('/performance', authenticateToken, async (req, res) => {
    try {
        const { problemsSolved } = req.body;
        
        if (typeof problemsSolved !== 'number') {
            return res.status(400).json({
                success: false,
                error: 'Problems solved must be a number'
            });
        }
        
        const userId = req.user._id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Calculate performance adjustment: problems solved - 2
        const performanceAdjustment = problemsSolved - 2;
        
        // Update performance
        user.performance = Math.min(10, Math.max(0, (user.performance || 5) + performanceAdjustment));
        
        await user.save();
        
        res.json({
            success: true,
            performance: user.performance,
            message: `Performance updated to ${user.performance}`
        });
    } catch (error) {
        console.error('Error updating user performance:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

export default router;
