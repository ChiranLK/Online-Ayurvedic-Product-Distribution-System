// Role-based authorization middleware
const authorize = (roles) => {
  // Ensure roles is always an array
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    console.log('AUTHORIZE DEBUG - Checking authorization for user:', {
      id: req.user?.id,
      role: req.user?.role,
      allowedRoles: allowedRoles
    });

    if (!req.user) {
      console.log('AUTHORIZE DEBUG - No user attached to request');
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Print full user object for debugging (excluding sensitive data)
    console.log('AUTHORIZE DEBUG - Full user object:', {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status,
      isApproved: req.user.isApproved
    });

    if (!allowedRoles.includes(req.user.role)) {
      console.log(`AUTHORIZE DEBUG - Access denied. User role '${req.user.role}' not in allowed roles:`, allowedRoles);
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        userRole: req.user.role,
        requiredRoles: allowedRoles
      });
    }

    console.log(`AUTHORIZE DEBUG - User ${req.user.name} (${req.user.role}) authorized successfully`);
    next();
  };
};

module.exports = authorize;
