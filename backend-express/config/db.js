const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongo.uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`============================================================`);
    console.error(`[DATABASE CRITICAL WARNING] MongoDB failed to connect!`);
    console.error(`URI attempted: ${config.mongo.uri}`);
    console.error(`Error details: ${error.message}`);
    console.error(`Please verify MongoDB is started (e.g., net start MongoDB).`);
    console.error(`============================================================`);
    // Prevent process.exit(1) to let the Express server start and serve requests
  }
};

module.exports = connectDB;
