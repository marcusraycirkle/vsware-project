const jwt = require('jsonwebtoken');
const User = require('../models/User');

const normalizeRole = (role) => (typeof role === 'string' ? role.toLowerCase() : '');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is inactive' });
    }
    
    // Add user to request
    req.user = user;
    req.user.role = normalizeRole(req.user.role);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  let options = {};
  if (roles.length > 0) {
    const last = roles[roles.length - 1];
    if (last && typeof last === 'object' && !Array.isArray(last)) {
      options = roles.pop();
    }
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const allowedRoles = roles.flat().map(normalizeRole);
    const currentRole = normalizeRole(req.user.role);
    const isWrite = !['GET', 'HEAD', 'OPTIONS'].includes(req.method.toUpperCase());

    const allowWriteFor = (options.allowWriteFor || []).map(normalizeRole);
    if (isWrite && ['teacher', 'student'].includes(currentRole) && !allowWriteFor.includes(currentRole)) {
      return res.status(403).json({
        message: 'Read-only access. Write permissions are restricted to administrators.'
      });
    }

    if (!allowedRoles.includes(currentRole)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    
    next();
  };
};

module.exports = { auth, authorize };
