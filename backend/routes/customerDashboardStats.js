const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

/**
 * @route   GET /api/customers/:id/stats
 * @desc    Get customer dashboard statistics
 * @access  Private (Customer only)
 */
router.get('/:id/stats', auth, authorize('customer'), async (req, res) => {
  try {
    // Ensure the logged-in user is requesting their own data
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied. You can only view your own stats.' });
    }

    // Find the customer to get wishlist count
    const customer = await Customer.findOne({ userId: req.user.id });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Get the wishlist count
    const wishlistItems = customer.wishlist ? customer.wishlist.length : 0;
    
    // Get all orders for this customer
    const orders = await Order.find({ customerId: req.user.id });
    
    // Calculate order statistics
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const shippedOrders = orders.filter(order => order.status === 'shipped').length;
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
    
    // Return all stats
    res.json({
      totalOrders,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      wishlistItems
    });
  } catch (error) {
    console.error('Error getting customer stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
