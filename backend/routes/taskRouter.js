// filepath: e:\CodingSphere3\backend\routes\taskRouter.js
import express from 'express';
import TaskManager from '../utils/taskManager.js';

const router = express.Router();

/**
 * @route   POST /api/tasks/single-problem
 * @desc    Get a single problem by rating range not solved by the provided handles
 * @access  Public
 */
router.post('/single-problem', async (req, res) => {
    try {
        const { ratingMin, ratingMax, handles } = req.body;
        
        if (!ratingMin || !ratingMax || !handles || !Array.isArray(handles) || handles.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request: ratingMin, ratingMax, and at least one handle are required'
            });
        }
        
        const problem = await TaskManager.getSingleProblemByRatingAndUnsolved(
            parseInt(ratingMin),
            parseInt(ratingMax),
            handles
        );
        
        if (!problem) {
            return res.status(404).json({
                success: false,
                error: 'No unsolved problems found matching the given criteria'
            });
        }
        
        res.json({
            success: true,
            problem
        });
    } catch (error) {
        console.error('Error getting single problem:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
});

/**
 * @route   POST /api/tasks/multiple-problems
 * @desc    Get multiple problems by rating range not solved by the provided handles
 * @access  Public
 */
router.post('/multiple-problems', async (req, res) => {
    try {
        const { ratingMin, ratingMax, handles, count = 5 } = req.body;
        
        if (!ratingMin || !ratingMax || !handles || !Array.isArray(handles) || handles.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request: ratingMin, ratingMax, and at least one handle are required'
            });
        }
        
        const problems = await TaskManager.getMultipleProblems(
            parseInt(ratingMin),
            parseInt(ratingMax),
            handles,
            parseInt(count)
        );
        
        res.json({
            success: true,
            count: problems.length,
            problems
        });
    } catch (error) {
        console.error('Error getting multiple problems:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
});

/**
 * @route   GET /api/tasks/user-solves/:handle/:contestId/:index
 * @desc    Get user's submissions for a specific problem
 * @access  Public
 */
router.get('/user-solves/:handle/:contestId/:index', async (req, res) => {
    try {
        const { handle, contestId, index } = req.params;
        const { limit = 10 } = req.query;
        
        if (!handle || !contestId || !index) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request: handle, contestId, and index are required'
            });
        }
        
        const problem = {
            contestId: parseInt(contestId),
            index
        };
        
        const submissions = await TaskManager.getUserSolves(handle, problem, parseInt(limit));
        // console.log(submissi)
        res.json({
            success: true,
            count: submissions.length,
            submissions
        });
    } catch (error) {
        console.error('Error getting user solves:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
});

/**
 * @route   GET /api/tasks/verify-handle/:handle
 * @desc    Verify if a Codeforces handle is valid
 * @access  Public
 */
router.get('/verify-handle/:handle', async (req, res) => {
    console.log("Hello !!");
    try {
        const { handle } = req.params;
        
        if (!handle) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request: handle is required',
                valid: false
            });
        }
        
        const isValid = await TaskManager.isValidHandle(handle);
        console.log("IS VALID HANDLE: ", isValid);
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
            valid: false,
            message: error.message
        });
    }
});

/**
 * @route   POST /api/tasks/update-problemset
 * @desc    Update the problemset in the database
 * @access  Public (should be restricted in production)
 */
router.post('/update-problemset', async (req, res) => {
    try {
        console.log('Starting problemset update...');
        
        const result = await TaskManager.updateProblemset();
        
        console.log('Update completed:', result);
        
        res.json(result);
    } catch (error) {
        console.error('Error updating problemset:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
});

export default router;
