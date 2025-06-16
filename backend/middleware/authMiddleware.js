import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

/**
 * Middleware to verify JWT token and authenticate user
 */
export const authenticateToken = async (req, res, next) => {
    try {
        // Get token from cookie or Authorization header
        const token = req.cookies.authToken || req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token. User not found.'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Account has been deactivated.'
            });
        }

        // Add user to request object
        req.user = user;
        next();

    } catch (error) {
        console.error('Authentication error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token.'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired. Please log in again.'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Server error during authentication.'
        });
    }
};

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required.'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required.'
        });
    }

    next();
};

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.authToken || req.headers.authorization?.replace('Bearer ', '');
        
        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.userId).select('-password');
            
            if (user && user.isActive) {
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        // Silently continue without user if token is invalid
        next();
    }
};

export default {
    authenticateToken,
    requireAdmin,
    optionalAuth
};
