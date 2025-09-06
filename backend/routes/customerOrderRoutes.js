const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

/**
 * @route   GET /api/customers/:id/orders
 * @desc    Get orders for a specific customer
 * @access  Private (Customer only)
 */
router.get('/:id/orders', auth, async (req, res) => {
  try {
    // Ensure the logged-in user is requesting their own orders
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ 
        message: 'Access denied. You can only view your own orders.' 
      });
    }

    // Get all orders for this customer
    const orders = await Order.find({ customerId: req.params.id })
      .populate('items.productId', 'name price imageUrl')
      .populate('items.sellerId', 'name email')
      .sort({ orderDate: -1 });
    
    // Format the orders for the frontend
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      createdAt: order.orderDate,
      status: order.status,
      products: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      totalPrice: order.totalAmount,
      paymentMethod: order.paymentMethod || 'cod',
      shippingAddress: {
        street: order.deliveryAddress.split(',')[0] || '',
        city: order.deliveryAddress.split(',')[1] || '',
        state: order.deliveryAddress.split(',')[2] || '',
        zipCode: order.deliveryAddress.split(',')[3] || ''
      }
    }));

    res.json({
      success: true,
      orders: formattedOrders
    });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/customers/:id/orders/:orderId
 * @desc    Get a specific order for a customer
 * @access  Private (Customer only)
 */
router.get('/:id/orders/:orderId', auth, async (req, res) => {
  try {
    // Ensure the logged-in user is requesting their own order
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ 
        message: 'Access denied. You can only view your own orders.' 
      });
    }

    // Find the specific order
    const order = await Order.findOne({ 
      _id: req.params.orderId,
      customerId: req.params.id
    })
      .populate('items.productId', 'name price imageUrl')
      .populate('items.sellerId', 'name email');
    
    if (!order) {
      return res.status(404).json({ 
        message: 'Order not found' 
      });
    }

    // Format the order for the frontend
    const formattedOrder = {
      _id: order._id,
      createdAt: order.orderDate,
      status: order.status,
      products: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        productId: item.productId._id,
        sellerId: item.sellerId._id,
        sellerName: item.sellerId.name
      })),
      totalPrice: order.totalAmount,
      paymentMethod: order.paymentMethod || 'cod',
      shippingAddress: {
        street: order.deliveryAddress.split(',')[0] || '',
        city: order.deliveryAddress.split(',')[1] || '',
        state: order.deliveryAddress.split(',')[2] || '',
        zipCode: order.deliveryAddress.split(',')[3] || ''
      }
    };

    res.json({
      success: true,
      order: formattedOrder
    });
  } catch (error) {
    console.error('Error fetching customer order:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;
