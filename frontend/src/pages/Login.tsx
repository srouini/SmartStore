import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import authService from '../api/authService';

interface LoginFormData {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const { login, user, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  // Get the return URL from location state or default to home page
  const from = (location.state as any)?.from?.pathname || '/';

  // Fetch CSRF token on component mount
  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        await authService.getCSRFToken();
        console.log('CSRF token fetched successfully on Login component mount');
      } catch (err) {
        console.error('Error fetching CSRF token:', err);
        setDebugInfo('Failed to fetch CSRF token. Check console for details.');
      }
    };
    
    fetchCSRFToken();
  }, []);

  // If user is already logged in, redirect to the return URL
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      clearError();
      setDebugInfo('Attempting login...');
      
      // Try to get a fresh CSRF token before login
      try {
        await authService.getCSRFToken();
        setDebugInfo('CSRF token refreshed, attempting login...');
      } catch (csrfError) {
        console.warn('Could not refresh CSRF token before login:', csrfError);
        setDebugInfo('Warning: Could not refresh CSRF token. Attempting login anyway...');
      }
      
      await login(data);
      setDebugInfo('Login successful, redirecting...');
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setDebugInfo(`Login failed: ${err.message || 'Unknown error'}. Check console for details.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-2">SmartStore</h1>
          <p className="text-xl">Phone Store Management System</p>
        </div>
        <div className="card flex-shrink-0 w-full min-w-[400px] shadow-2xl bg-base-100">
          <form className="card-body " onSubmit={handleSubmit(onSubmit)}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type="text"
                placeholder="username"
                className={`input input-bordered ${errors.username ? 'input-error' : ''}`}
                {...register('username', { required: 'Username is required' })}
              />
              {errors.username && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.username.message}</span>
                </label>
              )}
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="password"
                className={`input input-bordered ${errors.password ? 'input-error' : ''}`}
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.password.message}</span>
                </label>
              )}
            </div>
            {error && (
              <div className="alert alert-error mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            {debugInfo && (
              <div className="alert alert-info mt-2 text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Debug: {debugInfo}</span>
              </div>
            )}
            <div className="form-control mt-6">
              <button
                type="submit"
                className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
