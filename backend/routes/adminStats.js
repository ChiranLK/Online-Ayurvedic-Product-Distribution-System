const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/', auth, async (req, res) => {
  try {
    console.log('Admin stats endpoint called by user:', req.user?.name, 'Role:', req.user?.role);
    
    // Check if user is an admin
    if (req.user.role !== 'admin') {
      console.log('Access denied: User is not admin');
      return res.status(403).json({ message: 'Access denied. Only administrators can view these stats.' });
    }

    // Get counts from database
    const customers = await User.countDocuments({ role: 'customer' });
    const sellers = await User.countDocuments({ role: 'seller' });
    const products = await Product.countDocuments();
    const orders = await Order.countDocuments();
    
    // Get count of sellers awaiting approval
    const pendingSellers = await User.countDocuments({ 
      role: 'seller', 
      status: { $in: ['pending', 'review'] }
    });
    
    const statsResponse = {
      success: true,
      totalCustomers: customers,
      totalSellers: sellers,
      totalProducts: products,
      totalOrders: orders,
      pendingSellers
    };
    
    console.log('Admin stats response:', statsResponse);
    
    res.status(200).json(statsResponse);
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
