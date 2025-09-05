const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Get all orders (admin only)
router.get('/', auth, authorize(['admin']), async (req, res) => {
  try {
    // Find all orders and populate customer and product details
    const orders = await Order.find({})
      .populate('customerId', 'name email phone')
      .populate({
        path: 'items.productId',
        select: 'name price imageUrl sellerId',
        populate: {
          path: 'sellerId',
          select: 'name email company'
        }
      })
      .sort({ createdAt: -1 }); // Most recent first
    
    // Return all orders
    res.json({
      success: true,
      count: orders.length,
      orders: orders
    });
  } catch (err) {
    console.error('Error fetching admin orders:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

  // Get order statistics for admin dashboard
router.get('/stats', auth, authorize(['admin']), async (req, res) => {
  try {
    // Get order counts by status
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);    // Get order counts by date range (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentOrderStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Get top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalQuantity: { $sum: '$items.quantity' },
          totalAmount: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $unwind: '$productDetails'
      },
      {
        $project: {
          _id: 1,
          totalQuantity: 1,
          totalAmount: 1,
          count: 1,
          productName: '$productDetails.name',
          productImage: '$productDetails.imageUrl',
          productCategory: '$productDetails.category'
        }
      }
    ]);
    
    // Return combined stats
    res.json({
      success: true,
      statusCounts,
      recentOrderStats,
      topProducts
    });
  } catch (err) {
    console.error('Error fetching order stats:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get a specific order by ID
router.get('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate({
        path: 'items.productId',
        select: 'name price imageUrl sellerId description',
        populate: {
          path: 'sellerId',
          select: 'name email company'
        }
      });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({
      success: true,
      order
    });
  } catch (err) {
    console.error(`Error fetching order ${req.params.id}:`, err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update order status
router.patch('/:id/status', auth, authorize(['admin']), async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status', 
        validStatuses 
      });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update status
    order.status = status;
    
    // If order is cancelled, add cancellation details
    if (status === 'cancelled') {
      order.cancellationReason = req.body.reason || 'Cancelled by admin';
      order.cancelledBy = 'admin';
      order.cancelledAt = new Date();
    }
    
    await order.save();
    
    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (err) {
    console.error(`Error updating order ${req.params.id} status:`, err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
