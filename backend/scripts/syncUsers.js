/**
 * Script to sync existing users to Customer and Seller collections
 * 
 * This script will:
 * 1. Find all users with role 'customer' and create entries in the Customer collection
 * 2. Find all users with role 'seller' and create entries in the Seller collection
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '../.env' });

// Models
const User = require('../models/User');
const Customer = require('../models/Customer');
const Seller = require('../models/Seller');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function() {
  console.log('Connected to MongoDB');
  
  try {
    // Sync customers
    console.log('Syncing customers...');
    const customerUsers = await User.find({ role: 'customer' });
    console.log(`Found ${customerUsers.length} customer users`);
    
    for (const user of customerUsers) {
      // Check if customer already exists
      const existingCustomer = await Customer.findOne({ email: user.email });
      
      if (!existingCustomer) {
        // We need to get the user with password
        const userWithPassword = await User.findById(user._id).select('+password');
        
        const newCustomer = new Customer({
          userId: user._id,
          name: user.name,
          email: user.email,
          password: userWithPassword ? userWithPassword.password : 'placeholder-password', // Use placeholder if needed
          phone: user.phone,
          address: user.address,
          city: user.city,
          state: user.state,
          zipcode: user.zipcode
        });
        
        await newCustomer.save();
        console.log(`Created customer for user: ${user.email}`);
      } else {
        console.log(`Customer already exists for: ${user.email}`);
      }
    }
    
    // Sync sellers
    console.log('Syncing sellers...');
    const sellerUsers = await User.find({ role: 'seller' });
    console.log(`Found ${sellerUsers.length} seller users`);
    
    for (const user of sellerUsers) {
      // Check if seller already exists
      const existingSeller = await Seller.findOne({ email: user.email });
      
      if (!existingSeller) {
        const newSeller = new Seller({
          userId: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city,
          state: user.state,
          zipcode: user.zipcode,
          status: user.status
        });
        
        await newSeller.save();
        console.log(`Created seller for user: ${user.email}`);
      } else {
        console.log(`Seller already exists for: ${user.email}`);
      }
    }
    
    console.log('Sync completed successfully');
  } catch (error) {
    console.error('Error during sync:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
});
