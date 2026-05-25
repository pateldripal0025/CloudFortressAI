const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // 1. Extract Bearer token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        status: 'fail',
        message: 'Authentication token is missing. Please log in.' 
      });
    }

    // 2. Decode and verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (jwtErr) {
      return res.status(401).json({ 
        status: 'fail',
        message: 'Session invalid or expired. Please sign in again.' 
      });
    }

    // 3. Find the user profile in MongoDB
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({ 
        status: 'fail',
        message: 'The security node credentials for this session no longer exist.' 
      });
    }

    // 4. Attach operator context to the request and proceed
    req.user = currentUser;
    next();
  } catch (err) {
    console.error('[Security Middleware Error]', err);
    res.status(500).json({ 
      status: 'error',
      message: 'Internal security authentication check failed.' 
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        status: 'fail',
        message: 'Access Denied: Your operator credentials lack authorization for this sector.' 
      });
    }
    next();
  };
};
