import api from './axios';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  token: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

const authService = {
  // Get CSRF token
  getCSRFToken: async () => {
    try {
      console.log('Fetching CSRF token...');
      const response = await api.get('auth/csrf/');
      console.log('CSRF token response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      throw error;
    }
  },

  // Login user
  login: async (credentials: LoginCredentials) => {
    try {
      console.log('Attempting login for user:', credentials.username);
      // Make sure we have the latest CSRF token before login
      await authService.getCSRFToken();
      
      // Now attempt the login
      const response = await api.post('auth/login/', credentials);
      console.log('Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error in service:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      console.log('Attempting logout...');
      const response = await api.post('auth/logout/');
      console.log('Logout successful');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      console.log('Fetching current user...');
      const response = await api.get('auth/user/');
      console.log('Current user data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching current user:', error);
      // Don't throw for authentication errors as they're expected when not logged in
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.log('User not authenticated (expected)');
        return null;
      }
      
      // For network errors, also return null instead of throwing
      if (error.message && (error.message.includes('Network Error') || error.message.includes('timeout'))) {
        console.log('Network error when fetching user, treating as not authenticated');
        return null;
      }
      
      throw error;
    }
  },
};

export default authService;
