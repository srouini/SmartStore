import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import authService from '../api/authService';
import type { User, LoginCredentials } from '../api/authService';
import { TOKEN_STORAGE_KEY } from '../api/axios';

// Local storage keys
const USER_STORAGE_KEY = 'smartstore_user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize user state from localStorage if available
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get CSRF token on initial load
  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        await authService.getCSRFToken();
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };

    getCsrfToken();
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check if we have a token in localStorage
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        
        if (token) {
          console.log('Found auth token in localStorage, verifying with server...');
          // Try to get current user from server using the token
          const userData = await authService.getCurrentUser();
          
          if (userData) {
            // Token is valid, update localStorage with fresh data
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
            
            // Make sure token is stored
            if (userData.token) {
              localStorage.setItem(TOKEN_STORAGE_KEY, userData.token);
            }
            
            setUser(userData);
            console.log('User session verified with server using token');
          } else {
            // Token is invalid or expired
            console.log('Token invalid or expired, clearing session data');
            localStorage.removeItem(USER_STORAGE_KEY);
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            setUser(null);
          }
        } else {
          // No token in localStorage
          console.log('No auth token found in localStorage');
          const savedUser = localStorage.getItem(USER_STORAGE_KEY);
          if (savedUser) {
            console.log('Found user data but no token, clearing session data');
            localStorage.removeItem(USER_STORAGE_KEY);
          }
          setUser(null);
        }
      } catch (error) {
        // Server error or user is not authenticated
        console.log('Authentication check failed, clearing session data');
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      
      // First, ensure we have a CSRF token
      try {
        await authService.getCSRFToken();
      } catch (csrfError) {
        console.error('Failed to get CSRF token:', csrfError);
        // Continue anyway, as the token might already be in cookies
      }
      
      // Then attempt to login
      const userData = await authService.login(credentials);
      
      // Store the authentication token separately for API requests
      if (userData.token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, userData.token);
        console.log('Auth token saved to localStorage');
      }
      
      // Save user data to localStorage
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      
      setUser(userData);
      console.log('User logged in and saved to localStorage');
    } catch (error: any) {
      console.error('Login error details:', error);
      setError(error.response?.data?.error || 'Login failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      
      // Remove user data and token from localStorage
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      
      setUser(null);
      console.log('User logged out and removed from localStorage');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the server logout fails, clear the local state
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
