const express = require('express');
const router = express.Router();
const { 
  createFeedback, 
  getAllFeedback, 
  getFeedbackById, 
  updateFeedback, 
  deleteFeedback,
  getFeedbackStats
} = require('../controllers/feedback');
const protect = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Public route for submitting feedback
router.post('/', createFeedback);

// Protected routes - require authentication
router.use(protect);

// Admin-only routes
router.get('/', authorize('admin'), getAllFeedback);
router.get('/stats', authorize('admin'), getFeedbackStats);
router.get('/:id', authorize('admin'), getFeedbackById);
router.put('/:id', authorize('admin'), updateFeedback);
router.delete('/:id', authorize('admin'), deleteFeedback);

module.exports = router;
