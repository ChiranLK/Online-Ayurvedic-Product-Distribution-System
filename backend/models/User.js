const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Please provide an address'],
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  zipcode: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['customer', 'seller', 'admin'],
    default: 'customer'
  },
  isApproved: {
    type: Boolean,
    default: function() {
      // Customers are automatically approved, sellers need approval
      return this.role === 'customer';
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: function() {
      // Customers are automatically approved, sellers need approval
      return this.role === 'seller' ? 'pending' : 'approved';
    }
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not defined!');
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  try {
    console.log('Generating JWT token for user:', { id: this._id, role: this.role });
    return jwt.sign(
      { id: this._id, role: this.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
  } catch (error) {
    console.error('JWT Sign Error:', error);
    throw new Error('Failed to generate authentication token');
  }
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
