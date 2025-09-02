const mongoose = require('mongoose');

const doctorScheduleSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  dayOfWeek: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  date: {
    type: Date
  },
  isRecurring: {
    type: Boolean,
    default: true
  },
  morningSlot: {
    available: {
      type: Boolean,
      default: false
    },
    startTime: {
      type: String
    },
    endTime: {
      type: String
    },
    maxAppointments: {
      type: Number,
      default: 5
    }
  },
  afternoonSlot: {
    available: {
      type: Boolean,
      default: false
    },
    startTime: {
      type: String
    },
    endTime: {
      type: String
    },
    maxAppointments: {
      type: Number,
      default: 5
    }
  },
  eveningSlot: {
    available: {
      type: Boolean,
      default: false
    },
    startTime: {
      type: String
    },
    endTime: {
      type: String
    },
    maxAppointments: {
      type: Number,
      default: 5
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'leave'],
    default: 'active'
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create a compound index to ensure uniqueness for doctor+day combination
doctorScheduleSchema.index({ doctorId: 1, dayOfWeek: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DoctorSchedule', doctorScheduleSchema);
