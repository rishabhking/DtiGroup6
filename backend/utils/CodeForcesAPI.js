import fetch from 'node-fetch';
import CFProblem from '../models/CFProblem.js';

class CodeForcesAPI {
    static API_BASE_URL = 'https://codeforces.com/api';

    /**
     * Fetches the problem list from Codeforces API
     * @returns {Promise<Array>} - Array of problems
     */
    static async getProblemList() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/problemset.problems`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status !== 'OK') {
                throw new Error(`Codeforces API error: ${data.comment || 'Unknown error'}`);
            }
            
            return data.result.problems;
        } catch (error) {
            console.error('Error fetching problem list from Codeforces API:', error);
            throw error;
        }
    }
    
    /**
     * Get user's submissions from Codeforces API
     * @param {string} handle - Codeforces user handle
     * @returns {Promise<Array>} - Array of user submissions
     */
    static async getUserSubmissions(handle) {
        try {
            // Validate handle
            if (!handle || typeof handle !== 'string') {
                throw new Error('Invalid handle provided');
            }
            
            const response = await fetch(`${this.API_BASE_URL}/user.status?handle=${handle}`);
            

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status !== 'OK') {
                throw new Error(`Codeforces API error: ${data.comment || 'Unknown error'}`);
            }
            
            return data.result;
        } catch (error) {
            console.error(`Error fetching submissions for user ${handle}:`, error);
            throw error;
        }
    }/**
     * Updates the database with new problems from Codeforces (skips existing ones)
     * @returns {Promise<Object>} - Statistics about the update
     */
    static async updateProblemDatabase() {
        try {
            // Fetch problems from Codeforces API
            const problems = await this.getProblemList();
            
            // Format problems for our database
            const formattedProblems = problems.map(problem => ({
                contestId: problem.contestId,
                index: problem.index,
                name: problem.name,
                type: problem.type || 'PROGRAMMING',
                points: problem.points || null,
                rating: problem.rating || null,
                tags: problem.tags || []
            }));
            
            // Get existing problem IDs from database
            const existingProblems = await CFProblem.find({}, 'contestId index').lean();
            const existingProblemMap = new Map();
            
            existingProblems.forEach(problem => {
                const key = `${problem.contestId}-${problem.index}`;
                existingProblemMap.set(key, true);
            });
            
            // Filter out problems that already exist in the database
            const newProblems = formattedProblems.filter(problem => {
                const key = `${problem.contestId}-${problem.index}`;
                return !existingProblemMap.has(key);
            });
            
            if (newProblems.length === 0) {
                return {
                    success: true,
                    totalProblems: formattedProblems.length,
                    newProblems: 0,
                    message: 'No new problems to add'
                };
            }
            
            // Use insertMany for adding only new problems
            const result = await CFProblem.insertMany(newProblems);
            
            return {
                success: true,
                totalProblems: formattedProblems.length,
                newProblems: result.length,
                added: result.length,
                message: `Added ${result.length} new problems`
            };
        } catch (error) {
            console.error('Error updating problem database:', error);
            return {
                success: false,
                error: error.message
            };
        }    }
    
    /**
     * Fetches user information from Codeforces API
     * @param {string} handle - Codeforces user handle
     * @returns {Promise<Object>} - User information
     */
    static async getUserInfo(handle) {
        console.log("HII");
        try {
            // Validate handle
            if (!handle || typeof handle !== 'string') {
                throw new Error('Invalid handle provided');
            }
            
            const response = await fetch(`${this.API_BASE_URL}/user.info?handles=${handle}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(data);
            if (data.status !== 'OK') {
                throw new Error(`Codeforces API error: ${data.comment || 'Unknown error'}`);
            }
            
            // Return the first user from the result array
            return data.result && data.result.length > 0 ? data.result[0] : null;
        } catch (error) {
            console.error(`Error fetching information for user ${handle}:`, error);
            throw error;
        }
    }
}

export default CodeForcesAPI;
