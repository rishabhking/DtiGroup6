import axios from 'axios';

// Update API URL to match the backend port
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Configure axios to include credentials (cookies) with requests
axios.defaults.withCredentials = true;

const ApiService = {
  // Authentication endpoints
  login: async (identifier, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        identifier,
        password
      });
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  signup: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, userData);
      return response.data;
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/logout`);
      return response.data;
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  updateProfile: async (updates) => {
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // General problem-related endpoints
  getProblems: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/problems`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching problems:', error);
      throw error;
    }
  },
  
  // CF Problems Router endpoints
  getAllCFProblems: async () => {
    try {
      const response = await axios.get(`${API_URL}/cf/problems`);
      return response.data;
    } catch (error) {
      console.error('Error fetching CF problems:', error);
      throw error;
    }
  },
  
  updateCFProblems: async () => {
    try {
      const response = await axios.post(`${API_URL}/cf/problems/update`);
      return response.data;
    } catch (error) {
      console.error('Error updating CF problems:', error);
      throw error;
    }
  },
  
  deleteCFProblems: async () => {
    try {
      const response = await axios.delete(`${API_URL}/cf/problems/delete`);
      return response.data;
    } catch (error) {
      console.error('Error deleting CF problems:', error);
      throw error;
    }
  },
  
  verifyCodeforcesHandle: async (handle) => {
    try {
      const response = await axios.get(`${API_URL}/cf/verify-handle/${handle}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying Codeforces handle:', error);
      throw error;
    }
  },
  
  getRandomProblems: async (problemRequest) => {
    try {
      const response = await axios.post(`${API_URL}/cf/random-problems`, problemRequest);
      return response.data;
    } catch (error) {
      console.error('Error fetching random problems:', error);
      throw error;
    }
  },
  
  // Task Manager endpoints
  getSingleProblem: async (requestData) => {
    try {
      const response = await axios.post(`${API_URL}/tasks/single-problem`, requestData);
      return response.data;
    } catch (error) {
      console.error('Error getting single problem:', error);
      throw error;
    }
  },
  
  getMultipleProblems: async (requestData) => {
    try {
      const response = await axios.post(`${API_URL}/tasks/multiple-problems`, requestData);
      return response.data;
    } catch (error) {
      console.error('Error getting multiple problems:', error);
      throw error;
    }
  },
  
  getUserSolves: async (handle, contestId, index, limit = 10) => {
    try {
      const response = await axios.get(`${API_URL}/tasks/user-solves/${handle}/${contestId}/${index}?limit=${limit}`);
    //   console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting user solves:', error);
      throw error;
    }
  },
    updateProblemset: async () => {
    try {
      const response = await axios.post(`${API_URL}/tasks/update-problemset`);
      return response.data;
    } catch (error) {
      console.error('Error updating problemset:', error);
      throw error;
    }
  },
    // Additional Task Manager endpoint for handle verification
  verifyHandle: async (handle) => {
    try {
      const response = await axios.get(`${API_URL}/tasks/verify-handle/${handle}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying handle with TaskManager:', error);
      throw error;
    }
  },

  // Duels API endpoints
  getAllDuels: async (limit = 20, skip = 0, sort = 'createdAt', order = 'desc', status = 'all') => {
    try {
      const response = await axios.get(`${API_URL}/duels`, { 
        params: { limit, skip, sort, order, status } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all duels:', error);
      throw error;
    }
  },

  getDuelsByStatus: async (status, limit = 20, skip = 0) => {
    try {
      const response = await axios.get(`${API_URL}/duels/status/${status}`, {
        params: { limit, skip }
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${status} duels:`, error);
      throw error;
    }
  },

  getDuelById: async (duelId) => {
    try {
      const response = await axios.get(`${API_URL}/duels/id/${duelId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching duel ${duelId}:`, error);
      throw error;
    }
  },

  getDuelsByHandle: async (handle) => {
    try {
      const response = await axios.get(`${API_URL}/duels/handle/${handle}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching duels for handle ${handle}:`, error);
      throw error;
    }
  },

  getDuelsByUserHandle: async (handle, status = 'all') => {
    try {
      const response = await axios.get(`${API_URL}/duels/user/${handle}`, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching user duels for handle ${handle}:`, error);
      throw error;
    }
  },

  createDuel: async (duelData) => {
    try {
      const response = await axios.post(`${API_URL}/duels`, duelData);
      return response.data;
    } catch (error) {
      console.error('Error creating duel:', error);
      throw error;
    }
  },

  joinDuel: async (duelId, handle) => {
    try {
      const response = await axios.put(`${API_URL}/duels/${duelId}/add-handle`, { handle });
      return response.data;
    } catch (error) {
      console.error(`Error joining duel ${duelId}:`, error);
      throw error;
    }
  },

  updateDuelStatus: async (duelId, status) => {
    try {
      const response = await axios.put(`${API_URL}/duels/${duelId}/update-status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for duel ${duelId}:`, error);
      throw error;
    }
  },

  markDuelAsGenerated: async (duelId) => {
    try {
      const response = await axios.put(`${API_URL}/duels/${duelId}/mark-generated`);
      return response.data;
    } catch (error) {
      console.error(`Error marking duel ${duelId} as generated:`, error);
      throw error;
    }
  },
  
  addProblemsToDuel: async (duelId, problems) => {
    try {
      const response = await axios.put(`${API_URL}/duels/${duelId}/add-problems`, { problems });
      return response.data;
    } catch (error) {
      console.error(`Error adding problems to duel ${duelId}:`, error);
      throw error;
    }
  },
  
  generateProblemsForDuel: async (duelId) => {
    try {
      const response = await axios.post(`${API_URL}/duels/${duelId}/generate-problems`);
      return response.data;
    } catch (error) {
      console.error(`Error generating problems for duel ${duelId}:`, error);
      throw error;
    }
  },

  updateDuelScore: async (duelId, handle, score) => {
    try {
      const response = await axios.put(`${API_URL}/duels/${duelId}/update-score`, { handle, score });
      return response.data;
    } catch (error) {
      console.error(`Error updating score for duel ${duelId}:`, error);
      throw error;
    }
  },

  startDuel: async (duelId, creatorHandle) => {
    try {
      const response = await axios.put(`${API_URL}/duels/${duelId}/start`, { creatorHandle });
      return response.data;
    } catch (error) {
      console.error(`Error starting duel ${duelId}:`, error);
      throw error;
    }  },

  getDuelCountdown: async (duelId) => {
    try {
      const response = await axios.get(`${API_URL}/duels/${duelId}/countdown`);
      return response.data;
    } catch (error) {
      console.error(`Error getting countdown for duel ${duelId}:`, error);
      throw error;
    }
  },

  getDuelStatus: async (duelId) => {
    try {
      const response = await axios.get(`${API_URL}/duels/${duelId}/status`);
      return response.data;
    } catch (error) {
      console.error(`Error getting status for duel ${duelId}:`, error);
      throw error;
    }
  },

  // Get Codeforces user info by handle
  getCodeforcesUserInfo: async (handle) => {
    try {
      const response = await axios.get(`${API_URL}/cf/user-info/${handle}`);
      return response.data;
    } catch (error) {
      console.error('Error getting Codeforces user info:', error);
      throw error;
    }
  },

  // Get current user's performance metric
  getUserPerformance: async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/performance`);
      return response.data;
    } catch (error) {
      console.error('Error getting user performance:', error);
      throw error;
    }
  },

  // Update user's performance after practice session
  updateUserPerformance: async (problemsSolved) => {
    try {
      const response = await axios.post(`${API_URL}/auth/performance`, { problemsSolved });
      return response.data;
    } catch (error) {
      console.error('Error updating user performance:', error);
      throw error;
    }
  },
};

// Axios interceptor for adding auth token to requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default ApiService;
