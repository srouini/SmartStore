import axios from 'axios';

// Token storage key
export const TOKEN_STORAGE_KEY = 'smartstore_auth_token';

// Create an Axios instance with default config
const api = axios.create({
  baseURL: 'http://216.158.234.163/api/',
  withCredentials: true, // Important for sending cookies with requests
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // This helps Django identify AJAX requests
  },
  xsrfCookieName: 'csrftoken', // Django's CSRF cookie name
  xsrfHeaderName: 'X-CSRFToken', // Django's CSRF header name
});

// Request interceptor to add auth token and CSRF token to requests
api.interceptors.request.use(
  (config) => {
    // Get CSRF token from cookie
    const csrfToken = getCookie('csrftoken');
    
    // If token exists and request is state-changing, add it to headers
    if (csrfToken && config.method !== 'get') {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    // Add auth token to headers if it exists in localStorage
    const authToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (authToken) {
      config.headers['Authorization'] = `Token ${authToken}`;
    }
    
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      withCredentials: config.withCredentials
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Helper function to get cookie value by name
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

export default api;
