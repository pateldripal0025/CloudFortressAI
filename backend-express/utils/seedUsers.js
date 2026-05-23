const fileStorage = require('./fileStorage');

const seedUsers = async () => {
  try {
    console.log('[Seed] Initializing users database...');
    
    // Create test user
    const testUser = await fileStorage.createUser({
      name: 'Test User',
      email: 'test@user.com',
      password: 'password',
      role: 'admin',
      organization: 'CloudFortress'
    });

    console.log('[Seed] Test user created successfully:', testUser.email);
  } catch (err) {
    if (err.message === 'Email already in use') {
      console.log('[Seed] Test user already exists');
    } else {
      console.error('[Seed] Error creating test user:', err.message);
    }
  }
};

module.exports = seedUsers;
