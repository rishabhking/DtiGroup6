import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import connectDB from './config/database.js';
import cfRoutes from './routes/cfProblemsRouter.js';
import taskRoutes from './routes/taskRouter.js';
import duelRoutes from './routes/duelRouter.js';
import authRoutes from './routes/authRouter.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Session configuration
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
};

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:3001', // React dev server when port 3000 is busy
        'http://localhost:3000', // React dev server default
        'http://localhost:8080'  // Alternative port
    ],
    credentials: true, // Allow cookies to be sent
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions)); // Enable CORS with credentials
app.use(cookieParser()); // Parse cookies
app.use(session(sessionConfig)); // Session middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'CodingSphere3 Backend API',
        status: 'Server is running!',
        port: PORT,
        environment: process.env.NODE_ENV || 'development'
    });
});


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cf', cfRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/duels', duelRoutes);

// Start server
const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`API URL: http://localhost:${PORT}`);
    });
};

startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

export default app;
