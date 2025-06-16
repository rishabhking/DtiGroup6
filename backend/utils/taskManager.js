import CodeForcesAPI from './CodeForcesAPI.js';
import CFProblem from '../models/CFProblem.js';

class TaskManager {
    /**
     * Gets a single problem filtered by rating range and not solved by any of the given handles
     * @param {number} ratingMin - Minimum rating of problem
     * @param {number} ratingMax - Maximum rating of problem
     * @param {Array<string>} handles - Array of Codeforces handles
     * @returns {Promise<Object|null>} - A single problem or null if none found
     */
    static async getSingleProblemByRatingAndUnsolved(ratingMin, ratingMax, handles) {
        try {
            // Ensure we have valid parameters
            if (!ratingMin || !ratingMax || !handles || !Array.isArray(handles) || handles.length === 0) {
                throw new Error('Invalid parameters: ratingMin, ratingMax, and handles array are required');
            }
            
            // Step 1: Get all submissions from the handles
            const submissionsPromises = handles.map(handle => 
                CodeForcesAPI.getUserSubmissions(handle)
            );
            
            let allSubmissions = [];
            try {
                const submissionsResults = await Promise.all(submissionsPromises);
                // Combine all submissions from all handles
                submissionsResults.forEach(submissions => {
                    if (submissions && Array.isArray(submissions)) {
                        allSubmissions = [...allSubmissions, ...submissions];
                    }
                });
            } catch (error) {
                console.error('Error fetching user submissions:', error);
                throw new Error('Failed to fetch submissions: ' + error.message);
            }
            
            // Step 2: Extract unique problem identifiers that have been solved
            const solvedProblems = new Set();
            allSubmissions.forEach(submission => {
                // Only consider successful submissions
                if (submission.verdict === 'OK') {
                    const key = `${submission.problem.contestId}-${submission.problem.index}`;
                    solvedProblems.add(key);
                }
            });
            
            // Step 3: Find problems in the rating range that haven't been solved
            const problems = await CFProblem.find({
                rating: { $gte: ratingMin, $lte: ratingMax }
            }).lean();
            
            // Filter out solved problems
            const unsolved = problems.filter(problem => {
                const key = `${problem.contestId}-${problem.index}`;
                return !solvedProblems.has(key);
            });
            
            // Step 4: Randomly select one problem
            if (unsolved.length === 0) {
                return null; // No unsolved problems found
            }
            
            // Get a random problem from the unsolved list
            const randomIndex = Math.floor(Math.random() * unsolved.length);
            return unsolved[randomIndex];
            
        } catch (error) {
            console.error('Error getting single problem:', error);
            throw error;
        }
    }
    
    /**
     * Gets multiple problems filtered by rating range and not solved by any of the given handles
     * @param {number} ratingMin - Minimum rating of problem
     * @param {number} ratingMax - Maximum rating of problem
     * @param {Array<string>} handles - Array of Codeforces handles
     * @param {number} count - Number of problems to return
     * @returns {Promise<Array>} - Array of problems
     */
    static async getMultipleProblems(ratingMin, ratingMax, handles, count = 5) {
        try {
            // Ensure we have valid parameters
            if (!ratingMin || !ratingMax || !handles || !Array.isArray(handles) || handles.length === 0) {
                throw new Error('Invalid parameters: ratingMin, ratingMax, and handles array are required');
            }
            
            // Step 1: Get all submissions from the handles
            const submissionsPromises = handles.map(handle => 
                CodeForcesAPI.getUserSubmissions(handle)
            );
            
            let allSubmissions = [];
            try {
                const submissionsResults = await Promise.all(submissionsPromises);
                // Combine all submissions from all handles
                submissionsResults.forEach(submissions => {
                    if (submissions && Array.isArray(submissions)) {
                        allSubmissions = [...allSubmissions, ...submissions];
                    }
                });
            } catch (error) {
                console.error('Error fetching user submissions:', error);
                throw new Error('Failed to fetch submissions: ' + error.message);
            }
            
            // Step 2: Extract unique problem identifiers that have been solved
            const solvedProblems = new Set();
            allSubmissions.forEach(submission => {
                // Only consider successful submissions
                if (submission.verdict === 'OK') {
                    const key = `${submission.problem.contestId}-${submission.problem.index}`;
                    solvedProblems.add(key);
                }
            });
            
            // Step 3: Find problems in the rating range that haven't been solved
            const problems = await CFProblem.find({
                rating: { $gte: ratingMin, $lte: ratingMax }
            }).lean();
            
            // Filter out solved problems
            const unsolved = problems.filter(problem => {
                const key = `${problem.contestId}-${problem.index}`;
                return !solvedProblems.has(key);
            });
            
            // Step 4: Randomly select 'count' problems
            if (unsolved.length === 0) {
                return []; // No unsolved problems found
            }
            
            // Shuffle the unsolved array
            const shuffled = [...unsolved].sort(() => 0.5 - Math.random());
            
            // Return the requested number of problems
            return shuffled.slice(0, count);
              } catch (error) {
            console.error('Error getting multiple problems:', error);
            throw error;
        }
    }
    
