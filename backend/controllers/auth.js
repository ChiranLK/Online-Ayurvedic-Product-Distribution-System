const User = require('../models/User');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    const { name, email, password, phone, address, city, state, zipcode, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('Creating user with data:', {
      name, email, phone, address, city, state, zipcode, role: role || 'customer'
    });
    
    // If registering as seller, set isApproved to false by default
    const userData = {
      name,
      email,
      password,
      phone,
      address,
      city,
      state,
      zipcode,
      role: role || 'customer' // Default to customer if no role provided
    };

    try {
      // Create user in User collection
      const user = await User.create(userData);
      console.log('User created successfully:', user._id);
      
      // Create entry in Customer or Seller collection based on role
      if (user.role === 'customer') {
        const Customer = require('../models/Customer');
        const customerData = {
          userId: user._id,
          name: user.name,
          email: user.email,
          password: user.password, // Already hashed by User model
          phone: user.phone,
          address: user.address,
          city: user.city,
          state: user.state,
          zipcode: user.zipcode
        };
        
        const newCustomer = await Customer.create(customerData);
        console.log('Customer entry created:', newCustomer._id);
      } else if (user.role === 'seller') {
        const Seller = require('../models/Seller');
        const sellerData = {
          userId: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city,
          state: user.state,
          zipcode: user.zipcode,
          status: user.status
        };
        
        const newSeller = await Seller.create(sellerData);
        console.log('Seller entry created:', newSeller._id);
      }
      
      try {
        // Generate JWT token
        const token = user.getSignedJwtToken();
        console.log('JWT token generated');
        
        res.status(201).json({
          success: true,
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isApproved: user.isApproved
          }
        });
      } catch (tokenError) {
        console.error('Error generating token:', tokenError);
        res.status(500).json({ 
          message: 'Error generating authentication token', 
          error: tokenError.message 
        });
      }
    } catch (userError) {
      console.error('Error creating user:', userError);
      if (userError.name === 'ValidationError') {
        // Mongoose validation error
        const messages = Object.values(userError.errors).map(val => val.message);
        return res.status(400).json({ 
          message: 'Validation Error', 
          errors: messages 
        });
      }
      res.status(500).json({ 
        message: 'Error creating user account', 
        error: userError.message 
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If seller, check if approved
    if (user.role === 'seller' && !user.isApproved) {
      return res.status(403).json({ message: 'Your seller account is pending approval' });
    }

    // Generate JWT token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
