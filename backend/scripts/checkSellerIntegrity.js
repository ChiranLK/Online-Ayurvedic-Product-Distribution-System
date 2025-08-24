/**
 * This script performs a deep check between User and Seller collections.
 * It ensures data consistency and helps identify any issues.
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
    // Step 1: Get all sellers from both collections
    console.log('Fetching all seller users and seller records...');
    const sellerUsers = await User.find({ role: 'seller' });
    const sellerRecords = await Seller.find();
    
    console.log(`Found ${sellerUsers.length} users with seller role`);
    console.log(`Found ${sellerRecords.length} records in Seller collection`);
    
    // Step 2: Check for users with seller role but no seller record
    console.log('\n1. CHECKING FOR MISSING SELLER RECORDS:');
    let missingSellers = [];
    
    for (const user of sellerUsers) {
      const existingSeller = sellerRecords.find(seller => 
        seller.userId && seller.userId.toString() === user._id.toString());
      
      if (!existingSeller) {
        missingSellers.push(user);
        console.log(`   ❌ User ${user.name} (${user.email}) is marked as seller but has no seller record`);
      }
    }
    
    if (missingSellers.length === 0) {
      console.log('   ✅ All users with seller role have corresponding seller records');
    }
    
    // Step 3: Check for seller records without a matching user
    console.log('\n2. CHECKING FOR ORPHANED SELLER RECORDS:');
    let orphanedSellers = [];
    
    for (const seller of sellerRecords) {
      if (!seller.userId) {
        orphanedSellers.push(seller);
        console.log(`   ❌ Seller record for ${seller.name} (${seller.email}) has no userId reference`);
        continue;
      }
      
      const existingUser = sellerUsers.find(user => user._id.toString() === seller.userId.toString());
      
      if (!existingUser) {
        orphanedSellers.push(seller);
        console.log(`   ❌ Seller record for ${seller.name} (${seller.email}) references a non-seller user or deleted user`);
      }
    }
    
    if (orphanedSellers.length === 0) {
      console.log('   ✅ All seller records have corresponding users with seller role');
    }
    
    // Step 4: Check for data inconsistencies between matching records
    console.log('\n3. CHECKING FOR DATA INCONSISTENCIES:');
    let inconsistentRecords = [];
    
    for (const user of sellerUsers) {
      const matchingSeller = sellerRecords.find(seller => 
        seller.userId && seller.userId.toString() === user._id.toString());
      
      if (matchingSeller) {
        const inconsistencies = [];
        
        // Check basic fields
        if (user.name !== matchingSeller.name) inconsistencies.push('name');
        if (user.email !== matchingSeller.email) inconsistencies.push('email');
        if (user.phone !== matchingSeller.phone) inconsistencies.push('phone');
        if (user.address !== matchingSeller.address) inconsistencies.push('address');
        
        if (inconsistencies.length > 0) {
          inconsistentRecords.push({user, seller: matchingSeller, fields: inconsistencies});
          console.log(`   ❌ Inconsistencies found for ${user.name} (${user.email}): ${inconsistencies.join(', ')}`);
        }
      }
    }
    
    if (inconsistentRecords.length === 0) {
      console.log('   ✅ All matching records have consistent data');
    }
    
    // Summary
    console.log('\nSUMMARY:');
    console.log(`- Total users with seller role: ${sellerUsers.length}`);
    console.log(`- Total seller records: ${sellerRecords.length}`);
    console.log(`- Missing seller records: ${missingSellers.length}`);
    console.log(`- Orphaned seller records: ${orphanedSellers.length}`);
    console.log(`- Records with inconsistencies: ${inconsistentRecords.length}`);
    
    if (missingSellers.length > 0 || orphanedSellers.length > 0 || inconsistentRecords.length > 0) {
      console.log('\n⚠️ Issues were found. Would you like to fix them automatically? (This would require updating the script)');
    } else {
      console.log('\n✅ All checks passed! The User and Seller collections are in sync.');
    }
    
  } catch (error) {
    console.error('Error checking seller records:', error);
  } finally {
    mongoose.connection.close();
  }
});
