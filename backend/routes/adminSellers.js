const express = require('express');
const router = express.Router();
const { 
  getSellers, 
  getSellerById, 
  updateSeller, 
  deleteSeller,
  updateSellerApproval
} = require('../controllers/adminSellers');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Protect all routes - require authentication & admin role
router.use(auth);
router.use(authorize('admin'));

// Routes
router.get('/', getSellers);
router.get('/:id', getSellerById);
router.put('/:id', updateSeller);
router.put('/:id/approve', updateSellerApproval);
router.delete('/:id', deleteSeller);

module.exports = router;
