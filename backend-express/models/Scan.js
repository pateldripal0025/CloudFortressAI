const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['Completed', 'Failed', 'Running'],
    default: 'Running',
  },
  environment: {
    type: String,
    required: true,
    enum: ['production', 'staging', 'development'],
    default: 'production',
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {

  timestamps: true,
});

module.exports = mongoose.model('Scan', scanSchema);
