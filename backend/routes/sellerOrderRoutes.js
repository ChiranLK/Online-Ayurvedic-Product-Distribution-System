const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Get all orders for a seller
router.get('/my-orders', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can access this route' });
    }

    // Find products owned by this seller
    const sellerProducts = await Product.find({ sellerId: req.user.id });
    const productIds = sellerProducts.map(product => product._id);
    
    // Find orders that contain any of the seller's products
    const orders = await Order.find({
      'items.productId': { $in: productIds }
    })
    .populate('customerId', 'name email')
    .populate('items.productId', 'name price');
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get details of a specific order for a seller
router.get('/order/:id', auth, async (req, res) => {
  try {
    console.log(`Seller order detail request for order ${req.params.id} by user ${req.user.id}`);
    
    if (req.user.role !== 'seller') {
      console.log('Access denied: User is not a seller');
      return res.status(403).json({ message: 'Only sellers can access this route' });
    }

    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phone address')
      .populate('items.productId', 'name price imageUrl');
    
    if (!order) {
      console.log(`Order ${req.params.id} not found`);
      return res.status(404).json({ message: 'Order not found' });
    }
    
    console.log('Order found:', order._id);
    console.log('Order items:', order.items.length);
    
    // Find products owned by this seller
    const sellerProducts = await Product.find({ sellerId: req.user.id });
    console.log(`Found ${sellerProducts.length} products for seller ${req.user.id}`);
    const productIds = sellerProducts.map(product => product._id.toString());
    
    // Debug the item.productId values to understand what format they're in
    order.items.forEach((item, index) => {
      console.log(`Item ${index} productId:`, item.productId);
      console.log(`Item ${index} productId type:`, typeof item.productId);
      if (item.productId) {
        console.log(`Item ${index} productId._id:`, item.productId._id);
        console.log(`Item ${index} productId._id type:`, typeof item.productId._id);
      }
    });
    
    // Check if any products in the order belong to this seller
    const hasSellerProducts = order.items.some(item => {
      // Handle both string IDs and object IDs
      const itemProductId = item.productId && item.productId._id 
        ? item.productId._id.toString() 
        : (typeof item.productId === 'string' ? item.productId : item.productId?.toString());
        
      console.log(`Checking if item productId ${itemProductId} is in seller's products`);
      return productIds.includes(itemProductId);
    });
    
    console.log(`Order ${req.params.id} has seller products:`, hasSellerProducts);
    
    if (!hasSellerProducts) {
      console.log(`Order ${req.params.id} does not contain any products from seller ${req.user.id}`);
      return res.status(403).json({ message: 'This order does not contain any of your products' });
    }
    
    // Filter order items to include only this seller's products
    const sellerItems = order.items.filter(item => {
      // Handle both string IDs and object IDs
      const itemProductId = item.productId && item.productId._id 
        ? item.productId._id.toString() 
        : (typeof item.productId === 'string' ? item.productId : item.productId?.toString());
        
      return productIds.includes(itemProductId);
    });
    
    console.log(`Found ${sellerItems.length} items from seller ${req.user.id} in order ${req.params.id}`);
    
    const sellerOrderData = {
      ...order._doc,
      items: sellerItems
    };
    
    res.json({
      success: true,
      data: sellerOrderData
    });
  } catch (error) {
    console.error('Get seller order error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update the status of seller's products in an order
router.put('/order/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can access this route' });
    }
    
    const { status, productId } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Find products owned by this seller
    const sellerProducts = await Product.find({ sellerId: req.user.id });
    const productIds = sellerProducts.map(product => product._id.toString());
    
    // Check if any products in the order belong to this seller
    const hasSellerProducts = order.items.some(item => 
      productIds.includes(item.productId.toString())
    );
    
    if (!hasSellerProducts) {
      return res.status(403).json({ message: 'This order does not contain any of your products' });
    }
    
    // If a specific product ID is provided, only update that item
    if (productId) {
      // Check if the product belongs to this seller
      if (!productIds.includes(productId)) {
        return res.status(403).json({ message: 'You can only update your own products' });
      }
      
      // Find the item in the order
      const itemIndex = order.items.findIndex(item => item.productId.toString() === productId);
      if (itemIndex === -1) {
        return res.status(400).json({ message: 'Product not found in this order' });
      }
      
      // Update the status for this specific item
      order.items[itemIndex].status = status;
    } else {
      // Update overall order status
      order.status = status;
    }
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update seller order status error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add a history entry to an order
router.post('/order/:id/history', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can access this route' });
    }
    
    const { status, note } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Find products owned by this seller
    const sellerProducts = await Product.find({ sellerId: req.user.id });
    const productIds = sellerProducts.map(product => product._id.toString());
    
    // Check if any products in the order belong to this seller
    const hasSellerProducts = order.items.some(item => 
      productIds.includes(item.productId.toString())
    );
    
    if (!hasSellerProducts) {
      return res.status(403).json({ message: 'This order does not contain any of your products' });
    }
    
    // Add history entry
    if (!order.history) {
      order.history = [];
    }
    
    order.history.push({
      date: new Date(),
      status,
      note: note || `Status updated to ${status} by seller`
    });
    
    // Update the order status
    order.status = status;
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Order history updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order history error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
