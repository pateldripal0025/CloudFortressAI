const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

// Helper to sign JWT access token (valid for 24 hours)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, sub: user.email }, 
    config.jwt.secret, 
    { expiresIn: '24h' }
  );
};

// Helper to sign JWT refresh token (valid for 30 days)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, sub: user.email }, 
    config.jwt.secret, 
    { expiresIn: '30d' }
  );
};

// Helper to return standardized token and user object
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Remove password from response
  const userData = user.toObject();
  delete userData.password;

  res.status(statusCode).json({
    status: 'success',
    token,
    refreshToken,
    data: {
      user: userData
    }
  });
};

/**
 * @desc    Secure User Registration
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { fullname, email, password, role } = req.body;

    // 1. Basic Form Validations
    if (!fullname || !email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide full name, work email, and a secure password.'
      });
    }

    // 2. Email format validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid work email address.'
      });
    }

    // 3. Password strength check
    if (password.length < 8) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password must be at least 8 characters long.'
      });
    }

    // 4. Check for duplicate account
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'An operator profile with this work email address already exists.'
      });
    }

    // 5. Create user (password automatically hashed by pre-save hook)
    const newUser = await User.create({
      fullname,
      email,
      password,
      role: role || 'user'
    });

    console.log(`[Security Hub] New user registered successfully: ${newUser.email}`);

    // 6. Return response with session tokens
    sendTokenResponse(newUser, 201, res);
  } catch (err) {
    console.error('[Registration Exception]', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to initialize security operator account.'
    });
  }
};

/**
 * @desc    Secure User Sign In
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Input validations
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide both email and password.'
      });
    }

    // 2. Find user and explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Access Denied: Incorrect email or password.'
      });
    }

    // 3. Verify password
    const isMatch = await user.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'fail',
        message: 'Access Denied: Incorrect email or password.'
      });
    }

    console.log(`[Security Hub] Operator signed in successfully: ${user.email}`);

    // 4. Return response with session tokens
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('[Login Exception]', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to authenticate operator credentials.'
    });
  }
};

/**
 * @desc    Get Current Operator Session Profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve operator profile details.'
    });
  }
};

/**
 * @desc    Access Token Rotation (Refresh)
 * @route   POST /api/auth/refresh
 * @access  Public
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ 
        status: 'fail', 
        message: 'Refresh token is required.' 
      });
    }

    // Verify token crypto signature
    jwt.verify(refreshToken, config.jwt.secret, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ 
          status: 'fail', 
          message: 'Session identity check failed or token expired.' 
        });
      }

      // Check if user still exists in database
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ 
          status: 'fail', 
          message: 'The user belonging to this session no longer exists.' 
        });
      }

      const token = generateAccessToken(user);

      res.status(200).json({
        status: 'success',
        token
      });
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to refresh operator session.' 
    });
  }
};

/**
 * @desc    Sign Out (Clean stateless response)
 * @route   POST /api/auth/logout
 * @access  Public
 */
exports.logout = async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully from Security Node.'
  });
};

/**
 * @desc    Theme-matching mock request for password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid email address.'
      });
    }

    // Standard security behavior to prevent user enumeration
    res.status(200).json({
      status: 'success',
      message: 'If a matching operator profile exists, a security override link has been dispatched.'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to initialize password override sequence.'
    });
  }
};

/**
 * @desc    Theme-matching mock password reset execution
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Credentials updated successfully! You can now log into the Fortress Center.'
  });
};
