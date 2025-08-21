const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

/**
 * @route   GET /api/wishlist
 * @desc    Get the current user's wishlist
 * @access  Private (Customer only)
 */
router.get('/', auth, authorize('customer'), async (req, res) => {
  try {
    // Find the customer document associated with the logged-in user
    const customer = await Customer.findOne({ userId: req.user.id }).populate('wishlist');
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Return the wishlist items
    res.json({ wishlist: customer.wishlist });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/wishlist/:productId
 * @desc    Add a product to the wishlist
 * @access  Private (Customer only)
 */
router.post('/:productId', auth, authorize('customer'), async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Find the customer
    const customer = await Customer.findOne({ userId: req.user.id });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Check if the product is already in the wishlist
    if (customer.wishlist.includes(productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }
    
    // Add product to wishlist
    customer.wishlist.push(productId);
    await customer.save();
    
    // Return updated wishlist
    const updatedCustomer = await Customer.findOne({ userId: req.user.id }).populate('wishlist');
    res.json({ wishlist: updatedCustomer.wishlist, message: 'Product added to wishlist' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/wishlist/:productId
 * @desc    Remove a product from the wishlist
 * @access  Private (Customer only)
 */
router.delete('/:productId', auth, authorize('customer'), async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Find the customer
    const customer = await Customer.findOne({ userId: req.user.id });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Check if product is in wishlist
    if (!customer.wishlist.includes(productId)) {
      return res.status(400).json({ message: 'Product not in wishlist' });
    }
    
    // Remove product from wishlist
    customer.wishlist = customer.wishlist.filter(id => id.toString() !== productId);
    await customer.save();
    
    // Return updated wishlist
    const updatedCustomer = await Customer.findOne({ userId: req.user.id }).populate('wishlist');
    res.json({ wishlist: updatedCustomer.wishlist, message: 'Product removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/wishlist
 * @desc    Clear the entire wishlist
 * @access  Private (Customer only)
 */
router.delete('/', auth, authorize('customer'), async (req, res) => {
  try {
    // Find the customer
    const customer = await Customer.findOne({ userId: req.user.id });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Clear wishlist
    customer.wishlist = [];
    await customer.save();
    
    res.json({ message: 'Wishlist cleared' });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
