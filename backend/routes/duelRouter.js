import express from 'express';
import Duel from '../models/Duel.js';
import TaskManager from '../utils/taskManager.js';

const router = express.Router();

/**
 * @route   POST /api/duels
 * @desc    Create a new duel
 * @access  Public
 */
router.post('/', async (req, res) => {
    try {        const { 
            name, 
            handles, 
            creatorHandle, 
            problems, 
            scheduledStartTime, 
            duelDurationMinutes,
            isPrivate
        } = req.body;
        
        // Validate required fields
        if (!name || !handles || !handles.length || !creatorHandle) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, handles, and creatorHandle are required'
            });
        }

        // Validate scheduledStartTime if provided
        if (scheduledStartTime) {
            const startTime = new Date(scheduledStartTime);
            const now = new Date();
            
            if (isNaN(startTime.getTime())) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid scheduled start time format'
                });
            }
            
            if (startTime <= now) {
                return res.status(400).json({
                    success: false,
                    error: 'Scheduled start time must be in the future'
                });
            }
        }

        // Validate duel duration if provided
        if (duelDurationMinutes !== undefined) {
            if (duelDurationMinutes < 5 || duelDurationMinutes > 300) {
                return res.status(400).json({
                    success: false,
                    error: 'Duel duration must be between 5 and 300 minutes'
                });
            }
        }

        // Make sure creatorHandle is included in handles
        const allHandles = new Set(handles);
        allHandles.add(creatorHandle); // Ensure creator is a participant

        // Initialize scores for all participants
        const scores = {};
        allHandles.forEach(handle => {
            scores[handle] = 0;
        });        
        
        // Create duel data object
        const duelData = {
            name,
            handles: Array.from(allHandles),
            creatorHandle,
            problems: problems || [],
            scores
        };
        
        // Add optional fields if provided
        if (scheduledStartTime) {
            duelData.scheduledStartTime = new Date(scheduledStartTime);
        }
          if (duelDurationMinutes !== undefined) {
            duelData.duelDurationMinutes = duelDurationMinutes;
        }
        
        if (isPrivate !== undefined) {
            duelData.isPrivate = isPrivate;
        }
        
        // Create a new duel
        const duel = new Duel(duelData);

        // Save the duel
        await duel.save();

        res.status(201).json({
            success: true,
            duel
        });
    } catch (error) {
        console.error('Error creating duel:', error);
        
        // Better error handling for MongoDB duplicate key errors
        if (error.name === 'MongoServerError' && error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Duplicate duel ID. Please try again.'
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
 * @route   GET /api/duels
 * @desc    Get all duels with pagination
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const { 
            limit = 20, 
            skip = 0, 
            sort = 'createdAt', 
            order = 'desc',
            status = 'all'  // Allow filtering by status in main listing
        } = req.query;
        
        // Parse limit and skip as integers
        const limitInt = parseInt(limit);
        const skipInt = parseInt(skip);
        
        // Create sort object
        const sortObj = {};
        sortObj[sort] = order === 'desc' ? -1 : 1;          // Create filter object
        const filter = {};
        if (status !== 'all' && ['waiting', 'active', 'completed', 'cancelled'].includes(status)) {
            filter.status = status;
        }
        
        // Only filter out private duels if explicitly requested
        const includePrivate = req.query.includePrivate === 'true';
        if (!includePrivate) {
            filter.isPrivate = { $ne: true }; // Exclude private duels by default
        }        // Use projection to limit fields for performance
        const projection = { 
            duelId: 1, 
            name: 1, 
            creatorHandle: 1,  
            status: 1, 
            createdAt: 1, 
            scheduledStartTime: 1,
            duelDurationMinutes: 1,
            startTime: 1, 
            endTime: 1, 
            isPrivate: 1,
            'handles': 1, 
            'problems': { $slice: 5 }  // Limit number of problems returned 
        };
        
        // More efficient query with filter and projection
        const duels = await Duel.find(filter, projection)
            .sort(sortObj)
            .skip(skipInt)
            .limit(limitInt)
            .lean();  // Use lean for better performance with large result sets
        
        // Get total count for pagination
        const total = await Duel.countDocuments(filter);
        
        res.json({
            success: true,
            count: duels.length,
            total,
            duels,
            pagination: {
                page: Math.floor(skipInt / limitInt) + 1,
                pageSize: limitInt,
                totalPages: Math.ceil(total / limitInt)
            }
        });
    } catch (error) {
        console.error('Error fetching duels:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
});

/**
 * @route   GET /api/duels/status/:status
 * @desc    Get duels by status
 * @access  Public
 */
router.get('/status/:status', async (req, res) => {
    try {
        const { status } = req.params;
        const { limit = 20, skip = 0 } = req.query;
          // Validate status
        if (!['waiting', 'active', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be one of: waiting, active, completed, cancelled'
            });
        }
        
        // Parse limit and skip as integers
        const limitInt = parseInt(limit);
        const skipInt = parseInt(skip);
        
        // Fetch duels by status using the static method
        const duels = await Duel.findByStatus(status, limitInt, skipInt);
        
        // Get total count for pagination
        const total = await Duel.countDocuments({ status });
        
        res.json({
            success: true,
            count: duels.length,
            total,
            duels
        });
    } catch (error) {
        console.error(`Error fetching ${req.params.status} duels:`, error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
});

/**
 * @route   GET /api/duels/id/:duelId
 * @desc    Get duel by ID
 * @access  Public
 */
router.get('/id/:duelId', async (req, res) => {
    try {
        const { duelId } = req.params;
        
        // Fetch duel by ID using the static method
        const duel = await Duel.findByDuelId(duelId);
        
        if (!duel) {
            return res.status(404).json({
                success: false,
                error: `Duel with ID ${duelId} not found`
            });
        }
        
        res.json({
            success: true,
            duel
        });
    } catch (error) {
        console.error(`Error fetching duel ${req.params.duelId}:`, error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
});

/**
 * @route   GET /api/duels/handle/:handle
 * @desc    Get duels by handle (participant)
 * @access  Public
 */
router.get('/handle/:handle', async (req, res) => {
    try {
        const { handle } = req.params;
        
        // Fetch duels by handle using the static method
        const duels = await Duel.findByHandle(handle);
        
        res.json({
            success: true,
            count: duels.length,
            duels
        });
    } catch (error) {
        console.error(`Error fetching duels for handle ${req.params.handle}:`, error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
});

/**
 * @route   GET /api/duels/creator/:creatorHandle
 * @desc    Get duels by creator
 * @access  Public
 */
router.get('/creator/:creatorHandle', async (req, res) => {
    try {
        const { creatorHandle } = req.params;
        
        // Fetch duels by creator using the static method
        const duels = await Duel.findByCreator(creatorHandle);
        
        res.json({
            success: true,
            count: duels.length,
            duels
        });
    } catch (error) {
        console.error(`Error fetching duels created by ${req.params.creatorHandle}:`, error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
});

/**
 * @route   GET /api/duels/recent
 * @desc    Get recent duels
 * @access  Public
 */
router.get('/recent', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        // Parse limit as integer
        const limitInt = parseInt(limit);
        
        // Fetch recent duels using the static method
        const duels = await Duel.findRecentDuels(limitInt);
        
        res.json({
            success: true,
            count: duels.length,
            duels
        });
    } catch (error) {
        console.error('Error fetching recent duels:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
});

/**
 * @route   PUT /api/duels/:duelId/add-handle
 * @desc    Add handle to a duel
 * @access  Public
 */
router.put('/:duelId/add-handle', async (req, res) => {
    try {
        const { duelId } = req.params;
        const { handle } = req.body;
        
        // Validate handle
        if (!handle) {
            return res.status(400).json({
                success: false,
                error: 'Handle is required'
            });
        }
        
        // Find duel
        const duel = await Duel.findByDuelId(duelId);
        
        if (!duel) {
            return res.status(404).json({
                success: false,
                error: `Duel with ID ${duelId} not found`
            });
        }
          // Only allow adding handles if the duel is active or waiting
        if (duel.status !== 'active' && duel.status !== 'waiting') {
            return res.status(400).json({
                success: false,
                error: `Cannot add handle to a ${duel.status} duel`
            });
        }
        
        // Add handle to duel
        duel.addHandle(handle);
        
        // Save duel
        await duel.save();
        
        res.json({
            success: true,
            message: `Handle "${handle}" added to duel`,
            duel
        });
    } catch (error) {
        console.error(`Error adding handle to duel ${req.params.duelId}:`, error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
});

/**
 * @route   PUT /api/duels/:duelId/update-status
 * @desc    Update duel status
 * @access  Public 
 */
router.put('/:duelId/update-status', async (req, res) => {
    try {
        const { duelId } = req.params;
        const { status } = req.body;
          // Validate status
        if (!status || !['waiting', 'active', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be one of: waiting, active, completed, cancelled'
            });
        }
        
        // Find duel
        const duel = await Duel.findByDuelId(duelId);
        
        if (!duel) {
            return res.status(404).json({
                success: false,
                error: `Duel with ID ${duelId} not found`
            });
        }
        
        // Update status
        duel.updateStatus(status);
        
        // Save duel
        await duel.save();
        
        res.json({
            success: true,
            message: `Duel status updated to "${status}"`,
            duel
        });
    } catch (error) {
        console.error(`Error updating status for duel ${req.params.duelId}:`, error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
});

/**
 * @route   PUT /api/duels/:duelId/add-problems
 * @desc    Add problems to a duel
 * @access  Public
 */
router.put('/:duelId/add-problems', async (req, res) => {
    try {
        const { duelId } = req.params;
        const { problems } = req.body;
        
        // Validate problems
        if (!problems || !Array.isArray(problems) || problems.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Problems array is required'
            });
        }
        
        // Validate problem structure
        for (const problem of problems) {
            if (!problem.contestId || !problem.index) {
                return res.status(400).json({
                    success: false,
                    error: 'Each problem must have contestId and index properties'
                });
            }
        }
        
        // Find duel
        const duel = await Duel.findByDuelId(duelId);
        
        if (!duel) {
            return res.status(404).json({
                success: false,
                error: `Duel with ID ${duelId} not found`
            });
        }
          // Only allow adding problems if the duel is active or waiting
        if (duel.status !== 'active' && duel.status !== 'waiting') {
            return res.status(400).json({
                success: false,
                error: `Cannot add problems to a ${duel.status} duel`
            });
        }
        
        // Using MongoDB's $push operator is more efficient for adding to arrays
        await Duel.updateOne(
            { duelId: duelId },
            { $push: { problems: { $each: problems } } }
        );
        
        // Get the updated duel
        const updatedDuel = await Duel.findByDuelId(duelId);
        
        res.json({
            success: true,
            message: `${problems.length} problem(s) added to duel`,
            duel: updatedDuel
        });
    } catch (error) {
        console.error(`Error adding problems to duel ${req.params.duelId}:`, error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
});

/**
 * @route   PUT /api/duels/:duelId/update-score
 * @desc    Update score for a handle in a duel
 * @access  Public
 */
router.put('/:duelId/update-score', async (req, res) => {
    try {
        const { duelId } = req.params;
        const { handle, score } = req.body;
        
        // Validate input
        if (!handle || score === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Handle and score are required'
            });
        }
        
        // Find duel - use lean for better performance if just checking
        const duel = await Duel.findByDuelId(duelId);
        
        if (!duel) {
            return res.status(404).json({
                success: false,
                error: `Duel with ID ${duelId} not found`
            });
        }
        
        // Check if handle is a participant
        if (!duel.hasHandle(handle)) {
            return res.status(400).json({
                success: false,
                error: `Handle "${handle}" is not a participant in this duel`
            });
        }
        
        // This is better for performance as it only updates the specific field
        const scoreKey = `scores.${handle}`;
        const updateResult = await Duel.updateOne(
            { duelId: duelId },
            { $set: { [scoreKey]: parseInt(score) } }
        );
        
        if (updateResult.modifiedCount === 0) {
            return res.status(400).json({
                success: false,
                error: 'Failed to update score'
            });
        }
        
        // Get the updated duel to return in the response
        const updatedDuel = await Duel.findByDuelId(duelId);
        
        res.json({
            success: true,
            message: `Score updated for handle "${handle}"`,
            duel: updatedDuel
        });
    } catch (error) {
        console.error(`Error updating score for duel ${req.params.duelId}:`, error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
});

/**
 * @route   DELETE /api/duels/:duelId
 * @desc    Delete a duel
 * @access  Public
 */
router.delete('/:duelId', async (req, res) => {
    try {
        const { duelId } = req.params;
        const { creatorHandle } = req.query; // Optional: Only allow creator to delete
        
        // Find the duel first to check if it exists
        const duel = await Duel.findByDuelId(duelId);
        
        if (!duel) {
            return res.status(404).json({
                success: false,
                error: `Duel with ID ${duelId} not found`
            });
        }
        
        // Optional creator check
        if (creatorHandle && duel.creatorHandle !== creatorHandle) {
            return res.status(403).json({
                success: false,
                error: 'Only the creator can delete this duel'
            });
        }
        
        // More efficient direct deletion - better for performance
        const result = await Duel.deleteOne({ duelId: duelId });
        
        if (result.deletedCount === 0) {
            return res.status(400).json({
                success: false,
                error: 'Failed to delete duel'
            });
        }
        
        res.json({
            success: true,
            message: `Duel with ID ${duelId} deleted successfully`
        });
    } catch (error) {
        console.error(`Error deleting duel ${req.params.duelId}:`, error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
});

/**
 * @route   PUT /api/duels/:duelId/mark-generated
 * @desc    Mark a duel as having generated problems
 * @access  Public
 */
router.put('/:duelId/mark-generated', async (req, res) => {
    try {
        const { duelId } = req.params;
        
        // Find duel
        const duel = await Duel.findByDuelId(duelId);
        
        if (!duel) {
            return res.status(404).json({
                success: false,
                error: `Duel with ID ${duelId} not found`
            });
        }
        
        // Mark duel as generated
        duel.isGenerated = true;
        
        // Save duel
        await duel.save();
        
        res.json({
            success: true,
            message: `Duel marked as having generated problems`,
            duel
        });
    } catch (error) {
        console.error(`Error marking duel ${req.params.duelId} as generated:`, error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
});

/**
 * @route   POST /api/duels/:duelId/generate-problems
 * @desc    Generate problems for a duel
 * @access  Public
 */
router.post('/:duelId/generate-problems', async (req, res) => {
    try {
        const { duelId } = req.params;
        
        // Find duel
        const duel = await Duel.findByDuelId(duelId);
        
        if (!duel) {
            return res.status(404).json({
                success: false,
                error: `Duel with ID ${duelId} not found`
            });
        }
        
        // Check if problems have already been generated
        if (duel.isGenerated && duel.problems && duel.problems.length > 0) {
            return res.json({
                success: true,
                message: 'Problems already generated for this duel',
                duel
            });
        }
        
        // Get parameters for problem generation
        const ratingMin = duel.minRating || 800;
        const ratingMax = duel.maxRating || 3500;
        const count = duel.numProblems || 3;
        
        // Generate problems
        const problems = await TaskManager.getMultipleProblems(
            ratingMin,
            ratingMax,
            duel.handles,
            count
        );
        
        if (!problems || problems.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No problems found matching the duel criteria'
            });
        }
        
        // Map problems to the format needed for duel
        const problemsData = problems.map(problem => ({
            contestId: problem.contestId,
            index: problem.index,
            name: problem.name,
            rating: problem.rating
        }));
        
        // Add problems to duel
        duel.problems = problemsData;
        duel.isGenerated = true;
        
        // Save duel
        await duel.save();
        
        res.json({
            success: true,
            message: `${problemsData.length} problems generated for duel`,
            duel
        });
    } catch (error) {
        console.error(`Error generating problems for duel ${req.params.duelId}:`, error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
});

/**
 * @route   PUT /api/duels/:duelId/start
 * @desc    Start a waiting duel (transition from waiting to active)
 * @access  Public
 */
router.put('/:duelId/start', async (req, res) => {
    try {
        const { duelId } = req.params;
        const { creatorHandle } = req.body; // Optional: verify creator
        
        // Find duel
        const duel = await Duel.findByDuelId(duelId);
        
        if (!duel) {
            return res.status(404).json({
                success: false,
                error: `Duel with ID ${duelId} not found`
            });
        }
          // Only allow starting duels that are in waiting status
        if (duel.status !== 'waiting') {
            return res.status(400).json({
                success: false,
                error: `Cannot start a duel with status "${duel.status}". Only waiting duels can be started.`
            });
        }
        
        // Optional: Check if request is from creator
        if (creatorHandle && duel.creatorHandle !== creatorHandle) {
            return res.status(403).json({
                success: false,
                error: 'Only the creator can start this duel'
            });
        }
        
        // Update status to starting (10-second buffer)
        duel.updateStatus('starting');
        duel.startingTime = new Date();
        
        // Save duel
        await duel.save();
        
        // Schedule transition to active after 10 seconds
        setTimeout(async () => {
            try {
                const updatedDuel = await Duel.findByDuelId(duelId);
                if (updatedDuel && updatedDuel.status === 'starting') {
                    updatedDuel.updateStatus('active');
                    await updatedDuel.save();
                    console.log(`Duel ${duelId} automatically transitioned to active status`);
                }
            } catch (error) {
                console.error(`Error auto-transitioning duel ${duelId} to active:`, error);
            }
        }, 10000); // 10 seconds
          res.json({
            success: true,
            message: 'Duel is starting in 10 seconds...',
            duel,
            countdown: 10
        });
    } catch (error) {
        console.error(`Error starting duel ${req.params.duelId}:`, error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
});

/**
 * @route   GET /api/duels/:duelId/status
 * @desc    Get current duel status, timing, and countdown information
 * @access  Public
 */
router.get('/:duelId/status', async (req, res) => {
    try {
        const { duelId } = req.params;
        
        // Find duel
        const duel = await Duel.findByDuelId(duelId);
        
        if (!duel) {
            return res.status(404).json({
                success: false,
                error: `Duel with ID ${duelId} not found`
            });
        }
        
        // Calculate current status based on time
        const currentStatus = duel.calculateCurrentStatus();
        const timeUntilStart = duel.getTimeUntilStart();
        const remainingTime = duel.getRemainingTime();
        const elapsedTime = duel.getElapsedTime();
        
        // Update the duel status if it has changed based on time
        if (currentStatus !== duel.status) {
            duel.status = currentStatus;
            
            // Set timestamps for status transitions
            if (currentStatus === 'starting' && !duel.startingTime) {
                duel.startingTime = new Date();
            } else if (currentStatus === 'active' && !duel.startTime) {
                duel.startTime = new Date();
            } else if (currentStatus === 'completed' && !duel.endTime) {
                duel.endTime = new Date();
            }
            
            await duel.save();
        }
        
        // Prepare response data
        const response = {
            success: true,
            status: currentStatus,
            duel: duel,
            timing: {
                timeUntilStart,
                remainingTime,
                elapsedTime,
                duelDurationMinutes: duel.duelDurationMinutes,
                scheduledStartTime: duel.scheduledStartTime
            }
        };
        
        // Add appropriate message based on status
        switch (currentStatus) {
            case 'waiting':
                response.message = timeUntilStart > 0 
                    ? `Duel starts in ${Math.floor(timeUntilStart / 60)} minutes and ${timeUntilStart % 60} seconds`
                    : 'Waiting for duel to start';
                break;
            case 'starting':
                const countdown = Math.max(0, 10 - (10 - timeUntilStart));
                response.countdown = countdown;
                response.message = countdown > 0 
                    ? `Duel starting in ${countdown} seconds...` 
                    : 'Starting now!';
                break;
            case 'active':
                response.message = `Duel is active! ${Math.floor(remainingTime / 60)} minutes and ${remainingTime % 60} seconds remaining`;
                break;
            case 'completed':
                response.message = 'Duel has completed';
                break;
            default:
                response.message = `Duel is ${currentStatus}`;
        }
        
        res.json(response);
    } catch (error) {
        console.error(`Error getting status for duel ${req.params.duelId}:`, error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
});

// Keep the old countdown endpoint for backward compatibility
/**
 * @route   GET /api/duels/:duelId/countdown
 * @desc    Get countdown status for a starting duel (legacy endpoint)
 * @access  Public
 */
router.get('/:duelId/countdown', async (req, res) => {
    try {
        const { duelId } = req.params;
        
        // Find duel
        const duel = await Duel.findByDuelId(duelId);
        
        if (!duel) {
            return res.status(404).json({
                success: false,
                error: `Duel with ID ${duelId} not found`
            });
        }
        
        const currentStatus = duel.calculateCurrentStatus();
        const timeUntilStart = duel.getTimeUntilStart();
        
        if (currentStatus !== 'starting') {
            return res.json({
                success: true,
                countdown: 0,
                status: currentStatus,
                message: currentStatus === 'active' ? 'Duel has started!' : `Duel is ${currentStatus}`
            });
        }
        
        // For starting status, calculate countdown from time until start
        const countdown = Math.min(10, timeUntilStart);
        
        res.json({
            success: true,
            countdown: countdown,
            status: currentStatus,
            message: countdown > 0 ? `Duel starting in ${countdown} seconds...` : 'Starting now!'
        });
    } catch (error) {
        console.error(`Error getting countdown for duel ${req.params.duelId}:`, error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
});

/**
 * @route   DELETE /api/duels/clear-all
 * @desc    Clear all duels from the database (for development/testing)
 * @access  Public
 */
router.delete('/clear-all', async (req, res) => {
    try {
        const result = await Duel.deleteMany({});
        
        res.json({
            success: true,
            message: `Successfully deleted ${result.deletedCount} duel(s)`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error clearing all duels:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
});

/**
 * @route   GET /api/duels/user/:handle
 * @desc    Get all duels where a specific user is a participant
 * @access  Public
 */
router.get('/user/:handle', async (req, res) => {
    try {
        const { handle } = req.params;
        const { 
            limit = 20, 
            skip = 0, 
            sort = 'createdAt', 
            order = 'desc',
            status = 'all'
        } = req.query;
        
        // Parse limit and skip as integers
        const limitInt = parseInt(limit);
        const skipInt = parseInt(skip);
        
        // Create sort object
        const sortObj = {};
        sortObj[sort] = order === 'desc' ? -1 : 1;
        
        // Create filter object for user's duels
        const filter = {
            handles: handle // Find duels where user is in the handles array
        };
        
        if (status !== 'all' && ['waiting', 'active', 'completed', 'cancelled'].includes(status)) {
            filter.status = status;
        }        // Use projection to return relevant fields
        const projection = { 
            duelId: 1, 
            name: 1, 
            creatorHandle: 1,  
            status: 1, 
            createdAt: 1, 
            scheduledStartTime: 1,
            duelDurationMinutes: 1,
            startTime: 1, 
            endTime: 1, 
            isPrivate: 1,
            'handles': 1, 
            'problems': { $slice: 5 }
        };
        
        // Query duels for this user
        const duels = await Duel.find(filter, projection)
            .sort(sortObj)
            .skip(skipInt)
            .limit(limitInt)
            .lean();
        
        // Get total count for pagination
        const total = await Duel.countDocuments(filter);
        
        res.json({
            success: true,
            duels,
            pagination: {
                total,
                limit: limitInt,
                skip: skipInt,
                hasMore: skipInt + duels.length < total
            }
        });
    } catch (error) {
        console.error('Error fetching user duels:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: error.message
        });
    }
});

export default router;
