const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  deleteOrder,
  getSellerOrders
} = require('../controllers/orders');

const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// All routes require authentication
router.use(auth);

// Customer-only routes
router.post('/', authorize('customer'), createOrder);

// Routes for all authenticated users
router.get('/', getOrders); // Filtering based on role done in controller
router.get('/:id', getOrder); // Access control done in controller

// Seller-specific routes
router.get('/seller/me', authorize('seller'), getSellerOrders);

// Seller and admin routes
router.put('/:id', authorize('seller', 'admin'), updateOrderStatus);

// Admin-only routes
router.delete('/:id', authorize('admin'), deleteOrder);

module.exports = router;
