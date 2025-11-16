// Backend API Configuration
// Update this URL to match your backend server
// For local development, use your computer's IP address instead of localhost
// Example: 'http://192.168.1.100:8008' (replace with your actual IP)

const API_CONFIG = {
  // For local development - replace with your computer's local IP
  // To find your IP: 
  // - Mac/Linux: ifconfig | grep "inet " | grep -v 127.0.0.1
  // - Windows: ipconfig | findstr IPv4
  BASE_URL: 'http://172.20.16.159:8008', // Update this if your IP changes
  
  // API endpoints
  PREDICT_ENDPOINT: '/predict',
};

export default API_CONFIG;

