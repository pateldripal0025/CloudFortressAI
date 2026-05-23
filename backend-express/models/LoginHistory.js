const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  ip: {
    type: String,
    default: '127.0.0.1'
  },
  device: {
    type: String,
    default: 'Unknown Browser'
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'suspicious'],
    required: true
  },
  reason: {
    type: String,
    default: 'No reason provided'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
