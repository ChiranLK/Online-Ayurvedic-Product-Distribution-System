const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const blogController = require('../controllers/blog');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Get all blog posts
router.get('/', blogController.getAllPosts);

// Get single blog post
router.get('/:id', blogController.getPostById);

// Create a blog post - Admin only
router.post(
  '/',
  [
    auth,
    authorize(['admin']),
    check('title', 'Title is required').not().isEmpty(),
    check('content', 'Content is required').not().isEmpty()
  ],
  blogController.createPost
);

// Update a blog post - Admin only
router.put(
  '/:id',
  [
    auth,
    authorize(['admin']),
    check('title', 'Title is required').not().isEmpty(),
    check('content', 'Content is required').not().isEmpty()
  ],
  blogController.updatePost
);

// Delete a blog post - Admin only
router.delete('/:id', [auth, authorize(['admin'])], blogController.deletePost);

// Add a comment to a blog post - Any authenticated user
router.post(
  '/:id/comments',
  [
    auth,
    check('content', 'Comment content is required').not().isEmpty()
  ],
  blogController.addComment
);

// Delete a comment - Admin or comment owner
router.delete('/:postId/comments/:commentId', auth, blogController.deleteComment);

module.exports = router;
