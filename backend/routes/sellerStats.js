const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// @route   GET /api/seller/stats
// @desc    Get seller product statistics
// @access  Private/Seller
router.get('/stats', auth, async (req, res) => {
  try {
    // Check if user is a seller
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Access denied. Only sellers can view these stats.' });
    }

    // Get all products for this seller
    const products = await Product.find({ sellerId: req.user.id });
    
    // Calculate statistics
    const total = products.length;
    const active = products.filter(product => product.isActive && product.countInStock > 0).length;
    const outOfStock = products.filter(product => product.countInStock === 0).length;
    
    res.status(200).json({
      success: true,
      data: {
        total,
        active,
        outOfStock
      }
    });
  } catch (error) {
    console.error('Error getting seller stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
