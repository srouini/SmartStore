import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Phones from './pages/Phones';
import Accessories from './pages/Accessories';
import Brands from './pages/Brands';
import Models from './pages/Models';
import Purchases from './pages/Purchases';
import Sales from './pages/Sales';
// Import CSS
import './index.css';
function App() {
    return (_jsx(AuthProvider, { children: _jsx(Router, { children: _jsx("div", { className: "min-h-screen flex flex-col", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { element: _jsx(ProtectedRoute, {}), children: _jsxs(Route, { element: _jsx(Layout, {}), children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/phones", element: _jsx(Phones, {}) }), _jsx(Route, { path: "/accessories", element: _jsx(Accessories, {}) }), _jsx(Route, { path: "/brands", element: _jsx(Brands, {}) }), _jsx(Route, { path: "/models", element: _jsx(Models, {}) }), _jsx(Route, { path: "/purchases", element: _jsx(Purchases, {}) }), _jsx(Route, { path: "/sales", element: _jsx(Sales, {}) })] }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }) }) }));
}
// Layout component with Navbar
function Layout() {
    return (_jsxs(_Fragment, { children: [_jsx(Navbar, {}), _jsx("main", { className: "flex-grow", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/phones", element: _jsx(Phones, {}) }), _jsx(Route, { path: "/accessories", element: _jsx(Accessories, {}) }), _jsx(Route, { path: "/brands", element: _jsx(Brands, {}) }), _jsx(Route, { path: "/models", element: _jsx(Models, {}) }), _jsx(Route, { path: "/purchases", element: _jsx(Purchases, {}) }), _jsx(Route, { path: "/sales", element: _jsx(Sales, {}) })] }) }), _jsx("footer", { className: "footer footer-center p-4 bg-base-300 text-base-content", children: _jsx("div", { children: _jsxs("p", { children: ["Copyright \u00A9 ", new Date().getFullYear(), " - SmartStore"] }) }) })] }));
}
export default App;
