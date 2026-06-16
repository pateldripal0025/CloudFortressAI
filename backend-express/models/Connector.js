const mongoose = require('mongoose');

const connectorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  provider: {
    type: String,
    required: true,
    enum: ['AWS', 'Azure', 'GCP'],
    default: 'AWS'
  },
  credentials: {
    type: Map,
    of: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Error'],
    default: 'Active'
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Connector', connectorSchema);
