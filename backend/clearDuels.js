import mongoose from 'mongoose';
import Duel from './models/Duel.js';

const clearDuels = async () => {
  try {
    // Connect to MongoDB (adjust connection string if needed)
    await mongoose.connect('mongodb://localhost:27017/codingsphere');
    console.log('Connected to MongoDB');
    
    // Delete all duels
    const result = await Duel.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} duels from the database`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing duels:', error);
    process.exit(1);
  }
};

clearDuels();
