import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        }
        catch (error) {
            console.error('Logout failed:', error);
        }
    };
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    return (_jsxs("div", { className: "navbar bg-base-100 shadow-md", children: [_jsxs("div", { className: "navbar-start", children: [_jsxs("div", { className: "dropdown", children: [_jsx("div", { tabIndex: 0, role: "button", className: "btn btn-ghost lg:hidden", onClick: toggleMenu, children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M4 6h16M4 12h8m-8 6h16" }) }) }), isMenuOpen && (_jsxs("ul", { tabIndex: 0, className: "menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52", children: [_jsx("li", { children: _jsx(Link, { to: "/", onClick: () => setIsMenuOpen(false), children: "Home" }) }), _jsx("li", { children: _jsx(Link, { to: "/phones", onClick: () => setIsMenuOpen(false), children: "Phones" }) }), _jsx("li", { children: _jsx(Link, { to: "/accessories", onClick: () => setIsMenuOpen(false), children: "Accessories" }) }), _jsx("li", { children: _jsx(Link, { to: "/brands", onClick: () => setIsMenuOpen(false), children: "Brands" }) }), _jsx("li", { children: _jsx(Link, { to: "/models", onClick: () => setIsMenuOpen(false), children: "Models" }) }), _jsx("li", { children: _jsx(Link, { to: "/purchases", onClick: () => setIsMenuOpen(false), children: "Purchases" }) }), _jsx("li", { children: _jsx(Link, { to: "/sales", onClick: () => setIsMenuOpen(false), children: "Sales" }) })] }))] }), _jsx(Link, { to: "/", className: "btn btn-ghost normal-case text-xl", children: "SmartStore" })] }), _jsx("div", { className: "navbar-center hidden lg:flex", children: _jsxs("ul", { className: "menu menu-horizontal px-1", children: [_jsx("li", { children: _jsx(Link, { to: "/phones", children: "Phones" }) }), _jsx("li", { children: _jsx(Link, { to: "/accessories", children: "Accessories" }) }), _jsx("li", { children: _jsx(Link, { to: "/brands", children: "Brands" }) }), _jsx("li", { children: _jsx(Link, { to: "/models", children: "Models" }) }), _jsx("li", { children: _jsx(Link, { to: "/purchases", children: "Purchases" }) }), _jsx("li", { children: _jsx(Link, { to: "/sales", children: "Sales" }) })] }) }), _jsx("div", { className: "navbar-end", children: user ? (_jsxs("div", { className: "dropdown dropdown-end", children: [_jsx("div", { tabIndex: 0, role: "button", className: "btn btn-ghost", children: _jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "mr-2", children: user.username }), _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 9l-7 7-7-7" }) })] }) }), _jsx("ul", { tabIndex: 0, className: "menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52", children: _jsx("li", { children: _jsx("a", { onClick: handleLogout, children: "Logout" }) }) })] })) : (_jsx(Link, { to: "/login", className: "btn btn-primary", children: "Login" })) })] }));
};
export default Navbar;
