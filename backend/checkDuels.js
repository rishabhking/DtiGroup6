import mongoose from 'mongoose';
import Duel from './models/Duel.js';

const checkDuels = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/codingsphere3');
        console.log('Connected to MongoDB');
        
        const duels = await Duel.find({}).limit(3);
        console.log(`Found ${duels.length} duels`);
        
        duels.forEach((duel, index) => {
            console.log(`\nDuel ${index + 1}:`);
            console.log('  duelId:', duel.duelId);
            console.log('  name:', duel.name);
            console.log('  createdAt:', duel.createdAt);
            console.log('  scheduledStartTime:', duel.scheduledStartTime);
            console.log('  duelDurationMinutes:', duel.duelDurationMinutes);
            console.log('  startTime:', duel.startTime);
            console.log('  status:', duel.status);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkDuels();
