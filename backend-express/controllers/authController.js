const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const LoginHistory = require('../models/LoginHistory');
const Notification = require('../models/Notification');
const { validate, schemas } = require('../utils/validationHelper');
const { 
  sendVerificationEmail, 
  sendPasswordResetEmail, 
  sendSecurityNotificationEmail 
} = require('../utils/emailService');

const config = require('../config/config');

const JWT_ACCESS_EXPIRY = config.jwt.accessExpiry;
const JWT_REFRESH_EXPIRY = config.jwt.refreshExpiry;

const getAccessSecret = () => config.jwt.secret;
const getRefreshSecret = () => config.jwt.refreshSecret;

// Sign token generator helpers
const generateAccessToken = (id) => {
  return jwt.sign({ id }, getAccessSecret(), { expiresIn: JWT_ACCESS_EXPIRY });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, getRefreshSecret(), { expiresIn: JWT_REFRESH_EXPIRY });
};

/**
 * Pushes realtime notifications via Socket.IO and persists in MongoDB.
 */
const triggerRealtimeNotification = async (userId, type, message, severity = 'medium') => {
  try {
    // 1. Persist notification
    const notification = await Notification.create({
      user: userId,
      title: type.replace(/_/g, ' ').toUpperCase(),
      message,
      type,
      severity,
      read: false
    });

    // 2. Broadcast via Socket.IO if active
    if (global.io) {
      console.log(`[Socket.IO] Emitting notification to room ${userId}:`, type);
      global.io.to(userId.toString()).emit('notification', {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        severity: notification.severity,
        createdAt: notification.createdAt
      });
    }
  } catch (err) {
    console.error('[Notification Hub] Error triggering notification:', err.message);
  }
};

/**
 * Core User Sign Up
 */
exports.register = async (req, res) => {
  try {
    console.log('[Auth] Registration Request:', req.body);
    validate(req.body, schemas.registerSchema);

    const { name, email, password, role, organization } = req.body;

    // 1. Prevent duplicate registration
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'An account with this email address already exists.'
      });
    }

    // 2. Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // 3. Create User (unverified)
    const newUser = await User.create({
      name,
      email,
      password, // Pre-save hook hashes this automatically
      role: role || 'user',
      organization: organization || 'CloudFortress Client',
      isEmailVerified: false,
      emailVerificationOTP: otp,
      emailVerificationExpires: otpExpires
    });

    // 4. Send Verification Email
    const verificationLink = `http://localhost:3000/verify-email?email=${encodeURIComponent(email)}&otp=${otp}`;
    await sendVerificationEmail(email, name, otp, verificationLink);

    res.status(201).json({
      status: 'success',
      message: 'Account initialized! Please complete verification via the OTP sent to your email.',
      email: newUser.email,
      otp: config.env === 'development' ? otp : undefined
    });
  } catch (err) {
    console.error('[Auth] Registration Exception:', err);
    res.status(err.statusCode || 400).json({
      status: 'fail',
      message: err.message,
      details: err.details
    });
  }
};

/**
 * Confirm OTP Email Verification
 */
exports.verifyEmail = async (req, res) => {
  try {
    validate(req.body, schemas.verifyEmailSchema);
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select('+emailVerificationOTP +emailVerificationExpires');
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ status: 'fail', message: 'Email is already verified' });
    }

    if (user.emailVerificationOTP !== otp || new Date() > user.emailVerificationExpires) {
      return res.status(400).json({ status: 'fail', message: 'Invalid or expired OTP code' });
    }

    // Clear verification codes
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    await triggerRealtimeNotification(
      user._id, 
      'account_verification_success', 
      'Your email address has been successfully verified. Full dashboard access is now unlocked.', 
      'low'
    );

    // Generate token credentials for automatic sign-in
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store Session / Refresh Token in MongoDB
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      device: req.headers['user-agent'] || 'Unknown Browser',
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      expiresAt
    });

    res.status(200).json({
      status: 'success',
      message: 'Email verification successful! Session established.',
      token: accessToken,
      refreshToken: refreshToken,
      data: { user }
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      status: 'fail',
      message: err.message
    });
  }
};

/**
 * User Sign In
 */
