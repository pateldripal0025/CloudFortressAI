const mongoose = require('mongoose');
const User = require('../models/User');

const seedUsers = async () => {
  try {
    console.log('[Seed] Initializing users database...');

    // Helper to wait for database connection
    const waitForConnection = async () => {
      for (let i = 0; i < 50; i++) {
        if (mongoose.connection.readyState === 1) return true;
        if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) return false;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return mongoose.connection.readyState === 1;
    };

    const isDbConnected = await waitForConnection();
    if (isDbConnected) {
      const existingUser = await User.findOne({ email: 'test@user.com' });
      if (!existingUser) {
        await User.create({
          fullname: 'Test User',
          email: 'test@user.com',
          password: 'password',
          role: 'admin'
        });
        console.log('[Seed] Test user created in MongoDB successfully');
      } else {
        console.log('[Seed] Test user already exists in MongoDB');
      }
    } else {
      console.warn('[Seed] MongoDB not connected within timeout. Skipping MongoDB test user seeding.');
    }
  } catch (err) {
    console.error('[Seed] General seeding exception:', err.message);
  }
};

module.exports = seedUsers;
