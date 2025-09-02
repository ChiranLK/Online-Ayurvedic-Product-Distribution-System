const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token and attach user to request
const authMiddleware = async (req, res, next) => {
  try {
    // Check for Authorization header
    const authHeader = req.header('Authorization');
    console.log('AUTH DEBUG - Auth header:', authHeader ? 'Present' : 'Missing');
    
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.log('AUTH DEBUG - No token provided in auth middleware');
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    console.log('AUTH DEBUG - Verifying token...');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('AUTH DEBUG - Token decoded successfully:', { userId: decoded.id, role: decoded.role });
    } catch (jwtError) {
      console.error('AUTH DEBUG - JWT verification failed:', jwtError.message);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    // Find user by id
    console.log('AUTH DEBUG - Finding user with ID:', decoded.id);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('AUTH DEBUG - User not found with ID from token:', decoded.id);
      return res.status(401).json({ message: 'User not found' });
    }
    
    console.log('AUTH DEBUG - User authenticated:', { 
      id: user._id, 
      name: user.name,
      email: user.email,
      role: user.role 
    });

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('AUTH DEBUG - Auth middleware error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
