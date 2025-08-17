const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');
const Seller = require('../models/Seller');
const auth = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

// Get all products
router.get('/', async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { category, minPrice, maxPrice, sellerId } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    if (sellerId) {
      filter.sellerId = sellerId;
    }
    
    const products = await Product.find(filter).populate('sellerId', 'name');
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get products for authenticated seller
router.get('/seller/products', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can access this route' });
    }

    const products = await Product.find({ sellerId: req.user.id });
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a specific product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('sellerId', 'name email phone address');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new product
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    // Check if user is a seller
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can create products' });
    }

    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      categoryName: req.body.categoryName,
      stock: req.body.stock,
      sellerId: req.user.id, // Seller can only create products for themselves
      imageUrl: req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl // Allow URL or file upload
    };

    if (!productData.imageUrl) {
      return res.status(400).json({ message: 'Product image URL or file is required' });
    }

    const product = new Product(productData);
    const savedProduct = await product.save();

    // If it's a seller creating the product, update their productsSupplied array
    if (req.user.role === 'seller') {
      await Seller.findByIdAndUpdate(
        req.user.id,
        { $push: { productsSupplied: savedProduct._id } },
        { new: true }
      );
    }

    res.status(201).json({
      success: true,
      data: savedProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update a product
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    // First get the existing product to check ownership
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is the owner of the product or an admin
    if (req.user.role === 'seller' && existingProduct.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Access denied. You can only update your own products.'
      });
    }

    const updateData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      stock: req.body.stock
    };

    // Only update image if a new one is uploaded
    if (req.file) {
      // Delete old image if it exists
      if (existingProduct.imageUrl) {
        const oldImagePath = path.join(__dirname, '..', existingProduct.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a product
router.delete('/:id', auth, async (req, res) => {
  try {
    // First get the product to check ownership and get sellerId
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is the owner of the product or an admin
    if (req.user.role === 'seller' && product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Access denied. You can only delete your own products.'
      });
    }

    // Delete the image file if it exists
    if (product.imageUrl) {
      const imagePath = path.join(__dirname, '..', product.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Remove product from seller's productsSupplied array
    await Seller.findByIdAndUpdate(
      product.sellerId,
      { $pull: { productsSupplied: product._id } }
    );

    // Delete the product
    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get products for authenticated seller
router.get('/seller/products', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can access this route' });
    }

    const products = await Product.find({ sellerId: req.user.id });
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;