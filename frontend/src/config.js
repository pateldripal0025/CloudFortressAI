/**
 * CloudFortress AI: Centralized Frontend Configuration Management
 * Resolves configuration parameters dynamically based on environment.
 */

// Dynamically check window host if served from backend directly in production
const getAPIBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback for production if hosted in unified container/server
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  
  // Local development default Node port
  return 'http://localhost:5001';
};

const config = {
  // Base URLs for API calls
  apiUrl: getAPIBaseURL(),
  
  // Socket.io configuration
  socketUrl: getAPIBaseURL(),
  
  // Production flags
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  
  // App settings
  appName: 'CloudFortress AI'
};

export default config;
