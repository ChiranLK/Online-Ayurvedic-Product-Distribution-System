const BlogPost = require('../models/BlogPost');
const User = require('../models/User');

// Get all blog posts (with filtering, sorting and pagination)
exports.getBlogPosts = async (req, res) => {
  try {
    const { tag, author, status, search, sort = 'createdAt', order = 'desc', page = 1, limit = 10 } = req.query;
    const query = {};

    // Apply filters
    if (tag) query.tags = tag;
    if (author) query.author = author;
    if (status && req.user?.role === 'admin') query.status = status;
    else query.status = 'published'; // Non-admins can only see published posts

    // Search in title and content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Count total documents for pagination
    const total = await BlogPost.countDocuments(query);
    
    // Get paginated results
    const posts = await BlogPost.find(query)
      .populate('author', 'name email')
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page * 1,
      data: posts
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get a single blog post by ID
exports.getBlogPostById = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id)
      .populate('author', 'name email')
      .populate('comments.user', 'name email');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Increment view count (unless it's the author viewing)
    if (req.user && req.user._id.toString() !== post.author._id.toString()) {
      post.views += 1;
      await post.save();
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create a new blog post
exports.createBlogPost = async (req, res) => {
  try {
    const { title, content, tags, status, featuredImage } = req.body;
    
    const post = new BlogPost({
      title,
      content,
      author: req.user._id,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      status: status || 'published',
      featuredImage
    });

    const savedPost = await post.save();
    
    // Populate author data before sending response
    await savedPost.populate('author', 'name email');

    res.status(201).json({
      success: true,
      data: savedPost
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update a blog post
exports.updateBlogPost = async (req, res) => {
  try {
    const { title, content, tags, status, featuredImage } = req.body;
    
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Check if user is author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags ? tags.split(',').map(tag => tag.trim()) : post.tags;
    post.featuredImage = featuredImage !== undefined ? featuredImage : post.featuredImage;
    
    // Only admin or original author can change status
    if (status && (req.user.role === 'admin' || post.author.toString() === req.user._id.toString())) {
      post.status = status;
    }

    post.updatedAt = Date.now();

    const updatedPost = await post.save();
    await updatedPost.populate('author', 'name email');

    res.status(200).json({
      success: true,
      data: updatedPost
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete a blog post
exports.deleteBlogPost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Check if user is author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add a comment to a blog post
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const comment = {
      user: req.user._id,
      text: text.trim()
    };

    post.comments.push(comment);
    await post.save();

    // Populate the new comment with user info
    const updatedPost = await BlogPost.findById(req.params.id)
      .populate('author', 'name email')
      .populate('comments.user', 'name email');

    res.status(201).json({
      success: true,
      data: updatedPost
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Remove a comment from a blog post
exports.removeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Find the comment
    const comment = post.comments.id(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is comment author, post author, or admin
    if (
      comment.user.toString() !== req.user._id.toString() &&
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this comment'
      });
    }

    post.comments.pull(commentId);
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Comment removed successfully'
    });
  } catch (error) {
    console.error('Error removing comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Like/Unlike a blog post
exports.toggleLike = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Check if the user already liked the post
    const userIndex = post.likes.findIndex(
      userId => userId.toString() === req.user._id.toString()
    );

    if (userIndex === -1) {
      // User hasn't liked the post yet, add like
      post.likes.push(req.user._id);
    } else {
      // User already liked the post, remove the like
      post.likes.splice(userIndex, 1);
    }

    await post.save();

    res.status(200).json({
      success: true,
      liked: userIndex === -1, // true if liked, false if unliked
      likeCount: post.likes.length
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get posts by author
exports.getPostsByAuthor = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const query = { author: userId };
    
    // Non-admins and users who aren't the author can only see published posts
    if (req.user?.role !== 'admin' && req.user?._id.toString() !== userId) {
      query.status = 'published';
    }

    const posts = await BlogPost.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    console.error('Error fetching posts by author:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
