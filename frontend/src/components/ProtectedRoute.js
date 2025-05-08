import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
const ProtectedRoute = () => {
    const { user, loading } = useAuth();
    const location = useLocation();
    // If still loading, show a loading indicator
    if (loading) {
        return (_jsx("div", { className: "flex justify-center items-center h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary" }) }));
    }
    // If not authenticated, redirect to login page with the return url
    if (!user) {
        return _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
    }
    // If authenticated, render the child routes
    return _jsx(Outlet, {});
};
export default ProtectedRoute;
