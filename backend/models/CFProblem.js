import mongoose from 'mongoose';

const cfProblemSchema = new mongoose.Schema({
    contestId: {
        type: Number,
        required: [true, 'Contest ID is required'],
        index: true
    },
    index: {
        type: String,
        required: [true, 'Problem index is required'],
        trim: true,
        uppercase: true
    },
    name: {
        type: String,
        required: [true, 'Problem name is required'],
        trim: true,
        maxlength: [200, 'Problem name cannot exceed 200 characters']
    },
    type: {
        type: String,
        enum: ['PROGRAMMING', 'QUESTION'],
        default: 'PROGRAMMING'
    },
    points: {
        type: Number,
        min: [0, 'Points cannot be negative'],
        default: null
    },
    rating: {
        type: Number,
        min: [800, 'Rating cannot be less than 800'],
        max: [3500, 'Rating cannot exceed 3500'],
        index: true
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    // Additional metadata
    solvedCount: {
        type: Number,
        default: 0,
        min: [0, 'Solved count cannot be negative']
    },
    // URL to the problem (optional)
    url: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'URL must be a valid HTTP/HTTPS URL'
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound index for unique problem identification
cfProblemSchema.index({ contestId: 1, index: 1 }, { unique: true });

// Index for efficient rating-based queries
cfProblemSchema.index({ rating: 1 });

// Index for tag-based searches
cfProblemSchema.index({ tags: 1 });

// Virtual for problem URL if not provided
cfProblemSchema.virtual('problemUrl').get(function() {
    if (this.url) {
        return this.url;
    }
    return `https://codeforces.com/contest/${this.contestId}/problem/${this.index}`;
});

// Virtual for difficulty level based on rating
cfProblemSchema.virtual('difficulty').get(function() {
    if (!this.rating) return 'Unrated';
    
    if (this.rating < 1200) return 'Newbie';
    if (this.rating < 1400) return 'Pupil';
    if (this.rating < 1600) return 'Specialist';
    if (this.rating < 1900) return 'Expert';
    if (this.rating < 2100) return 'Candidate Master';
    if (this.rating < 2300) return 'Master';
    if (this.rating < 2400) return 'International Master';
    return 'Grandmaster';
});

// Static method to find problems by rating range
cfProblemSchema.statics.findByRatingRange = function(minRating, maxRating) {
    return this.find({
        rating: {
            $gte: minRating,
            $lte: maxRating
        }
    });
};

// Static method to find problems by tags
cfProblemSchema.statics.findByTags = function(tags) {
    return this.find({
        tags: { $in: tags }
    });
};

// Static method to get random problems
cfProblemSchema.statics.getRandomProblems = function(count = 10, filter = {}) {
    return this.aggregate([
        { $match: filter },
        { $sample: { size: count } }
    ]);
};

// Instance method to check if problem has specific tag
cfProblemSchema.methods.hasTag = function(tag) {
    return this.tags.includes(tag.toLowerCase());
};

// Pre-save middleware to ensure tags are lowercase
cfProblemSchema.pre('save', function(next) {
    if (this.tags && this.tags.length > 0) {
        this.tags = this.tags.map(tag => tag.toLowerCase().trim());
    }
    next();
});

const CFProblem = mongoose.model('CFProblem', cfProblemSchema);

export default CFProblem;
