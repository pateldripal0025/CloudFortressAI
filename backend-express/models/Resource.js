const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
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

module.exports = mongoose.model('Resource', resourceSchema);
