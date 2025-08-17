const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  category: {
    type: String,
    enum: ['Product', 'Website', 'Delivery', 'CustomerService', 'Suggestion', 'Other'],
    required: [true, 'Category is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  message: {
    type: String,
    required: [true, 'Feedback message is required'],
    minlength: [10, 'Message must be at least 10 characters long']
  },
  response: {
    type: String,
    default: ''
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Add index for faster querying
feedbackSchema.index({ isRead: 1, isArchived: 1, createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
