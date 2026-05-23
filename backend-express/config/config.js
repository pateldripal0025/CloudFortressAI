const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

/**
 * Validate that essential environment variables are set and meet safety standards.
 */
const validateEnv = () => {
  const errors = [];

  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET is required.');
  } else if (process.env.ENV === 'production' && process.env.JWT_SECRET === 'node_super_secret_jwt_key') {
    console.warn('[WARNING] You are using a default JWT_SECRET in production. Change it immediately!');
  }

  if (!process.env.MONGODB_URI) {
    errors.push('MONGODB_URI is required.');
  }

  if (errors.length > 0) {
    console.error('============================================================');
    console.error('[CRITICAL CONFIG ERROR] Missing or invalid environment variables:');
    errors.forEach(err => console.error(`  - ${err}`));
    console.error('============================================================');
    
    // In production, refuse to start the process with broken config
    if (process.env.ENV === 'production') {
      process.exit(1);
    }
  }
};

// Run validations
validateEnv();

const config = {
  env: process.env.ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5001,
  
  mongo: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cloudfortress_node'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-access-secret-key-12345',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key-12345',
    accessExpiry: '15m',
    refreshExpiry: '30d'
  },
  
  smtp: {
    host: process.env.SMTP_HOST || null,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER || null,
    pass: process.env.SMTP_PASS || null,
    from: process.env.EMAIL_FROM || 'security@cloudfortress.ai'
  }
};

module.exports = config;
