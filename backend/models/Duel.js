import mongoose from 'mongoose';

const duelSchema = new mongoose.Schema({
    duelId: {
        type: String,
        required: [true, 'Duel ID is required'],
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Duel name is required'],
        trim: true,
        maxlength: [100, 'Duel name cannot exceed 100 characters']
    },    
    handles: [{
        type: String,
        required: [true, 'Handle is required'],
        trim: true
    }],
    creatorHandle: {
        type: String,
        required: [true, 'Creator handle is required'],
        trim: true
    },
    // Optional additional fields that might be useful
    createdAt: {
        type: Date,
        default: Date.now
    },    status: {
        type: String,
        enum: ['waiting', 'starting', 'active', 'completed', 'cancelled'],
        default: 'waiting'
    },
    numProblems: {
        type: Number,
        default: 3,
        min: [1, 'At least one problem is required'],
        max: [10, 'Maximum 10 problems allowed']
    },
    minRating: {
        type: Number,
        default: 800
    },
    maxRating: {
        type: Number,
        default: 3500
    },
    isGenerated: {
        type: Boolean,
        default: false
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    problems: [{
        contestId: {
            type: Number,
            required: true
        },
        index: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },
        name: String,        rating: Number
    }],    scores: {
        type: Map,
        of: Number,
        default: {}
    },    // Scheduled start time for the duel (when it should begin)
    scheduledStartTime: {
        type: Date,
        required: [true, 'Scheduled start time is required']
    },
    // Duration of the duel in minutes
    duelDurationMinutes: {
        type: Number,
        default: 60, // Default 1 hour
        min: [5, 'Minimum duel duration is 5 minutes'],
        max: [300, 'Maximum duel duration is 5 hours']
    },
    // Actual start time (when the duel became active)
    startTime: {
        type: Date
    },
    startingTime: {
        type: Date
    },
    endTime: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Pre-save middleware to ensure handles are unique
duelSchema.pre('save', function(next) {
    if (this.handles && this.handles.length > 0) {
        // Remove duplicates
        this.handles = [...new Set(this.handles)];
    }
      // Set starting time if transitioning to starting and doesn't have a starting time
    if (this.status === 'starting' && !this.startingTime) {
        this.startingTime = new Date();
    }
    
    // Set start time if active and doesn't have a start time
    if (this.status === 'active' && !this.startTime) {
        this.startTime = new Date();
    }
    
    // Set end time if completed and doesn't have an end time
    if (this.status === 'completed' && !this.endTime) {
        this.endTime = new Date();
    }
    
    next();
});

// Generate a random duel ID if not provided
duelSchema.pre('validate', function(next) {
    if (!this.duelId) {
        // Generate a random 8-character alphanumeric ID that's more readable
        // Avoid characters that can be confused (0, O, 1, I, etc.)
        const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        let id = '';
        for (let i = 0; i < 8; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.duelId = id;
    }
    next();
});

// Create indexes for efficient queries
duelSchema.index({ duelId: 1 }, { unique: true });
duelSchema.index({ handles: 1 });
duelSchema.index({ creatorHandle: 1 });
duelSchema.index({ status: 1, createdAt: -1 });
duelSchema.index({ createdAt: -1 });

// Static method to find duel by ID
duelSchema.statics.findByDuelId = function(duelId) {
    return this.findOne({ duelId: duelId });
};

// Static method to find duels by handle
duelSchema.statics.findByHandle = function(handle) {
    return this.find({ handles: handle });
};

// Static method to get all duels with optional pagination
duelSchema.statics.findAllDuels = function(limit = 20, skip = 0, sort = { createdAt: -1 }) {
    return this.find()
        .sort(sort)
        .skip(skip)
        .limit(limit);
};

// Static method to find duels by status
duelSchema.statics.findByStatus = function(status, limit = 20, skip = 0) {
    return this.find({ status })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

// Static method to find duels created by a specific user
duelSchema.statics.findByCreator = function(creatorHandle) {
    return this.find({ creatorHandle });
};

// Static method to find recent duels
duelSchema.statics.findRecentDuels = function(limit = 10) {
    return this.find()
        .sort({ createdAt: -1 })
        .limit(limit);
};

// Instance method to add a handle to the duel
duelSchema.methods.addHandle = function(handle) {
    if (!this.handles.includes(handle)) {
        this.handles.push(handle);
    }
    return this;
};

// Instance method to check if handle is in the duel
duelSchema.methods.hasHandle = function(handle) {
    return this.handles.includes(handle);
};

// Instance method to calculate current duel status based on time
duelSchema.methods.calculateCurrentStatus = function() {
    const now = new Date();
    
    // If we have a scheduled start time, use it to determine status
    if (this.scheduledStartTime) {
        const scheduledStart = new Date(this.scheduledStartTime);
        const duelEndTime = new Date(scheduledStart.getTime() + (this.duelDurationMinutes * 60 * 1000));
        
        // If current time is before scheduled start time
        if (now < scheduledStart) {
            // Check if we're within 10 seconds of start (starting phase)
            const timeUntilStart = scheduledStart - now;
            if (timeUntilStart <= 10000) { // 10 seconds in milliseconds
                return 'starting';
            }
            return 'waiting';
        }
        // If current time is after scheduled start but before end
        else if (now >= scheduledStart && now <= duelEndTime) {
            return 'active';
        }
        // If current time is after the scheduled end
        else {
            return 'completed';
        }
    }
    
    // Fallback to current status if no scheduled time
    return this.status;
};

// Instance method to get time until duel starts (in seconds)
duelSchema.methods.getTimeUntilStart = function() {
    if (!this.scheduledStartTime) return 0;
    
    const now = new Date();
    const scheduledStart = new Date(this.scheduledStartTime);
    const timeUntilStart = Math.max(0, Math.floor((scheduledStart - now) / 1000));
    
    return timeUntilStart;
};

// Instance method to get remaining time in duel (in seconds)
duelSchema.methods.getRemainingTime = function() {
    if (!this.scheduledStartTime) return 0;
    
    const now = new Date();
    const scheduledStart = new Date(this.scheduledStartTime);
    const duelEndTime = new Date(scheduledStart.getTime() + (this.duelDurationMinutes * 60 * 1000));
    
    // If duel hasn't started yet, return full duration
    if (now < scheduledStart) {
        return this.duelDurationMinutes * 60;
    }
    
    // If duel is active, return remaining time
    const remainingTime = Math.max(0, Math.floor((duelEndTime - now) / 1000));
    return remainingTime;
};

// Instance method to get elapsed time in duel (in seconds)
duelSchema.methods.getElapsedTime = function() {
    if (!this.scheduledStartTime) return 0;
    
    const now = new Date();
    const scheduledStart = new Date(this.scheduledStartTime);
    
    // If duel hasn't started yet, return 0
    if (now < scheduledStart) {
        return 0;
    }
    
    // Return elapsed time since start, capped at duration
    const elapsedTime = Math.floor((now - scheduledStart) / 1000);
    const maxTime = this.duelDurationMinutes * 60;
    
    return Math.min(elapsedTime, maxTime);
};


// Static method to find duels by status
duelSchema.statics.findByStatus = function(status, limit = 20, skip = 0) {
    return this.find({ status })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

// Static method to find duels created by a specific user
duelSchema.statics.findByCreator = function(creatorHandle) {
    return this.find({ creatorHandle });
};

// Static method to find recent duels
duelSchema.statics.findRecentDuels = function(limit = 10) {
    return this.find()
        .sort({ createdAt: -1 })
        .limit(limit);
};

// Instance method to add a handle to the duel
duelSchema.methods.addHandle = function(handle) {
    if (!this.handles.includes(handle)) {
        this.handles.push(handle);
    }
    return this;
};

// Instance method to check if handle is in the duel
duelSchema.methods.hasHandle = function(handle) {
    return this.handles.includes(handle);
};

// Instance method to update duel status
duelSchema.methods.updateStatus = function(newStatus) {
    if (['waiting', 'active', 'completed', 'cancelled'].includes(newStatus)) {
        const oldStatus = this.status;
        this.status = newStatus;
        
        // Set start/end times based on status change
        if (newStatus === 'active' && !this.startTime) {
            this.startTime = new Date();
        } else if (newStatus === 'completed' && !this.endTime) {
            this.endTime = new Date();
        }
    }
    return this;
};

// Virtual for duel duration in minutes
duelSchema.virtual('durationMinutes').get(function() {
    if (this.startTime && this.endTime) {
        return Math.round((this.endTime - this.startTime) / (1000 * 60));
    } else if (this.startTime) {
        return Math.round((new Date() - this.startTime) / (1000 * 60));
    }
    return 0;
});

const Duel = mongoose.model('Duel', duelSchema);

export default Duel;
