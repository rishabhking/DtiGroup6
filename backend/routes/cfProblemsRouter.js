import express from 'express';
import CodeForcesAPI from '../utils/CodeForcesAPI.js';
import CFProblem from '../models/CFProblem.js';

const router = express.Router();

/**
 * @route   GET /api/cf/problems
 * @desc    Get all Codeforces problems
 * @access  Public
 */
router.get('/problems', async (req, res) => {
    try {
        let problems = await CFProblem.find({});
        res.json({
            success: true,
            count: problems.length,
            data: problems
        });
    } catch (error) {
        console.error('Error fetching problems:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error'
        });
    }
});

/**
 * @route   POST /api/cf/problems/update
 * @desc    Update problem database from Codeforces API
 * @access  Public (should be restricted in production)
 */
router.post('/problems/update', async (req, res) => {
    try {
        console.log('Starting Codeforces problem database update...');
        
        const result = await CodeForcesAPI.updateProblemDatabase();
        
        console.log('Update completed:', result);
        
        res.status(200).json(result);
    } catch (error) {
        console.error('Error updating problem database:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error', 
            message: error.message 
        });    }
});

/**
 * @route   DELETE /api/cf/problems/delete
 * @desc    Delete all Codeforces problems from the database
 * @access  Public (should be restricted in production)
 */
router.delete('/problems/delete', async (req, res) => {
    try {
        console.log('Starting deletion of all Codeforces problems from database...');
        
        // Delete all documents from the CFProblem collection
        const result = await CFProblem.deleteMany({});
        
        console.log('Deletion completed:', result);
        
        res.status(200).json({
            success: true,
            message: `Successfully deleted ${result.deletedCount} problems from the database`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error deleting problems from database:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error', 
            message: error.message 
        });
    }
});

/**
 * @route   POST /api/cf/random-problems
 * @desc    Get random problems based on rating range and tags
 * @access  Public
 */
router.post('/random-problems', async (req, res) => {
    try {
        const { handle, minRating = 800, maxRating = 3000, tags = [], count = 3 } = req.body;
        
        // Build filter object for MongoDB query
        const filter = {};
        
        // Apply rating filter
        if (minRating || maxRating) {
            filter.rating = {};
            if (minRating) filter.rating.$gte = Number(minRating);
            if (maxRating) filter.rating.$lte = Number(maxRating);
        }
        
        // Apply tags filter if provided and not empty
        if (tags && tags.length > 0) {
            filter.tags = { $in: tags.map(tag => tag.toLowerCase()) };
        }
        
        // Get random problems matching the filter
        const randomProblems = await CFProblem.getRandomProblems(Number(count), filter);
        
        // If handle is provided, filter out problems the user has already solved
        let filteredProblems = randomProblems;
        
        if (handle && handle.trim() !== '') {
            try {
                // Get the user's submissions
                const userSubmissions = await CodeForcesAPI.getUserSubmissions(handle);
                
                // Extract problemIds of solved problems
                const solvedProblemIds = new Set();
                userSubmissions.forEach(submission => {
                    if (submission.verdict === 'OK') {
                        const key = `${submission.problem.contestId}-${submission.problem.index}`;
                        solvedProblemIds.add(key);
                    }
                });
                
                // Filter out problems the user has already solved
                filteredProblems = randomProblems.filter(problem => {
                    const key = `${problem.contestId}-${problem.index}`;
                    return !solvedProblemIds.has(key);
                });
            } catch (error) {
                console.error(`Error getting submissions for user ${handle}:`, error);
                // Continue with unfiltered problems if there was an error with the user's submissions
            }
        }
        
        res.json(filteredProblems);
    } catch (error) {
        console.error('Error getting random problems:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error', 
            message: error.message 
        });
    }
});

/**
 * @route   GET /api/cf/verify-handle/:handle
 * @desc    Verify if a Codeforces handle exists
 * @access  Public
 */
router.get('/verify-handle/:handle', async (req, res) => {
    console.log("HELLO !!");
    try {
        const { handle } = req.params;
        
        if (!handle || handle.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Handle is required',
                valid: false
            });
        }
        
        // Verify the handle by trying to fetch user info from Codeforces API
        const userInfo = await CodeForcesAPI.getUserInfo(handle);
        const isValid = userInfo && userInfo.handle === handle;
        
        res.json({
            success: true,
            valid: isValid,
            handle
        });
    } catch (error) {
        console.error('Error verifying handle:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            valid: false
        });
    }
});

/**
 * @route   GET /api/cf/user-info/:handle
 * @desc    Get Codeforces user information including rating
 * @access  Public
 */
router.get('/user-info/:handle', async (req, res) => {
    try {
        const { handle } = req.params;
        
        if (!handle || handle.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Handle is required'
            });
        }
        
        // Get user info from Codeforces API
        const userInfo = await CodeForcesAPI.getUserInfo(handle);
        
        if (!userInfo) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Extract the relevant information
        const userRating = {
            handle: userInfo.handle,
            rating: userInfo.rating || 0,
            maxRating: userInfo.maxRating || 0,
            rank: userInfo.rank || 'unrated',
            success: true
        };
        
        res.json(userRating);
    } catch (error) {
        console.error('Error getting user info:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
});

export default router;
