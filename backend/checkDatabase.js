import mongoose from 'mongoose';

const checkDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/codingsphere');
    console.log('Connected to MongoDB');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in the database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Check duels collection specifically
    const duelsCollection = mongoose.connection.db.collection('duels');
    const duelCount = await duelsCollection.countDocuments();
    console.log(`\nDocuments in 'duels' collection: ${duelCount}`);
    
    if (duelCount > 0) {
      const duels = await duelsCollection.find({}).toArray();
      console.log('Duels found:');
      duels.forEach((duel, index) => {
        console.log(`${index + 1}. ID: ${duel.duelId || duel._id}, Name: ${duel.name}, Creator: ${duel.creatorHandle}`);
      });
      
      // Clear them
      console.log('\nClearing all duels...');
      const result = await duelsCollection.deleteMany({});
      console.log(`Successfully deleted ${result.deletedCount} duels`);
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

checkDatabase();
