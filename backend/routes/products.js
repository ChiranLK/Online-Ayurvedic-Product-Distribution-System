const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts
} = require('../controllers/products');

const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Public routes - no authentication required
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes
router.use(auth);

// Seller-only route
router.get('/seller/me', authorize('seller', 'admin'), getSellerProducts);

// Routes for sellers and admins
router.post('/', authorize('seller', 'admin'), createProduct);

// Routes with dynamic authorization (seller can update/delete own products)
router.put('/:id', auth, updateProduct); // Authorization handled in controller
router.delete('/:id', auth, deleteProduct); // Authorization handled in controller

module.exports = router;
