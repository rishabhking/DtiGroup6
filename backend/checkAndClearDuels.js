import mongoose from 'mongoose';
import Duel from './models/Duel.js';

const checkAndClearDuels = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/codingsphere');
    console.log('Connected to MongoDB');
    
    // First, let's see what's in the database
    const duels = await Duel.find({});
    console.log(`Found ${duels.length} duels in the database:`);
    
    duels.forEach((duel, index) => {
      console.log(`${index + 1}. ID: ${duel.duelId}, Name: ${duel.name}, Creator: ${duel.creatorHandle}`);
    });
    
    if (duels.length > 0) {
      console.log('\nClearing all duels...');
      const result = await Duel.deleteMany({});
      console.log(`Successfully deleted ${result.deletedCount} duels from the database`);
      
      // Verify deletion
      const remainingDuels = await Duel.find({});
      console.log(`Remaining duels: ${remainingDuels.length}`);
    } else {
      console.log('No duels found in the database');
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkAndClearDuels();
