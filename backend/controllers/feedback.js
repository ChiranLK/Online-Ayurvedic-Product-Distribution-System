const Feedback = require('../models/Feedback');
const User = require('../models/User');

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Public (allows guests to submit)
exports.createFeedback = async (req, res) => {
  try {
    const { name, email, category, rating, message } = req.body;

    // Validate required fields
    if (!name || !email || !category || !rating || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    // Create a new feedback object
    const feedbackData = {
      name,
      email,
      category,
      rating,
      message
    };

    // If user is logged in, associate feedback with user
    if (req.user && req.user.id) {
      feedbackData.customer = req.user.id;
    }

    const feedback = await Feedback.create(feedbackData);

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (err) {
    console.error('Error creating feedback:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get all feedback (with filtering options)
// @route   GET /api/feedback
// @access  Private (Admin only)
exports.getAllFeedback = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this resource'
      });
    }

    // Filtering options
    const filter = {};
    const { isRead, isArchived, category, minRating, maxRating } = req.query;

    // Apply filters if provided
    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }
    
    if (isArchived !== undefined) {
      filter.isArchived = isArchived === 'true';
    }
    
    if (category) {
      filter.category = category;
    }
    
    // Rating range filter
    if (minRating || maxRating) {
      filter.rating = {};
      if (minRating) filter.rating.$gte = Number(minRating);
      if (maxRating) filter.rating.$lte = Number(maxRating);
    }

    // Sort options
    const sort = {};
    const { sortBy, sortOrder } = req.query;
    
    if (sortBy) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      // Default sort by creation date, newest first
      sort.createdAt = -1;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const feedback = await Feedback.find(filter)
      .sort(sort)
      .skip(startIndex)
      .limit(limit)
      .populate('customer', 'name email')
      .populate('respondedBy', 'name');

    // Get total count for pagination
    const total = await Feedback.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: feedback.length,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: startIndex + feedback.length < total
      },
      data: feedback
    });
  } catch (err) {
    console.error('Error getting feedback:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get feedback by ID
// @route   GET /api/feedback/:id
// @access  Private (Admin only)
exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('respondedBy', 'name');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (err) {
    console.error('Error getting feedback by ID:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update feedback (admin response, read/archived status)
// @route   PUT /api/feedback/:id
// @access  Private (Admin only)
exports.updateFeedback = async (req, res) => {
  try {
    // Check if feedback exists
    let feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    const { response, isRead, isArchived } = req.body;
    const updateData = {};

    // Update only the provided fields
    if (response !== undefined) {
      updateData.response = response;
      updateData.respondedAt = Date.now();
      updateData.respondedBy = req.user.id;
      updateData.isRead = true; // Mark as read when responded
    }

    if (isRead !== undefined) {
      updateData.isRead = isRead;
    }

    if (isArchived !== undefined) {
      updateData.isArchived = isArchived;
    }

    // Update the feedback
    feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('respondedBy', 'name');

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (err) {
    console.error('Error updating feedback:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private (Admin only)
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    await Feedback.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting feedback:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get feedback statistics
// @route   GET /api/feedback/stats
// @access  Private (Admin only)
exports.getFeedbackStats = async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $facet: {
          'totalCount': [{ $count: 'count' }],
          'ratingAvg': [{ $group: { _id: null, avg: { $avg: '$rating' } } }],
          'byCategory': [{ $group: { _id: '$category', count: { $sum: 1 } } }],
          'unreadCount': [{ $match: { isRead: false } }, { $count: 'count' }],
          'respondedCount': [{ $match: { response: { $ne: '' } } }, { $count: 'count' }],
          'byRating': [{ $group: { _id: '$rating', count: { $sum: 1 } } }]
        }
      }
    ]);

    // Format the statistics for easier consumption
    const formattedStats = {
      total: stats[0].totalCount[0]?.count || 0,
      averageRating: stats[0].ratingAvg[0]?.avg || 0,
      unreadCount: stats[0].unreadCount[0]?.count || 0,
      respondedCount: stats[0].respondedCount[0]?.count || 0,
      byCategory: stats[0].byCategory.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      byRating: stats[0].byRating.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}) // Ensure all ratings are represented
    };

    res.status(200).json({
      success: true,
      data: formattedStats
    });
  } catch (err) {
    console.error('Error getting feedback statistics:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
