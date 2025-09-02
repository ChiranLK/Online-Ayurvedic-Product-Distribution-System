const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/', auth, async (req, res) => {
  try {
    console.log('Admin stats endpoint called by user:', req.user?.name, 'Role:', req.user?.role);
    
    // Check if user is an admin
    if (req.user.role !== 'admin') {
      console.log('Access denied: User is not admin');
      return res.status(403).json({ message: 'Access denied. Only administrators can view these stats.' });
    }

    // Get counts from database
    const customers = await User.countDocuments({ role: 'customer' });
    const sellers = await User.countDocuments({ role: 'seller' });
    const products = await Product.countDocuments();
    const orders = await Order.countDocuments();
    
    // Get count of sellers awaiting approval
    const pendingSellers = await User.countDocuments({ 
      role: 'seller', 
      status: { $in: ['pending', 'review'] }
    });
    
    // Get appointment statistics
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'approved' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    
    // Get today's appointments by time slot
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // For dashboard stats, we'll count approved appointments scheduled for today
    const todayAppointments = await Appointment.find({
      status: 'approved',
      scheduledDate: { $gte: today, $lt: tomorrow }
    });
    
    console.log(`Found ${todayAppointments.length} appointments scheduled for today`);
    
    // Count appointments by time slot based on the scheduledTime field
    let todayMorningAppointments = 0;
    let todayAfternoonAppointments = 0;
    let todayEveningAppointments = 0;
    
    // Categorize appointments based on the time string
    todayAppointments.forEach(appointment => {
      const timeStr = appointment.scheduledTime ? appointment.scheduledTime.toLowerCase() : '';
      
      if (timeStr.includes('am') || 
          (timeStr && parseInt(timeStr.split(':')[0]) < 12)) {
        todayMorningAppointments++;
      } 
      else if (timeStr && parseInt(timeStr.split(':')[0]) < 17) {
        todayAfternoonAppointments++;
      } 
      else {
        todayEveningAppointments++;
      }
    });
    
    console.log('Today\'s appointments by time slot:', {
      morning: todayMorningAppointments,
      afternoon: todayAfternoonAppointments,
      evening: todayEveningAppointments
    });
    
    const statsResponse = {
      success: true,
      totalCustomers: customers,
      totalSellers: sellers,
      totalProducts: products,
      totalOrders: orders,
      pendingSellers,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      todayMorningAppointments,
      todayAfternoonAppointments,
      todayEveningAppointments
    };
    
    console.log('Admin stats response:', statsResponse);
    
    res.status(200).json(statsResponse);
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
