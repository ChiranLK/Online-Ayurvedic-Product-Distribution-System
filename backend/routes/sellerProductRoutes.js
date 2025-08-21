const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const Seller = require('../models/Seller');
const upload = require('../middleware/uploadMiddleware');
const path = require('path');
const fs = require('fs');

// Route to get seller's products
router.get('/my-products', auth, async (req, res) => {
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

// Add a new product as a seller
router.post('/add', auth, upload.single('image'), async (req, res) => {
  try {
    // Check if user is a seller
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can create products' });
    }

    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    // First, find the category by name to get its ID
    const Category = require('../models/Category');
    const categoryName = req.body.category;
    
    // Look for an existing category with this name
    let category = await Category.findOne({ name: categoryName });
    
    // If category doesn't exist, create it
    if (!category) {
      category = await Category.create({
        name: categoryName,
        description: `Category for ${categoryName} products`
      });
    }

    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price),
      category: category._id, // Use the category ObjectId
      categoryName: categoryName, // Store the category name
      stock: Number(req.body.stock),
      sellerId: req.user.id, // Use the authenticated seller's ID
      imageUrl: `/uploads/${req.file.filename}`
    };

    const product = new Product(productData);
    const savedProduct = await product.save();

    // Update the seller's productsSupplied array
    await Seller.findByIdAndUpdate(
      req.user.id,
      { $push: { productsSupplied: savedProduct._id } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      data: savedProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update inventory/stock quickly
router.put('/update-stock/:id', auth, async (req, res) => {
  try {
    // First get the existing product to check ownership
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is the owner of the product
    if (req.user.role !== 'seller' || existingProduct.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Access denied. You can only update your own products.'
      });
    }

    // Validate stock quantity
    const stock = parseInt(req.body.stock);
    if (isNaN(stock) || stock < 0) {
      return res.status(400).json({ message: 'Invalid stock quantity' });
    }

    // Update only the stock field
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: stock },
      { new: true }
    );
    
    res.json({
      success: true,
      data: updatedProduct
    });
    
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update an existing product as a seller
router.put('/edit/:id', auth, upload.single('image'), async (req, res) => {
  try {
    // First get the existing product to check ownership
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is the owner of the product
    if (req.user.role !== 'seller' || existingProduct.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Access denied. You can only update your own products.'
      });
    }

    // Handle category - convert from string to ObjectId
    const Category = require('../models/Category');
    const categoryName = req.body.category;
    
    // Look for an existing category with this name
    let category = await Category.findOne({ name: categoryName });
    
    // If category doesn't exist, create it
    if (!category) {
      category = await Category.create({
        name: categoryName,
        description: `Category for ${categoryName} products`
      });
    }
    
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: category._id, // Use the category ObjectId
      categoryName: categoryName, // Store the category name
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
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a product as a seller
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    // First get the product to check ownership and get sellerId
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is the owner of the product
    if (req.user.role !== 'seller' || product.sellerId.toString() !== req.user.id) {
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

    res.json({ 
      success: true,
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a specific product for the seller
router.get('/product/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can access this route' });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if the product belongs to this seller
    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. This is not your product.' });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
