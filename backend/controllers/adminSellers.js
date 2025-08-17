const User = require('../models/User');
const Product = require('../models/Product');

// Get all sellers
exports.getSellers = async (req, res) => {
  try {
    // Extract query parameters
    const { status } = req.query;
    
    // Build query based on filters
    let query = { role: 'seller' };
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Get filtered users with role 'seller'
    const sellers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    // Get product counts for each seller
    const sellersWithProductCounts = await Promise.all(
      sellers.map(async (seller) => {
        const productsCount = await Product.countDocuments({ seller: seller._id });
        return {
          ...seller._doc,
          productsCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: sellersWithProductCounts.length,
      data: sellersWithProductCounts
    });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get a single seller by ID
exports.getSellerById = async (req, res) => {
  try {
    const seller = await User.findOne({ 
      _id: req.params.id, 
      role: 'seller' 
    }).select('-password');

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Get product count
    const productsCount = await Product.countDocuments({ seller: seller._id });
    
    // Get seller products
    const products = await Product.find({ seller: seller._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        ...seller._doc,
        productsCount,
        recentProducts: products
      }
    });
  } catch (error) {
    console.error('Error fetching seller:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update seller
exports.updateSeller = async (req, res) => {
  try {
    const seller = await User.findOne({ 
      _id: req.params.id, 
      role: 'seller' 
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Prevent updating the role
    const { role, password, ...updateData } = req.body;

    const updatedSeller = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: updatedSeller
    });
  } catch (error) {
    console.error('Error updating seller:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update seller approval status
exports.updateSellerApproval = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status (approved, rejected, or pending)'
      });
    }

    const seller = await User.findOne({ 
      _id: req.params.id, 
      role: 'seller' 
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    seller.status = status;
    await seller.save();

    res.status(200).json({
      success: true,
      data: seller
    });
  } catch (error) {
    console.error('Error updating seller approval:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete seller
exports.deleteSeller = async (req, res) => {
  try {
    const seller = await User.findOne({ 
      _id: req.params.id, 
      role: 'seller' 
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Delete all seller's products first
    await Product.deleteMany({ seller: req.params.id });
    
    // Then delete the seller
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Seller and all associated products deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting seller:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
