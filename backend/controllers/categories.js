const Category = require('../models/Category');
const Product = require('../models/Product');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    
    // Get product counts for each category
    const categoriesWithProductCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ category: category._id });
        return {
          ...category._doc,
          productCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: categoriesWithProductCounts.length,
      data: categoriesWithProductCounts
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get a single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists'
      });
    }
    
    const category = new Category({
      name,
      description
    });

    const savedCategory = await category.save();

    res.status(201).json({
      success: true,
      data: savedCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // If name is being updated, check if it conflicts with existing category
    if (name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'A category with this name already exists'
        });
      }
    }
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    // Check if the category has associated products
    const productCount = await Product.countDocuments({ category: req.params.id });
    
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete this category as it has ${productCount} product(s) associated with it. Please reassign or delete those products first.`
      });
    }
    
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
