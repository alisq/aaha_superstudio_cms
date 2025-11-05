// API configuration - uses environment variables for deployment
// In development, defaults to localhost
// In production (Railway), uses the same domain (relative URLs)
const getApiUrl = () => {
  // If REACT_APP_API_URL is set, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // In production, use relative URLs (same domain)
  if (process.env.NODE_ENV === 'production') {
    return '';
  }
  
  // In development, use localhost
  return 'http://localhost:3000';
};

export const API_URL = getApiUrl();

