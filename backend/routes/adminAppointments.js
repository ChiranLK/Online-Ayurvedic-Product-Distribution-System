const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

/**
 * @route   GET /api/admin/appointments
 * @desc    Get all appointments for admin
 * @access  Private - Admin Only
 */
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .sort({ scheduledDate: -1 })
      .populate('customer', 'name email phone')
      .populate('doctor', 'name speciality');

    // Format the appointments for better readability
    const formattedAppointments = appointments.map(appointment => ({
      _id: appointment._id,
      patientName: appointment.patientName,
      customerName: appointment.customer ? appointment.customer.name : 'Direct Booking',
      contactNumber: appointment.contactNumber || (appointment.customer ? appointment.customer.phone : 'N/A'),
      email: appointment.customer ? appointment.customer.email : 'N/A',
      doctorName: appointment.doctor ? appointment.doctor.name : 'N/A',
      doctorSpeciality: appointment.doctor ? appointment.doctor.speciality : 'N/A',
      scheduledDate: appointment.scheduledDate,
      scheduledTime: appointment.scheduledTime,
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    }));

    res.json({
      success: true,
      count: formattedAppointments.length,
      data: formattedAppointments
    });
  } catch (err) {
    console.error('Error fetching appointments for admin:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching appointments',
      error: err.message 
    });
  }
});

/**
 * @route   GET /api/admin/appointments/stats
 * @desc    Get appointment statistics for admin dashboard
 * @access  Private - Admin Only
 */
router.get('/stats', auth, authorize('admin'), async (req, res) => {
  try {
    // Get the current date at the start of the day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get 7 days ago
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Get 30 days ago
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // Get total counts
    const totalAppointments = await Appointment.countDocuments();
    
    const todayAppointments = await Appointment.countDocuments({
      scheduledDate: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    const weeklyAppointments = await Appointment.countDocuments({
      scheduledDate: { $gte: weekAgo }
    });
    
    const monthlyAppointments = await Appointment.countDocuments({
      scheduledDate: { $gte: monthAgo }
    });

    // Get counts by status
    const pendingCount = await Appointment.countDocuments({ status: 'pending' });
    const approvedCount = await Appointment.countDocuments({ status: 'approved' });
    const completedCount = await Appointment.countDocuments({ status: 'completed' });
    const cancelledCount = await Appointment.countDocuments({ status: 'cancelled' });

    // Get stats for appointments over time (last 30 days)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    // Get appointments grouped by date for the last 30 days
    const appointmentsByDate = await Appointment.aggregate([
      {
        $match: {
          scheduledDate: { $gte: last30Days[0] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$scheduledDate" },
            month: { $month: "$scheduledDate" },
            day: { $dayOfMonth: "$scheduledDate" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      }
    ]);

    // Format the date-based data for charting
    const appointmentTrend = last30Days.map(date => {
      const dateString = date.toISOString().split('T')[0];
      const matchingData = appointmentsByDate.find(item => {
        return (
          item._id.year === date.getFullYear() &&
          item._id.month === date.getMonth() + 1 &&
          item._id.day === date.getDate()
        );
      });
      
      return {
        date: dateString,
        count: matchingData ? matchingData.count : 0
      };
    });

    res.json({
      success: true,
      data: {
        total: totalAppointments,
        today: todayAppointments,
        weekly: weeklyAppointments,
        monthly: monthlyAppointments,
        byStatus: {
          pending: pendingCount,
          approved: approvedCount,
          completed: completedCount,
          cancelled: cancelledCount
        },
        trend: appointmentTrend
      }
    });
  } catch (err) {
    console.error('Error fetching appointment statistics:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching appointment statistics',
      error: err.message 
    });
  }
});

/**
 * @route   PATCH /api/admin/appointments/:id/status
 * @desc    Update appointment status
 * @access  Private - Admin Only
 */
router.patch('/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status is required' 
      });
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value. Must be one of: pending, approved, completed, cancelled' 
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    )
    .populate('customer', 'name email phone')
    .populate('doctor', 'name speciality');

    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (err) {
    console.error('Error updating appointment status:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating appointment status',
      error: err.message 
    });
  }
});

module.exports = router;
