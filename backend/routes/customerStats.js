const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// @route   GET /api/customer/stats
// @desc    Get customer order statistics
// @access  Private/Customer
router.get('/stats', auth, async (req, res) => {
  try {
    // Check if user is a customer
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access denied. Only customers can view these stats.' });
    }

    // Get all orders for this customer
    const orders = await Order.find({ customerId: req.user.id });
    
    // Calculate statistics
    const total = orders.length;
    const pending = orders.filter(order => 
      ['processing', 'shipped', 'pending'].includes(order.status)
    ).length;
    const delivered = orders.filter(order => order.status === 'delivered').length;
    
    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        delivered
      }
    });
  } catch (error) {
    console.error('Error getting customer stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
