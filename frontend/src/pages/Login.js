import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import authService from '../api/authService';
const Login = () => {
    const { login, user, error, clearError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [debugInfo, setDebugInfo] = useState(null);
    const { register, handleSubmit, formState: { errors } } = useForm();
    // Get the return URL from location state or default to home page
    const from = location.state?.from?.pathname || '/';
    // Fetch CSRF token on component mount
    useEffect(() => {
        const fetchCSRFToken = async () => {
            try {
                await authService.getCSRFToken();
                console.log('CSRF token fetched successfully on Login component mount');
            }
            catch (err) {
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
    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            clearError();
            setDebugInfo('Attempting login...');
            // Try to get a fresh CSRF token before login
            try {
                await authService.getCSRFToken();
                setDebugInfo('CSRF token refreshed, attempting login...');
            }
            catch (csrfError) {
                console.warn('Could not refresh CSRF token before login:', csrfError);
                setDebugInfo('Warning: Could not refresh CSRF token. Attempting login anyway...');
            }
            await login(data);
            setDebugInfo('Login successful, redirecting...');
            navigate(from, { replace: true });
        }
        catch (err) {
            console.error('Login error:', err);
            setDebugInfo(`Login failed: ${err.message || 'Unknown error'}. Check console for details.`);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsx("div", { className: "hero min-h-screen bg-base-200", children: _jsxs("div", { className: "hero-content flex-col", children: [_jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-5xl font-bold mb-2", children: "SmartStore" }), _jsx("p", { className: "text-xl", children: "Phone Store Management System" })] }), _jsx("div", { className: "card flex-shrink-0 w-full min-w-[400px] shadow-2xl bg-base-100", children: _jsxs("form", { className: "card-body ", onSubmit: handleSubmit(onSubmit), children: [_jsxs("div", { className: "form-control", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Username" }) }), _jsx("input", { type: "text", placeholder: "username", className: `input input-bordered ${errors.username ? 'input-error' : ''}`, ...register('username', { required: 'Username is required' }) }), errors.username && (_jsx("label", { className: "label", children: _jsx("span", { className: "label-text-alt text-error", children: errors.username.message }) }))] }), _jsxs("div", { className: "form-control", children: [_jsx("label", { className: "label", children: _jsx("span", { className: "label-text", children: "Password" }) }), _jsx("input", { type: "password", placeholder: "password", className: `input input-bordered ${errors.password ? 'input-error' : ''}`, ...register('password', { required: 'Password is required' }) }), errors.password && (_jsx("label", { className: "label", children: _jsx("span", { className: "label-text-alt text-error", children: errors.password.message }) }))] }), error && (_jsxs("div", { className: "alert alert-error mt-4", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "stroke-current shrink-0 h-6 w-6", fill: "none", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsx("span", { children: error })] })), debugInfo && (_jsxs("div", { className: "alert alert-info mt-2 text-xs", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", className: "stroke-current shrink-0 w-6 h-6", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsxs("span", { children: ["Debug: ", debugInfo] })] })), _jsx("div", { className: "form-control mt-6", children: _jsx("button", { type: "submit", className: `btn btn-primary ${isSubmitting ? 'loading' : ''}`, disabled: isSubmitting, children: isSubmitting ? 'Logging in...' : 'Login' }) })] }) })] }) }));
};
export default Login;
