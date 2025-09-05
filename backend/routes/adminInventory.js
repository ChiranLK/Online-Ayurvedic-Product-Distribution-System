const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Get inventory data for admin
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    console.log('Admin inventory endpoint called');
    
    // Get all products with populated seller information
    const products = await Product.find()
      .populate('sellerId', 'name email phone')
      .populate('category', 'name');
    
    // Log the first product's sellerId to debug
    if (products.length > 0) {
      console.log('First product sellerId:', products[0].sellerId);
    }
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching admin inventory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
