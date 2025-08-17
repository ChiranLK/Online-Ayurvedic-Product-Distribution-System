const express = require('express');
const router = express.Router();
const { 
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categories');

const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Protected admin routes
router.post('/', auth, authorize('admin'), createCategory);
router.put('/:id', auth, authorize('admin'), updateCategory);
router.delete('/:id', auth, authorize('admin'), deleteCategory);

module.exports = router;
