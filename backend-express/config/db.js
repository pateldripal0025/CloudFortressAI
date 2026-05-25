const mongoose = require('mongoose');
const config = require('./config');

/**
 * Dynamically escapes credentials in MongoDB URI to support special characters (like @, :, /).
 */
const escapeMongodbUri = (uri) => {
  if (!uri) return uri;
  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    return uri;
  }
  try {
    const schemeSplit = uri.split("://");
    const scheme = schemeSplit[0];
    const rest = schemeSplit[1];
    
    let restWithoutQuery = rest;
    let querySuffix = "";
    if (rest.includes("?")) {
      const querySplit = rest.split("?", 2);
      restWithoutQuery = querySplit[0];
      querySuffix = "?" + querySplit[1];
    }
    
    if (restWithoutQuery.includes("@")) {
      const lastAtIndex = restWithoutQuery.lastIndexOf("@");
      const credentials = restWithoutQuery.substring(0, lastAtIndex);
      const hostPath = restWithoutQuery.substring(lastAtIndex + 1);
      
      if (credentials.includes(":")) {
        const credSplit = credentials.split(":");
        const username = credSplit[0];
        const password = credSplit.slice(1).join(":");
        
        const usernameEscaped = encodeURIComponent(decodeURIComponent(username));
        const passwordEscaped = encodeURIComponent(decodeURIComponent(password));
        return `${scheme}://${usernameEscaped}:${passwordEscaped}@${hostPath}${querySuffix}`;
      } else {
        const usernameEscaped = encodeURIComponent(decodeURIComponent(credentials));
        return `${scheme}://${usernameEscaped}@${hostPath}${querySuffix}`;
      }
    }
  } catch (err) {
    console.error('[Database config] Error escaping MongoDB URI:', err.message);
  }
  return uri;
};

const connectDB = async () => {
  const rawUri = config.mongo.uri;
  const escapedUri = escapeMongodbUri(rawUri);
  
  // Mask credentials in connection logs
  let maskedUri = rawUri;
  if (maskedUri && maskedUri.includes('@')) {
    try {
      const schemeSplit = maskedUri.split('://');
      const rest = schemeSplit[1];
      const lastAtIndex = rest.lastIndexOf('@');
      const hostPath = rest.substring(lastAtIndex + 1);
      maskedUri = `${schemeSplit[0]}://****:****@${hostPath}`;
    } catch (e) {
      maskedUri = 'mongodb://****:****@hidden';
    }
  }

  try {
    console.log(`Connecting to database at ${maskedUri}...`);
    mongoose.set('bufferCommands', false); // Disable query buffering when disconnected to fail fast
    const conn = await mongoose.connect(escapedUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`============================================================`);
    console.error(`[DATABASE CRITICAL WARNING] MongoDB failed to connect!`);
    console.error(`URI attempted: ${maskedUri}`);
    console.error(`Error details: ${error.message}`);
    console.error(`============================================================`);
    
    // In production, exit the process so Railway can flag the service as unhealthy and restart
    if (config.env === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
