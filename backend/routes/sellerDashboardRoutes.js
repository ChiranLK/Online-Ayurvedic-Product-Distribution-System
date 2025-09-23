const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// @route   GET /api/seller-dashboard/stats
// @desc    Get comprehensive seller dashboard statistics
// @access  Private/Seller
router.get('/stats', auth, async (req, res) => {
  try {
    // Check if user is a seller
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Access denied. Only sellers can view these stats.' });
    }

    console.log('Seller Dashboard Stats - User:', JSON.stringify({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }));
    
    // First check if Seller collection has this user
    const sellerRecord = await mongoose.model('Seller').findOne({ userId: req.user._id });
    console.log('Seller record:', sellerRecord ? 'Found' : 'Not found');
    
    // Get all products for this seller
    // Try multiple approaches to find products
    let products = [];
    
    // Approach 1: Direct match on user ID
    products = await Product.find({ sellerId: req.user._id });
    console.log(`Approach 1: Found ${products.length} products for seller ID ${req.user._id}`);
    
    // If no products found, try with string version of ID
    if (products.length === 0) {
      products = await Product.find({ sellerId: req.user._id.toString() });
      console.log(`Approach 2: Found ${products.length} products for seller ID (string) ${req.user._id.toString()}`);
    }
    
    // If still no products, check if there's a seller record and use that ID
    if (products.length === 0 && sellerRecord) {
      products = await Product.find({ sellerId: sellerRecord._id });
      console.log(`Approach 3: Found ${products.length} products for seller record ID ${sellerRecord._id}`);
    }
    
    // Dump first product for debugging if we found any
    if (products.length > 0) {
      console.log('Sample product:', JSON.stringify(products[0]));
    } else {
      console.log('No products found for any seller ID approach');
      
      // Let's check if there are any products at all in the database
      const totalProducts = await Product.countDocuments();
      console.log(`Total products in database: ${totalProducts}`);
      
      if (totalProducts > 0) {
        const sampleProduct = await Product.findOne();
        console.log('Sample product from DB:', JSON.stringify(sampleProduct));
      }
    }
    
    // Find all orders containing this seller's products
    const sellerProductIds = products.map(product => product._id);
    
    // Try different approaches to find orders
    let sellerOrders = [];
    
    // Approach 1: Find by product IDs if we have products
    if (sellerProductIds && sellerProductIds.length > 0) {
      sellerOrders = await Order.find({
        'items.productId': { $in: sellerProductIds }
      });
      console.log(`Approach 1: Found ${sellerOrders.length} orders by product IDs`);
    }
    
    // Approach 2: Find by seller ID directly
    if (sellerOrders.length === 0) {
      sellerOrders = await Order.find({
        'items.sellerId': req.user._id
      });
      console.log(`Approach 2: Found ${sellerOrders.length} orders by seller ID`);
    }
    
    // Approach 3: Find by seller ID as string
    if (sellerOrders.length === 0) {
      sellerOrders = await Order.find({
        'items.sellerId': req.user._id.toString()
      });
      console.log(`Approach 3: Found ${sellerOrders.length} orders by seller ID string`);
    }
    
    // Check if there are any orders at all in the database
    const allOrdersCount = await Order.countDocuments();
    console.log(`Total orders in database: ${allOrdersCount}`);
    
    if (allOrdersCount > 0) {
      const sampleOrder = await Order.findOne();
      console.log('Sample order structure:', JSON.stringify({
        _id: sampleOrder._id,
        status: sampleOrder.status,
        items: sampleOrder.items.map(item => ({
          productId: item.productId,
          sellerId: item.sellerId,
          quantity: item.quantity,
          price: item.price
        }))
      }));
    }
    
    // Calculate statistics
    const totalProducts = products.length;
    const activeProducts = products.filter(product => product.stock > 0).length;
    
    // Calculate order statistics - only count items from this seller
    let totalOrders = 0;
    let pendingOrders = 0;
    let processingOrders = 0;
    let shippedOrders = 0;
    let deliveredOrders = 0;
    let totalRevenue = 0;
    
    // Process orders to get seller-specific stats
    sellerOrders.forEach(order => {
      // Check if order contains this seller's products
      const sellerItems = order.items.filter(item => {
        // Check if the item belongs to this seller (by product ID or seller ID)
        const productIdStr = item.productId && item.productId.toString();
        const belongsToSeller = sellerProductIds.some(id => id.toString() === productIdStr) || 
                               (item.sellerId && item.sellerId.toString() === req.user._id.toString());
                               
        return belongsToSeller;
      });
      
      if (sellerItems.length > 0) {
        totalOrders++;
        
        // Track order status
        switch(order.status) {
          case 'Pending':
            pendingOrders++;
            break;
          case 'Processing':
            processingOrders++;
            break;
          case 'Shipped':
            shippedOrders++;
            break;
          case 'Delivered':
            deliveredOrders++;
            break;
          default:
            // No action needed
        }
        
        // Calculate revenue from this seller's items only
        const orderRevenue = sellerItems.reduce((sum, item) => {
          return sum + (item.price * item.quantity);
        }, 0);
        
        console.log(`Order ${order._id}: Revenue for seller: ${orderRevenue}`);
        
        totalRevenue += orderRevenue;
      }
    });
    
    // Log the final statistics we're sending
    const stats = {
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      totalRevenue
    };
    
    console.log('Sending stats to frontend:', JSON.stringify(stats));
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error getting seller dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/seller-dashboard/recent-orders
// @desc    Get recent orders for the seller
// @access  Private/Seller
router.get('/recent-orders', auth, async (req, res) => {
  try {
    // Check if user is a seller
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Access denied. Only sellers can view these orders.' });
    }

    console.log('Getting recent orders for seller:', req.user._id);
    // Get all products for this seller
    const products = await Product.find({ sellerId: req.user._id });
    const sellerProductIds = products.map(product => product._id);
    
    console.log(`Found ${products.length} products for seller`);
    
    // Find orders containing any of these products or directly linked to seller, sorted by date
    const recentOrders = await Order.find({
      $or: [
        { 'items.productId': { $in: sellerProductIds } },
        { 'items.sellerId': req.user._id }
      ]
    })
    .populate('customerId', 'name email')
    .populate('items.productId', 'name price imageUrl')
    .sort({ orderDate: -1 })
    .limit(5);
    
    console.log(`Found ${recentOrders.length} recent orders for seller`);
    
    // Process orders to include only this seller's items
    const processedOrders = recentOrders.map(order => {
      // Create a copy of the order with only this seller's items
      const orderData = order.toObject();
      
      // Filter items to include only this seller's products
      orderData.sellerItems = orderData.items.filter(item => {
        const itemProductId = item.productId && item.productId._id 
          ? item.productId._id.toString()
          : item.productId?.toString();
          
        return sellerProductIds.some(id => id.toString() === itemProductId);
      });
      
      // Calculate seller's portion of the order total
      orderData.sellerTotal = orderData.sellerItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);
      
      return orderData;
    });
    
    res.status(200).json({
      success: true,
      count: processedOrders.length,
      data: processedOrders
    });
  } catch (error) {
    console.error('Error getting recent seller orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/seller-dashboard/top-products
// @desc    Get top selling products for the seller
// @access  Private/Seller
router.get('/top-products', auth, async (req, res) => {
  try {
    // Check if user is a seller
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Access denied. Only sellers can access this data.' });
    }

    console.log('Getting top products for seller:', req.user._id);
    // Get all of this seller's products first
    const sellerProducts = await Product.find({ sellerId: req.user._id });
    console.log(`Found ${sellerProducts.length} products for seller`);
    
    const sellerProductIds = sellerProducts.map(product => product._id.toString());

    // Get all orders to analyze sales
    const orders = await Order.find({
      $or: [
        { 'items.productId': { $in: sellerProductIds } },
        { 'items.sellerId': req.user._id }
      ]
    }).populate('items.productId');
    
    console.log(`Found ${orders.length} orders for seller's products`);
    
    // Count sales for each product by this seller
    const productSales = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        // Check if this is a product from this seller
        const itemSellerId = item.sellerId ? item.sellerId.toString() : null;
        const productSellerId = item.productId && item.productId.sellerId ? item.productId.sellerId.toString() : null;
        
        if ((itemSellerId && itemSellerId === req.user._id.toString()) || 
            (productSellerId && productSellerId === req.user._id.toString()) ||
            (item.productId && sellerProductIds.includes(item.productId._id.toString()))) {
          
          const productId = item.productId._id.toString();
          
          if (!productSales[productId]) {
            productSales[productId] = {
              _id: productId,
              name: item.productId.name,
              unitsSold: 0,
              revenue: 0,
              imageUrl: item.productId.imageUrl || '',
              countInStock: item.productId.countInStock || 0
            };
          }
          
          productSales[productId].unitsSold += item.quantity;
          productSales[productId].revenue += (item.price * item.quantity);
        }
      });
    });
    
    // Convert to array and sort by units sold
    let topProducts = Object.values(productSales)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);
    
    res.status(200).json({
      success: true,
      count: topProducts.length,
      data: topProducts
    });
  } catch (error) {
    console.error('Error getting top products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;