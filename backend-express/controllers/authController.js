const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret-key-12345', {
    expiresIn: '30d'
  });
};

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  });
};

exports.register = async (req, res) => {
  try {
    console.log('[Backend] Registration Request Received:', req.body);
    const { name, email, password, role, organization } = req.body;
    
    const newUser = await User.create({
      name,
      email,
      password,
      role,
      organization
    });

    console.log('[Backend] User Created Successfully:', newUser.email);
    sendToken(newUser, 201, res);
  } catch (err) {
    console.error('[Backend] Registration Error:', err.message);
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password, user.password))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    sendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { user: req.user }
  });
};
