const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token and attach user to request
const authMiddleware = async (req, res, next) => {
  try {
    // Check for Authorization header
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader);
    
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided in auth middleware');
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    console.log('Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', { userId: decoded.id });
    
    // Find user by id
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('User not found with ID from token:', decoded.id);
      return res.status(401).json({ message: 'User not found' });
    }
    
    console.log('User authenticated:', { id: user._id, role: user.role });

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
