const express = require('express');
const router = express.Router();
const { 
  getBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  addComment,
  removeComment,
  toggleLike,
  getPostsByAuthor
} = require('../controllers/blog');

const auth = require('../middleware/auth');

// Public routes
router.get('/', getBlogPosts);
router.get('/:id', getBlogPostById);
router.get('/author/:userId', getPostsByAuthor);

// Protected routes - requires authentication
router.post('/', auth, createBlogPost);
router.put('/:id', auth, updateBlogPost);
router.delete('/:id', auth, deleteBlogPost);
router.post('/:id/comments', auth, addComment);
router.delete('/:id/comments/:commentId', auth, removeComment);
router.post('/:id/like', auth, toggleLike);

module.exports = router;
