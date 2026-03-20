const mongoose = require('mongoose');

const riskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  resource: {
    type: String,
    required: true,
    trim: true,
  },
  provider: {
    type: String,
    required: true,
    enum: ['AWS', 'Azure', 'GCP'],
    default: 'AWS',
  },
  severity: {
    type: String,
    required: true,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium',
  },
  aiScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  recommendation: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
    default: "This is a detailed description of the security risk and its potential consequences.",
  },
  impact: {
    type: String,
    required: true,
    default: "High: Unauthorized access to business operations and potential data leakage.",
  },
  remediationSteps: {
    type: [String],
    required: true,
    default: ["Identify the affected resource", "Isolate from internet", "Review access policies", "Apply least privilege"],
  },
  environment: {
    type: String,
    required: true,
    enum: ['production', 'staging', 'development'],
    default: 'production',
  },
  service: {
    type: String,
    required: true,
    enum: ['EC2', 'S3', 'RDS', 'IAM', 'Lambda', 'Kubernetes', 'VPC', 'CloudFront', 'SQL', 'KeyVault', 'AD', 'Storage'],
    default: 'EC2',
  },
  riskType: {
    type: String,
    required: true,
    enum: ['Network', 'Identity', 'Data Exposure', 'Misconfiguration', 'Vulnerability'],
    default: 'Misconfiguration',
  },
  region: {
    type: String,
    required: true,
    default: 'us-east-1',
  },
  attackVector: {
    type: String,
    required: true,
    default: 'Exploitation of misconfigured resource allows unauthorized horizontal movement.',
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

// Add index for search
riskSchema.index({ title: 'text', resource: 'text' });

module.exports = mongoose.model('Risk', riskSchema);
