const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Customer = require('../models/Customer');
const User = require('../models/User');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Create a new appointment - Customer only
router.post('/', auth, authorize('customer'), async (req, res) => {
  try {
    console.log('----- APPOINTMENT CREATION START -----');
    console.log('User making appointment request:', {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    });
    
    const { patientName, contactNumber, problem, preferredDate, preferredTimeSlot } = req.body;
    console.log('Appointment request details:', { patientName, contactNumber, problem, preferredDate, preferredTimeSlot });

    // Validate required fields first
    if (!patientName || !contactNumber || !problem || !preferredDate || !preferredTimeSlot) {
      console.log('Missing required fields in request');
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // COMPLETELY SKIP Customer record lookup and use direct User information
    // This is a workaround for the issue where Customer record may not exist or have validation issues
    
    // Directly create the appointment using the User data instead of Customer
    const newAppointment = new Appointment({
      customer: req.user.id, // Use the authenticated user ID
      customerName: req.user.name, // Use the name from the authenticated user
      patientName, // New field added
      contactNumber, // New field added
      problem,
      preferredDate: new Date(preferredDate),
      preferredTimeSlot,
      status: 'pending'
    });
    
    console.log('Created appointment object:', {
      customer: newAppointment.customer,
      customerName: newAppointment.customerName,
      patientName: newAppointment.patientName,
      contactNumber: newAppointment.contactNumber,
      problem: newAppointment.problem,
      preferredDate: newAppointment.preferredDate,
      preferredTimeSlot: newAppointment.preferredTimeSlot,
      status: newAppointment.status
    });

    // Save the appointment
    try {
      const savedAppointment = await newAppointment.save();
      console.log('Appointment saved successfully with ID:', savedAppointment._id);
      
      console.log('----- APPOINTMENT CREATION SUCCESS -----');
      
      return res.status(201).json({
        success: true,
        message: 'Appointment created successfully!',
        data: savedAppointment
      });
    } catch (saveError) {
      console.error('Error saving appointment:', saveError);
      return res.status(500).json({ 
        message: 'Failed to save appointment', 
        error: saveError.message 
      });
    }
  } catch (error) {
    console.error('----- APPOINTMENT CREATION ERROR -----', error);
    return res.status(500).json({ 
      message: 'Error processing appointment request',
      error: error.message
    });
  }
});

// Get all customer's appointments - Customer only
router.get('/my-appointments', auth, authorize('customer'), async (req, res) => {
  try {
    console.log('----- FETCHING MY APPOINTMENTS -----');
    console.log('User retrieving appointments:', {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    });

    // Find appointments by customer name matching the user's name instead of by customerId
    // This is a workaround for the customer record issue
    const appointments = await Appointment.find({ customerName: req.user.name })
      .sort({ createdAt: -1 });

    console.log(`Found ${appointments.length} appointments for user ${req.user.name}`);
    
    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get today's appointments - Admin only
// IMPORTANT: This route must be before the /:id route to avoid URL conflict
router.get('/today', auth, authorize('admin'), async (req, res) => {
  try {
    console.log('----- FETCHING TODAY\'S APPOINTMENTS -----');
    
    // Calculate start and end of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    console.log(`Fetching appointments between ${today.toISOString()} and ${tomorrow.toISOString()}`);
    console.log(`DB Query: { status: 'approved', scheduledDate: { $gte: ${today.toISOString()}, $lt: ${tomorrow.toISOString()} } }`);
    
    // Find all approved appointments scheduled for today
    const appointments = await Appointment.find({
      status: 'approved',
      scheduledDate: {
        $gte: today,
        $lt: tomorrow
      }
    }).sort({ scheduledTime: 1 });
    
    console.log('Raw appointments found:', JSON.stringify(appointments, null, 2));
    
    // Group appointments by time slot for easier frontend rendering
    const morningAppointments = appointments.filter(a => 
      a.scheduledTime && a.scheduledTime.toLowerCase().includes('am'));
    
    const afternoonAppointments = appointments.filter(a => 
      a.scheduledTime && (a.scheduledTime.toLowerCase().includes('pm') && 
      parseInt(a.scheduledTime.split(':')[0]) < 5));
    
    const eveningAppointments = appointments.filter(a => 
      a.scheduledTime && (a.scheduledTime.toLowerCase().includes('pm') && 
      parseInt(a.scheduledTime.split(':')[0]) >= 5));
    
    console.log(`Found ${appointments.length} appointments for today (${today.toDateString()})`);
    console.log(`Morning: ${morningAppointments.length}, Afternoon: ${afternoonAppointments.length}, Evening: ${eveningAppointments.length}`);
    
    res.json({
      success: true,
      date: today.toISOString(),
      formattedDate: today.toDateString(),
      total: appointments.length,
      data: {
        all: appointments,
        morning: morningAppointments,
        afternoon: afternoonAppointments,
        evening: eveningAppointments
      }
    });
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all appointments - Admin only
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    let query = {};

    // Allow filtering by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const appointments = await Appointment.find(query)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get appointment by ID - Admin and customer (own appointment only)
router.get('/:id', auth, async (req, res) => {
  try {
    console.log('----- FETCHING APPOINTMENT DETAILS -----');
    console.log('User requesting appointment:', {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    });
    console.log('Appointment ID:', req.params.id);

    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      console.log('Appointment not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    console.log('Appointment found:', {
      id: appointment._id,
      customerName: appointment.customerName,
      status: appointment.status,
      customerId: appointment.customerId
    });

    // Check if user is authorized to view this appointment
    if (req.user.role === 'customer') {
      // Check either by customer ID or by customer name
      console.log('Customer authorization check - user name:', req.user.name);
      console.log('Appointment customerName:', appointment.customerName);
      
      const customer = await Customer.findOne({ userId: req.user.id });
      console.log('Customer record found:', customer ? {
        id: customer._id,
        name: customer.name,
        userId: customer.userId
      } : 'No customer record found');
      
      const authorizedById = customer && appointment.customerId && 
                             appointment.customerId.toString() === customer._id.toString();
      const authorizedByName = appointment.customerName === req.user.name;
      
      console.log('Authorization check results:', {
        authorizedById,
        authorizedByName,
        isAuthorized: authorizedById || authorizedByName
      });
      
      if (!(authorizedById || authorizedByName)) {
        console.log('Authorization failed for customer to view appointment');
        return res.status(403).json({ message: 'Not authorized to view this appointment' });
      }
      
      console.log('Customer authorized to view appointment');
    } else if (req.user.role !== 'admin') {
      console.log('Non-admin, non-customer user tried to access appointment');
      return res.status(403).json({ message: 'Not authorized to view appointments' });
    } else {
      console.log('Admin authorized to view appointment');
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update appointment status, schedule date, time and venue - Admin only
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    console.log('----- UPDATING APPOINTMENT -----');
    console.log('Admin updating appointment:', req.params.id);
    console.log('Update data:', req.body);
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      console.log('Appointment not found:', req.params.id);
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const { status, scheduledDate, scheduledTime, venue, adminNotes } = req.body;

    // Update appointment fields
    if (status) {
      console.log(`Changing appointment status from ${appointment.status} to ${status}`);
      appointment.status = status;
    }
    
    if (scheduledDate) appointment.scheduledDate = new Date(scheduledDate);
    if (scheduledTime) appointment.scheduledTime = scheduledTime;
    if (venue) appointment.venue = venue;
    if (adminNotes) appointment.adminNotes = adminNotes;

    appointment.updatedAt = Date.now();

    const updatedAppointment = await appointment.save();
    console.log('Appointment updated successfully');

    res.json({
      success: true,
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: error.message });
  }
});

// Approve appointment - Admin only
router.put('/:id/approve', auth, authorize('admin'), async (req, res) => {
  try {
    console.log('----- APPROVING APPOINTMENT -----');
    console.log('Admin approving appointment:', req.params.id);
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      console.log('Appointment not found:', req.params.id);
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Get data from request body
    const { scheduledDate, scheduledTime, venue, adminNotes } = req.body;

    // Validate required fields for approval
    if (!scheduledDate || !scheduledTime || !venue) {
      return res.status(400).json({ 
        message: 'Please provide scheduledDate, scheduledTime, and venue to approve an appointment' 
      });
    }

    // Update appointment
    appointment.status = 'approved';
    appointment.scheduledDate = new Date(scheduledDate);
    appointment.scheduledTime = scheduledTime;
    appointment.venue = venue;
    if (adminNotes) appointment.adminNotes = adminNotes;
    appointment.updatedAt = Date.now();

    const updatedAppointment = await appointment.save();
    console.log('Appointment approved successfully');

    res.json({
      success: true,
      message: 'Appointment approved successfully',
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Error approving appointment:', error);
    res.status(500).json({ message: error.message });
  }
});

// Reject appointment - Admin only
router.put('/:id/reject', auth, authorize('admin'), async (req, res) => {
  try {
    console.log('----- REJECTING APPOINTMENT -----');
    console.log('Admin rejecting appointment:', req.params.id);
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      console.log('Appointment not found:', req.params.id);
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Get reason for rejection from request body
    const { adminNotes } = req.body;

    if (!adminNotes) {
      return res.status(400).json({ 
        message: 'Please provide adminNotes explaining the reason for rejection' 
      });
    }

    // Update appointment
    appointment.status = 'rejected';
    appointment.adminNotes = adminNotes;
    appointment.updatedAt = Date.now();

    const updatedAppointment = await appointment.save();
    console.log('Appointment rejected successfully');

    res.json({
      success: true,
      message: 'Appointment rejected successfully',
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Error rejecting appointment:', error);
    res.status(500).json({ message: error.message });
  }
});

// Complete appointment - Admin only
router.put('/:id/complete', auth, authorize('admin'), async (req, res) => {
  try {
    console.log('----- COMPLETING APPOINTMENT -----');
    console.log('Admin completing appointment:', req.params.id);
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      console.log('Appointment not found:', req.params.id);
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Get doctor notes from request body
    const { doctorNotes } = req.body;

    // Update appointment
    appointment.status = 'completed';
    if (doctorNotes) appointment.doctorNotes = doctorNotes;
    appointment.updatedAt = Date.now();

    const updatedAppointment = await appointment.save();
    console.log('Appointment marked as completed successfully');

    res.json({
      success: true,
      message: 'Appointment marked as completed successfully',
      data: updatedAppointment
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({ message: error.message });
  }
});

// Cancel appointment - Customer can cancel their own pending appointments
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user is authorized to delete this appointment
    if (req.user.role === 'customer') {
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer || appointment.customerId.toString() !== customer._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
      }
      
      // Customer can only cancel pending appointments
      if (appointment.status !== 'pending') {
        return res.status(400).json({ 
          message: 'Cannot cancel an approved, rejected, or completed appointment. Please contact admin.' 
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel appointments' });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