exports.login = async (req, res) => {
  try {
    validate(req.body, schemas.loginSchema);
    const { email, password } = req.body;

    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const device = req.headers['user-agent'] || 'Unknown Browser';

    // 1. Validate user matching
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password, user.password))) {
      // Log failed audit event
      await LoginHistory.create({ email, ip, device, status: 'failed', reason: 'Incorrect credentials' });
      return res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
    }

    // 2. Enforce email verification gates
    if (!user.isEmailVerified) {
      await LoginHistory.create({ user: user._id, email, ip, device, status: 'failed', reason: 'Unverified email' });
      return res.status(403).json({ 
        status: 'fail', 
        message: 'Account not verified. Please verify your email first.' 
      });
    }

    // 3. Device Security Inspection & Tracking
    const previousSuccessLogin = await LoginHistory.findOne({ 
      user: user._id, 
      status: 'success' 
    }).sort({ createdAt: -1 });

    let isNewDevice = false;
    if (previousSuccessLogin && previousSuccessLogin.device !== device) {
      isNewDevice = true;
    }

    // 4. Generate token credentials
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // 5. Store Session / Refresh Token in MongoDB
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      device,
      ip,
      expiresAt
    });

    // 6. Save audit history
    await LoginHistory.create({ 
      user: user._id, 
      email, 
      ip, 
      device, 
      status: isNewDevice ? 'suspicious' : 'success', 
      reason: isNewDevice ? 'New device profile detected' : 'Standard authentication' 
    });

    // 7. Fire Realtime Notifications
    if (isNewDevice) {
      await triggerRealtimeNotification(
        user._id,
        'suspicious_login_attempt',
        `Security Notice: A sign-in was detected from a new browser/device profile: ${device} | IP: ${ip}`,
        'high'
      );
      await sendSecurityNotificationEmail(
        user.email,
        user.name,
        'Suspicious Sign-In Detected',
        `A successful login was registered from a brand-new device environment. Device: ${device} | IP Location: ${ip}`
      );
    } else {
      await triggerRealtimeNotification(
        user._id,
        'successful_login',
        `System Access: Session established successfully from IP ${ip}.`,
        'low'
      );
    }

    // Clear password before sending
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token: accessToken,
      refreshToken: refreshToken,
      data: { user }
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      status: 'fail',
      message: err.message
    });
  }
};

/**
 * Access Token Rotation (Refresh)
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ status: 'fail', message: 'Refresh token is required' });
    }

    // 1. Check database session
    const dbToken = await RefreshToken.findOne({ token: refreshToken });
    if (!dbToken || new Date() > dbToken.expiresAt) {
      return res.status(401).json({ status: 'fail', message: 'Session expired or invalidated' });
    }

    // 2. Validate token crypto
    jwt.verify(refreshToken, getRefreshSecret(), async (err, decoded) => {
      if (err) {
        return res.status(401).json({ status: 'fail', message: 'Session identity check failed' });
      }

      // 3. Generate brand new access token
      const newAccessToken = generateAccessToken(decoded.id);
      
      res.status(200).json({
        status: 'success',
        token: newAccessToken
      });
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

/**
 * Sign Out (Revoke Single Session)
 */
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

/**
 * Revoke All Sessions across all devices
 */
exports.logoutAllDevices = async (req, res) => {
  try {
    const userId = req.user._id;
    await RefreshToken.deleteMany({ user: userId });
    
    await triggerRealtimeNotification(
      userId,
      'security_alert',
      'All active operator sessions have been remotely terminated. Logins revoked from all devices.',
      'high'
    );

    res.status(200).json({
      status: 'success',
      message: 'All device sessions terminated successfully.'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

/**
 * Request Password Reset Email
 */
exports.forgotPassword = async (req, res) => {
  try {
    validate(req.body, schemas.forgotPasswordSchema);
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Return 200 to prevent user enumeration attacks
      return res.status(200).json({
        status: 'success',
        message: 'If a profile matches that email, a password reset link was dispatched.'
      });
    }

    // 1. Generate 32-byte hex secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // 2. Hash and save to database
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = resetExpires;
    await user.save();

    // 3. Dispatch Email
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    await sendPasswordResetEmail(email, user.name, resetLink);

    res.status(200).json({
      status: 'success',
      message: 'Password reset instructions dispatched successfully.'
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      status: 'fail',
      message: err.message
    });
  }
};

/**
 * Reset Credentials with Token
 */
exports.resetPassword = async (req, res) => {
  try {
    validate(req.body, schemas.resetPasswordSchema);
    const { token, password } = req.body;

    if (!token) {
      return res.status(400).json({ status: 'fail', message: 'Token is required' });
    }

    // 1. Hash the incoming verification token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Find user matching token within lifespan
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password reset link is invalid or has expired.'
      });
    }

    // 3. Commit new credentials
    user.password = password; // Pre-save hashes this automatically
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 4. Alert user
    await triggerRealtimeNotification(
      user._id,
      'password_change',
      'Alert: Your profile security password was successfully modified.',
      'high'
    );
    await sendSecurityNotificationEmail(
      user.email,
      user.name,
      'Password Modification',
      'The password credentials for your CloudFortress AI user account were successfully changed.'
    );

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully! You can now log in.'
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      status: 'fail',
      message: err.message
    });
  }
};

/**
 * Retrieve User Profile
 */
exports.getMe = async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { user: req.user }
  });
};

// Database Fallback Proxy Wrapper
// Redirects all exported authentication operations to local JSON file storage if MongoDB is down
const mongoose = require('mongoose');
const fallback = require('./authControllerFallback');

const originalExports = {
  register: exports.register,
  verifyEmail: exports.verifyEmail,
  login: exports.login,
  refreshToken: exports.refreshToken,
  logout: exports.logout,
  logoutAllDevices: exports.logoutAllDevices,
  forgotPassword: exports.forgotPassword,
  resetPassword: exports.resetPassword,
  getMe: exports.getMe
};

Object.keys(originalExports).forEach(key => {
  exports[key] = async (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
      console.log(`[Database Fallback] MongoDB offline. Routing '${key}' through local JSON store...`);
      return fallback[key](req, res, next);
    }
    return originalExports[key](req, res, next);
  };
});

