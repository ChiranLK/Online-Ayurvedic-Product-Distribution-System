const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// Create a new order (protected route)
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received order data:', req.body);
    
    // Validate required fields
    if (!req.body.customerId || !req.body.items || !req.body.totalAmount || !req.body.deliveryAddress) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        requiredFields: ['customerId', 'items', 'totalAmount', 'deliveryAddress'],
        received: {
          customerId: req.body.customerId ? 'provided' : 'missing',
          items: req.body.items ? `provided (${req.body.items.length} items)` : 'missing',
          totalAmount: req.body.totalAmount ? 'provided' : 'missing',
          deliveryAddress: req.body.deliveryAddress ? 'provided' : 'missing'
        }
      });
    }
    
    // Get user ID from auth middleware
    const userId = req.user._id;
    console.log('Authenticated user ID:', userId);
    console.log('Request body customerId:', req.body.customerId);
    
    // Validate user is ordering for themselves or is admin
    if (req.user.role !== 'admin' && req.body.customerId && req.body.customerId !== userId.toString()) {
      console.log('User attempted to place order for another customer');
      return res.status(403).json({ 
        message: 'You can only place orders for your own account' 
      });
    }
    
    // Format and validate product IDs
    const formattedItems = req.body.items.map(item => {
      // Ensure productId is a valid ObjectId
      if (typeof item.productId === 'string' && !mongoose.Types.ObjectId.isValid(item.productId)) {
        throw new Error(`Invalid productId format: ${item.productId}`);
      }
      
      // Ensure sellerId is a valid ObjectId if provided
      if (item.sellerId && typeof item.sellerId === 'string' && !mongoose.Types.ObjectId.isValid(item.sellerId)) {
        throw new Error(`Invalid sellerId format: ${item.sellerId}`);
      }
      
      // Format the item data
      return {
        productId: item.productId,
        sellerId: item.sellerId,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      };
    });
    
    // Log the formatted items for debugging
    console.log('Formatted items:', formattedItems);
    
    // Create order with formatted items and use the authenticated user's ID as the customerId
    // This ensures orders are always associated with the authenticated user
    const orderData = {
      ...req.body,
      customerId: userId, // Use the authenticated user's ID from token
      items: formattedItems
    };
    
    console.log('Creating order with data:', orderData);
    const order = new Order(orderData);
    await order.save();
    console.log('Order saved successfully with ID:', order._id);
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(400).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack
    });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customerId', 'name email')
      .populate('items.productId', 'name price image description')
      .populate('items.sellerId', 'name email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email')
      .populate('items.productId', 'name price image description')
      .populate('items.sellerId', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an order
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('customerId', 'name email')
      .populate('items.productId', 'name price image description')
      .populate('items.sellerId', 'name email');
      
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
