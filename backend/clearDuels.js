import mongoose from 'mongoose';
import Duel from './models/Duel.js';

const clearDuels = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/codingsphere');
    console.log('Connected to MongoDB');
    
    const result = await Duel.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} duels from the database`);
    
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing duels:', error);
    process.exit(1);
  }
};

clearDuels();
