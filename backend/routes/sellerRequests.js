const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Seller = require('../models/Seller');
const auth = require('../middleware/auth');

// @route   POST /api/seller-requests
// @desc    Submit a request to become a seller
// @access  Private (Customer only)
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received seller request:', req.body);
    console.log('User in request:', req.user);
    
    // Check if user is a customer
    if (req.user.role !== 'customer') {
      console.log('User is not a customer, role:', req.user.role);
      return res.status(403).json({ 
        success: false,
        message: 'Only customers can request to become sellers' 
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.log('User not found with ID:', req.user.id);
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Check if user already has a pending request
    if (user.sellerRequest && user.sellerRequest.requested && user.sellerRequest.requestStatus === 'pending') {
      return res.status(400).json({ 
        success: false,
        message: 'You already have a pending seller request' 
      });
    }
    
    // Check if user is already a seller
    if (user.role === 'seller') {
      return res.status(400).json({ 
        success: false,
        message: 'You are already a seller' 
      });
    }
    
    const { reason } = req.body;
    
    // Update user with seller request information
    // Check if reason is provided
    if (!reason || reason.trim() === '') {
      console.log('No reason provided for seller request');
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for your seller request'
      });
    }

    user.sellerRequest = {
      requested: true,
      requestDate: new Date(),
      requestStatus: 'pending',
      reason: reason
    };
    
    console.log('Saving user with seller request:', user.sellerRequest);
    await user.save();
    
    console.log('Seller request saved successfully');
    res.status(200).json({
      success: true,
      message: 'Seller request submitted successfully',
      data: {
        requestDate: user.sellerRequest.requestDate,
        requestStatus: user.sellerRequest.requestStatus
      }
    });
    
  } catch (error) {
    console.error('Error submitting seller request:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error processing your request. Please try again.', 
      error: error.message 
    });
  }
});

// @route   GET /api/seller-requests
// @desc    Get all seller requests (Admin only)
// @access  Private (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Only administrators can view seller requests.' 
      });
    }
    
    const sellerRequests = await User.find({
      'sellerRequest.requested': true,
      'sellerRequest.requestStatus': 'pending'
    }).select('name email phone address city state zipcode sellerRequest createdAt');
    
    res.status(200).json({
      success: true,
      count: sellerRequests.length,
      data: sellerRequests
    });
    
  } catch (error) {
    console.error('Error getting seller requests:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   GET /api/seller-requests/me
// @desc    Get user's own seller request
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('sellerRequest');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: user.sellerRequest
    });
    
  } catch (error) {
    console.error('Error getting user seller request:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   PUT /api/seller-requests/:id/approve
// @desc    Approve a seller request (Admin only)
// @access  Private (Admin only)
router.put('/:id/approve', auth, async (req, res) => {
  try {
    // Check if user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Only administrators can approve seller requests.' 
      });
    }
    
    // Find the user
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Check if there's a pending request
    if (!user.sellerRequest || !user.sellerRequest.requested || user.sellerRequest.requestStatus !== 'pending') {
      return res.status(400).json({ 
        success: false,
        message: 'No pending seller request found for this user' 
      });
    }
    
    // Update user to be a seller
    user.role = 'seller';
    user.status = 'approved';
    user.sellerRequest.requestStatus = 'approved';
    
    await user.save();
    
    // Create seller record if it doesn't exist
    let sellerRecord = await Seller.findOne({ userId: user._id });
    
    if (!sellerRecord) {
      sellerRecord = await Seller.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        zipcode: user.zipcode,
        status: 'approved'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Seller request approved successfully'
    });
    
  } catch (error) {
    console.error('Error approving seller request:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   PUT /api/seller-requests/:id/reject
// @desc    Reject a seller request (Admin only)
// @access  Private (Admin only)
router.put('/:id/reject', auth, async (req, res) => {
  try {
    // Check if user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Only administrators can reject seller requests.' 
      });
    }
    
    // Find the user
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Check if there's a pending request
    if (!user.sellerRequest || !user.sellerRequest.requested || user.sellerRequest.requestStatus !== 'pending') {
      return res.status(400).json({ 
        success: false,
        message: 'No pending seller request found for this user' 
      });
    }
    
    // Update user request to rejected
    user.sellerRequest.requestStatus = 'rejected';
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Seller request rejected successfully'
    });
    
  } catch (error) {
    console.error('Error rejecting seller request:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;
