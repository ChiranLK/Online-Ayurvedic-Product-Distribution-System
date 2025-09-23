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

// Update an order (requires auth)
router.put('/:id', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    console.log(`User ${userId} with role ${userRole} is updating order ${req.params.id}`);
    
    // Find the order
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check permissions
    const isCustomerOrder = order.customerId.toString() === userId.toString();
    const isSellerOrder = order.items.some(item => item.sellerId && item.sellerId.toString() === userId.toString());
    
    if (!isCustomerOrder && !isSellerOrder && userRole !== 'admin') {
      console.log('Access denied - user has no permission to update this order');
      return res.status(403).json({ message: 'Access denied - you do not have permission to update this order' });
    }
    
    // Check order status - only Pending or Processing can be edited by customers
    if (userRole === 'customer' && !['Pending', 'Processing'].includes(order.status)) {
      console.log(`Customer tried to edit order with status ${order.status}`);
      return res.status(400).json({ message: `Orders with status "${order.status}" cannot be edited` });
    }
    
    // Different update logic based on role
    if (userRole === 'customer') {
      // Customers can only update shipping address, notes, and item quantities
      if (req.body.shippingAddress) order.shippingAddress = req.body.shippingAddress;
      if (req.body.notes) order.notes = req.body.notes;
      
      // Update items if provided
      if (req.body.items && req.body.items.length > 0) {
        for (const updatedItem of req.body.items) {
          const orderItem = order.items.find(
            item => item.productId.toString() === updatedItem.productId
          );
          
          if (orderItem) {
            // Update quantity if different
            if (orderItem.quantity !== updatedItem.quantity) {
              orderItem.quantity = updatedItem.quantity;
            }
          }
        }
        
        // Recalculate total amount
        order.totalAmount = order.items.reduce(
          (total, item) => total + (item.price * item.quantity), 0
        );
      }
      
      // Add history entry
      order.history = order.history || [];
      order.history.push({
        date: new Date(),
        status: order.status,
        note: 'Order updated by customer'
      });
    } else {
      // Admins and sellers can update status and other fields
      if (req.body.status) order.status = req.body.status;
      if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;
      if (req.body.notes) order.notes = req.body.notes;
      if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;
      
      // Add history entry
      order.history = order.history || [];
      order.history.push({
        date: new Date(),
        status: req.body.status || order.status,
        note: `Order updated by ${userRole}`
      });
    }
    
    await order.save();
    
    // Return the updated order with populated fields
    const updatedOrder = await Order.findById(order._id)
      .populate('customerId', 'name email')
      .populate('items.productId', 'name price image description')
      .populate('items.sellerId', 'name email');
      
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
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
