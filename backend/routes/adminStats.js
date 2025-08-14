const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/stats', auth, async (req, res) => {
  try {
    // Check if user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only administrators can view these stats.' });
    }

    // Get counts from database
    const users = await User.countDocuments();
    const products = await Product.countDocuments();
    const orders = await Order.countDocuments();
    
    // Get count of sellers awaiting approval
    const pendingSellers = await User.countDocuments({ 
      role: 'seller', 
      status: { $in: ['pending', 'review'] }
    });
    
    res.status(200).json({
      success: true,
      data: {
        users,
        products,
        orders,
        pendingSellers
      }
    });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
