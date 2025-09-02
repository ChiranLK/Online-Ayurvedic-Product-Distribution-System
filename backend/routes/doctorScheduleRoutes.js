const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const DoctorSchedule = require('../models/DoctorSchedule');
const User = require('../models/User');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Get all doctor schedules - Admin only
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    console.log('----- FETCHING ALL DOCTOR SCHEDULES -----');
    
    let query = {};
    
    // Filter by doctor if provided
    if (req.query.doctorId) {
      query.doctorId = req.query.doctorId;
    }
    
    // Filter by day if provided
    if (req.query.dayOfWeek) {
      query.dayOfWeek = req.query.dayOfWeek;
    }
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    const schedules = await DoctorSchedule.find(query).sort({ dayOfWeek: 1 });
    
    console.log(`Found ${schedules.length} doctor schedules`);
    
    res.json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    console.error('Error fetching doctor schedules:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get doctor schedule by ID
router.get('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    console.log('----- FETCHING DOCTOR SCHEDULE -----', req.params.id);
    
    const schedule = await DoctorSchedule.findById(req.params.id);
    
    if (!schedule) {
      console.log('Schedule not found:', req.params.id);
      return res.status(404).json({ message: 'Doctor schedule not found' });
    }
    
    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Error fetching doctor schedule:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new doctor schedule - Admin only
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    console.log('----- CREATING DOCTOR SCHEDULE -----');
    console.log('Schedule data:', req.body);
    
    const { 
      doctorId, 
      doctorName,
      specialization,
      dayOfWeek, 
      date,
      isRecurring,
      morningSlot,
      afternoonSlot,
      eveningSlot,
      status,
      notes
    } = req.body;
    
    // Validate required fields
    if (!doctorId || !doctorName || !dayOfWeek) {
      return res.status(400).json({ message: 'Please provide doctor, name, and day of week' });
    }

    // If a specific date is provided, make sure isRecurring is false
    const scheduleDate = date ? new Date(date) : null;
    const recurring = scheduleDate ? false : (isRecurring || true);
    
    // Check if doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Check if schedule already exists for this doctor on this day
    const existingSchedule = await DoctorSchedule.findOne({ 
      doctorId,
      dayOfWeek,
      ...(scheduleDate ? { date: scheduleDate } : {})
    });
    
    if (existingSchedule) {
      return res.status(400).json({ 
        message: 'A schedule already exists for this doctor on this day' 
      });
    }
    
    // Create new schedule
    const newSchedule = new DoctorSchedule({
      doctorId,
      doctorName,
      specialization: specialization || 'General Ayurveda',
      dayOfWeek,
      date: scheduleDate,
      isRecurring: recurring,
      morningSlot: morningSlot || { available: false },
      afternoonSlot: afternoonSlot || { available: false },
      eveningSlot: eveningSlot || { available: false },
      status: status || 'active',
      notes
    });
    
    const savedSchedule = await newSchedule.save();
    console.log('Doctor schedule created successfully with ID:', savedSchedule._id);
    
    res.status(201).json({
      success: true,
      message: 'Doctor schedule created successfully',
      data: savedSchedule
    });
  } catch (error) {
    console.error('Error creating doctor schedule:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update a doctor schedule - Admin only
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    console.log('----- UPDATING DOCTOR SCHEDULE -----', req.params.id);
    console.log('Update data:', req.body);
    
    const schedule = await DoctorSchedule.findById(req.params.id);
    
    if (!schedule) {
      console.log('Schedule not found:', req.params.id);
      return res.status(404).json({ message: 'Doctor schedule not found' });
    }
    
    const {
      doctorName,
      specialization,
      dayOfWeek,
      date,
      isRecurring,
      morningSlot,
      afternoonSlot,
      eveningSlot,
      status,
      notes
    } = req.body;
    
    // Update fields if provided
    if (doctorName) schedule.doctorName = doctorName;
    if (specialization) schedule.specialization = specialization;
    if (dayOfWeek) schedule.dayOfWeek = dayOfWeek;
    if (date !== undefined) schedule.date = date ? new Date(date) : null;
    if (isRecurring !== undefined) schedule.isRecurring = isRecurring;
    
    // Update time slots if provided
    if (morningSlot) {
      schedule.morningSlot = {
        ...schedule.morningSlot,
        ...morningSlot
      };
    }
    
    if (afternoonSlot) {
      schedule.afternoonSlot = {
        ...schedule.afternoonSlot,
        ...afternoonSlot
      };
    }
    
    if (eveningSlot) {
      schedule.eveningSlot = {
        ...schedule.eveningSlot,
        ...eveningSlot
      };
    }
    
    if (status) schedule.status = status;
    if (notes !== undefined) schedule.notes = notes;
    
    // Update timestamp
    schedule.updatedAt = Date.now();
    
    const updatedSchedule = await schedule.save();
    console.log('Doctor schedule updated successfully');
    
    res.json({
      success: true,
      message: 'Doctor schedule updated successfully',
      data: updatedSchedule
    });
  } catch (error) {
    console.error('Error updating doctor schedule:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a doctor schedule - Admin only
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    console.log('----- DELETING DOCTOR SCHEDULE -----', req.params.id);
    
    const schedule = await DoctorSchedule.findById(req.params.id);
    
    if (!schedule) {
      console.log('Schedule not found:', req.params.id);
      return res.status(404).json({ message: 'Doctor schedule not found' });
    }
    
    await DoctorSchedule.findByIdAndDelete(req.params.id);
    console.log('Doctor schedule deleted successfully');
    
    res.json({
      success: true,
      message: 'Doctor schedule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting doctor schedule:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get available slots for a specific date - Available to all authenticated users
router.get('/available/:date', auth, async (req, res) => {
  try {
    console.log('----- FETCHING AVAILABLE SLOTS -----');
    const dateString = req.params.date;
    
    if (!dateString) {
      return res.status(400).json({ message: 'Please provide a date' });
    }
    
    const requestedDate = new Date(dateString);
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][requestedDate.getDay()];
    
    console.log(`Fetching slots for ${requestedDate.toISOString()}, day: ${dayOfWeek}`);
    
    // Find recurring schedules for this day of week
    const recurringSchedules = await DoctorSchedule.find({
      dayOfWeek,
      isRecurring: true,
      status: 'active'
    });
    
    // Find specific schedules for this date
    const dateSchedules = await DoctorSchedule.find({
      date: {
        $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(requestedDate.setHours(23, 59, 59, 999))
      },
      status: 'active'
    });
    
    // Combine and format the results
    const allSchedules = [...recurringSchedules, ...dateSchedules];
    
    // Group by time slot for easy frontend display
    const availableSlots = {
      morning: [],
      afternoon: [],
      evening: []
    };
    
    allSchedules.forEach(schedule => {
      if (schedule.morningSlot.available) {
        availableSlots.morning.push({
          scheduleId: schedule._id,
          doctorId: schedule.doctorId,
          doctorName: schedule.doctorName,
          specialization: schedule.specialization,
          startTime: schedule.morningSlot.startTime,
          endTime: schedule.morningSlot.endTime
        });
      }
      
      if (schedule.afternoonSlot.available) {
        availableSlots.afternoon.push({
          scheduleId: schedule._id,
          doctorId: schedule.doctorId,
          doctorName: schedule.doctorName,
          specialization: schedule.specialization,
          startTime: schedule.afternoonSlot.startTime,
          endTime: schedule.afternoonSlot.endTime
        });
      }
      
      if (schedule.eveningSlot.available) {
        availableSlots.evening.push({
          scheduleId: schedule._id,
          doctorId: schedule.doctorId,
          doctorName: schedule.doctorName,
          specialization: schedule.specialization,
          startTime: schedule.eveningSlot.startTime,
          endTime: schedule.eveningSlot.endTime
        });
      }
    });
    
    res.json({
      success: true,
      date: requestedDate.toISOString(),
      dayOfWeek,
      data: availableSlots
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
