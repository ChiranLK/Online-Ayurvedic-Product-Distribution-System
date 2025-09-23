const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

// Route to create test products for the current seller
router.post('/create-test-product', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Access denied. Only sellers can create test products.' });
    }
    
    console.log('Creating test product for seller:', req.user._id);
    
    // Find a category to use (or create one)
    let category;
    category = await Category.findOne();
    
    if (!category) {
      category = await Category.create({
        name: 'Test Category',
        description: 'Category created for testing'
      });
      console.log('Created new category:', category._id);
    }
    
    // Create a test product
    const product = await Product.create({
      name: 'Test Ayurvedic Product',
      description: 'This is a test product created for dashboard testing',
      price: 1500,
      category: category._id,
      categoryName: category.name,
      stock: 25,
      imageUrl: '/images/test-product.jpg',
      sellerId: req.user._id // Use the current user's ID
    });
    
    console.log('Created test product:', product._id);
    
    res.status(201).json({
      message: 'Test product created successfully',
      product
    });
  } catch (error) {
    console.error('Error creating test product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route to create a test order that includes the seller's products
router.post('/create-test-order', auth, async (req, res) => {
  try {
    // Find products from this seller
    const products = await Product.find({ sellerId: req.user._id });
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found for this seller. Create products first.' });
    }
    
    // Find a customer (any user with role 'customer')
    let customer = await User.findOne({ role: 'customer' });
    
    if (!customer) {
      // Create a test customer
      customer = await User.create({
        name: 'Test Customer',
        email: 'testcustomer@example.com',
        password: 'password123', // This would be hashed by the schema pre-save hook
        phone: '1234567890',
        address: '123 Test Street',
        role: 'customer'
      });
      console.log('Created test customer:', customer._id);
    }
    
    // Create an order with the seller's products
    const orderItems = products.slice(0, 2).map(product => ({
      productId: product._id,
      sellerId: req.user._id,
      quantity: 2,
      price: product.price,
      name: product.name
    }));
    
    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const order = await Order.create({
      customerId: customer._id,
      items: orderItems,
      totalAmount,
      status: 'Pending',
      deliveryAddress: customer.address,
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending'
    });
    
    console.log('Created test order:', order._id);
    
    res.status(201).json({
      message: 'Test order created successfully',
      order
    });
  } catch (error) {
    console.error('Error creating test order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;