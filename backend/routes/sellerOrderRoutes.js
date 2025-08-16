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
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can access this route' });
    }

    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phone address')
      .populate('items.productId', 'name price imageUrl');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Find products owned by this seller
    const sellerProducts = await Product.find({ sellerId: req.user.id });
    const productIds = sellerProducts.map(product => product._id.toString());
    
    // Check if any products in the order belong to this seller
    const hasSellerProducts = order.items.some(item => 
      productIds.includes(item.productId._id.toString())
    );
    
    if (!hasSellerProducts) {
      return res.status(403).json({ message: 'This order does not contain any of your products' });
    }
    
    // Filter order items to include only this seller's products
    const sellerItems = order.items.filter(item => 
      productIds.includes(item.productId._id.toString())
    );
    
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
    
    const { productId, status } = req.body;
    if (!productId || !status) {
      return res.status(400).json({ message: 'Product ID and status are required' });
    }
    
    // Check if the product belongs to this seller
    const product = await Product.findById(productId);
    if (!product || product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own products' });
    }
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Find the item in the order
    const itemIndex = order.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex === -1) {
      return res.status(400).json({ message: 'Product not found in this order' });
    }
    
    // Update the status
    order.items[itemIndex].status = status;
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

module.exports = router;