    /**
     * Fetches the latest submissions of a user for a specific problem
     * @param {string} handle - Codeforces user handle
     * @param {Object} problem - Problem object with contestId and index
     * @param {number} [limit=10] - Maximum number of submissions to return
     * @returns {Promise<Array>} - Array of submissions for the given problem
     */
    static async getUserSolves(handle, problem, limit = 10) {
        try {
            // Validate input parameters
            if (!handle || typeof handle !== 'string') {
                throw new Error('Invalid handle: Must provide a valid Codeforces user handle');
            }
            
            if (!problem || !problem.contestId || !problem.index) {
                throw new Error('Invalid problem: Must provide a problem with contestId and index');
            }
            
            // Get all user submissions
            const submissions = await CodeForcesAPI.getUserSubmissions(handle);
            
            if (!submissions || !Array.isArray(submissions)) {
                return [];
            }
            
            // Filter submissions for the specific problem
            const problemSubmissions = submissions.filter(sub => 
                sub.problem && 
                sub.problem.contestId === problem.contestId && 
                sub.problem.index === problem.index
            );
            

            // Sort by submission time (descending)
            problemSubmissions.sort((a, b) => b.creationTimeSeconds - a.creationTimeSeconds);
            console.log(problemSubmissions.slice(0, 1));
            // Return limited number of submissions
            return problemSubmissions.slice(0, limit);
        } catch (error) {
            console.error(`Error fetching submissions for user ${handle} on problem ${problem.contestId}-${problem.index}:`, error);
            throw error;
        }
    }
      /**
     * Verifies if a Codeforces handle is valid by checking if it exists
     * @param {string} handle - Codeforces user handle to verify
     * @returns {Promise<boolean>} - True if handle exists, false otherwise
     */
    static async isValidHandle(handle) {
        console.log("Hello!");
        try {
            // Validate input
            if (!handle || typeof handle !== 'string') {
                return false;
            }
            
            // Check if handle exists using Codeforces API
            try {
                const userInfo = await CodeForcesAPI.getUserInfo(handle);
                return userInfo && userInfo.handle === handle;
            } catch (error) {
                // If API returns error, handle is invalid
                console.log(`Handle verification failed for ${handle}: ${error.message}`);
                return false;
            }
        } catch (error) {
            console.error('Error in handle validation:', error);
            return false; // Return false on any error
        }
    }
    
    /**
     * Updates the problemset in the database by fetching problems from Codeforces API
     * @returns {Promise<Object>} - Result of the update operation
     */
    static async updateProblemset() {
        try {
            console.log('Updating problemset from Codeforces API...');
            
            // Call the updateProblemDatabase function from CodeForcesAPI
            const result = await CodeForcesAPI.updateProblemDatabase();
            
            console.log('Problemset update completed:', result);
            return result;
        } catch (error) {
            console.error('Error updating problemset:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default TaskManager;
