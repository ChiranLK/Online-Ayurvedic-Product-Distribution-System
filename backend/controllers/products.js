const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
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
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
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
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Seller or Admin
exports.createProduct = async (req, res) => {
  try {
    // Add current user as seller
    req.body.sellerId = req.user.id;
    
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Seller (own) or Admin
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user is seller and product owner
    if (req.user.role === 'seller' && product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: 'Access denied. You can only update your own products.' 
      });
    }
    
    // Update the product
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Seller (own) or Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user is seller and product owner
    if (req.user.role === 'seller' && product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: 'Access denied. You can only delete your own products.' 
      });
    }
    
    await product.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get seller products
// @route   GET /api/products/seller
// @access  Private/Seller
exports.getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user.id });
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
