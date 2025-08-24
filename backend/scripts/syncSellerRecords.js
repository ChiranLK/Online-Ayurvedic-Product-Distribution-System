/**
 * This script synchronizes seller records with user records.
 * It ensures that every user with role='seller' has a corresponding entry in the Seller collection.
 */
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from .env file
console.log('Loading environment variables...');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set!');
  console.log('Make sure you have a .env file in the backend directory with MONGODB_URI.');
  process.exit(1);
}

console.log('MongoDB URI found in environment variables.');

// Import models
const User = require('../models/User');
const Seller = require('../models/Seller');

// Connect to MongoDB
console.log(`Attempting to connect to MongoDB at ${process.env.MONGODB_URI.substring(0, 20)}...`);
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

db.once('open', async () => {
  console.log('✅ Connected to MongoDB successfully');
  
  try {
    console.log('Searching for users with seller role...');
    // Find all users with seller role
    const sellerUsers = await User.find({ role: 'seller' });
    console.log(`Found ${sellerUsers.length} users with seller role`);
    
    if (sellerUsers.length === 0) {
      console.log('No seller users found in the database.');
      mongoose.connection.close();
      return;
    }
    
    console.log('\nSeller users found:');
    sellerUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ID: ${user._id}`);
    });
    console.log('\nChecking for corresponding seller records...');
    
    let created = 0;
    let alreadyExists = 0;
    
    // Create seller records for each seller user if they don't already exist
    for (const user of sellerUsers) {
      const existingSeller = await Seller.findOne({ userId: user._id });
      
      if (!existingSeller) {
        await Seller.create({
          userId: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city || '',
          state: user.state || '',
          zipcode: user.zipcode || '',
          status: user.isApproved ? 'approved' : 'pending'
        });
        console.log(`Created seller record for ${user.name} (${user.email})`);
        created++;
      } else {
        console.log(`Seller record already exists for ${user.name} (${user.email})`);
        alreadyExists++;
      }
    }
    
    console.log(`Synchronization complete: ${created} records created, ${alreadyExists} records already existed`);
  } catch (error) {
    console.error('Error synchronizing seller records:', error);
  } finally {
    mongoose.connection.close();
  }
});
