const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const categoryController = require('../controllers/categories');

// Get all categories
router.get('/', categoryController.getAllCategories);

// Get single category by ID
router.get('/:id', categoryController.getCategoryById);

// Create new category (Admin only)
router.post(
  '/', 
  [
    auth,
    authorize(['admin']),
    check('name', 'Name is required').not().isEmpty()
  ],
  categoryController.createCategory
);

// Update category (Admin only)
router.put(
  '/:id',
  [
    auth,
    authorize(['admin']),
    check('name', 'Name is required').not().isEmpty()
  ],
  categoryController.updateCategory
);

// Delete category (Admin only)
router.delete(
  '/:id',
  [auth, authorize(['admin'])],
  categoryController.deleteCategory
);

module.exports = router;
