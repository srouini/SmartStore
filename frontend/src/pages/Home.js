import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import stockService from '../api/stockService';
const Home = () => {
    const { user } = useAuth();
    const [lowStockCount, setLowStockCount] = useState(0);
    const [outOfStockCount, setOutOfStockCount] = useState(0);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchStockData = async () => {
            try {
                setLoading(true);
                const lowStockResponse = await stockService.getLowStock();
                const outOfStockResponse = await stockService.getOutOfStock();
                setLowStockCount(lowStockResponse.count);
                setOutOfStockCount(outOfStockResponse.count);
            }
            catch (error) {
                console.error('Error fetching stock data:', error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchStockData();
    }, []);
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("h1", { className: "text-4xl font-bold mb-4", children: "Welcome to SmartStore" }), _jsx("p", { className: "text-xl", children: "Phone Store Management System" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [_jsx("div", { className: "stats shadow", children: _jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-title", children: "Low Stock Items" }), _jsx("div", { className: "stat-value text-warning", children: loading ? _jsx("span", { className: "loading loading-spinner" }) : lowStockCount }), _jsx("div", { className: "stat-desc", children: _jsx(Link, { to: "/purchases", className: "link link-hover text-primary", children: "Add Stock" }) })] }) }), _jsx("div", { className: "stats shadow", children: _jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-title", children: "Out of Stock Items" }), _jsx("div", { className: "stat-value text-error", children: loading ? _jsx("span", { className: "loading loading-spinner" }) : outOfStockCount }), _jsx("div", { className: "stat-desc", children: _jsx(Link, { to: "/purchases", className: "link link-hover text-primary", children: "Add Stock" }) })] }) }), _jsx("div", { className: "stats shadow", children: _jsxs("div", { className: "stat", children: [_jsx("div", { className: "stat-title", children: "Quick Actions" }), _jsxs("div", { className: "stat-desc mt-2", children: [_jsx(Link, { to: "/sales/new", className: "btn btn-primary btn-sm w-full mb-2", children: "Record Sale" }), _jsx(Link, { to: "/purchases", className: "btn btn-secondary btn-sm w-full", children: "Add Stock" })] })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8", children: [_jsx("div", { className: "card bg-base-100 shadow-xl", children: _jsxs("div", { className: "card-body", children: [_jsx("h2", { className: "card-title", children: "Phones" }), _jsx("p", { children: "Manage your phone inventory" }), _jsx("div", { className: "card-actions justify-end", children: _jsx(Link, { to: "/phones", className: "btn btn-primary", children: "View" }) })] }) }), _jsx("div", { className: "card bg-base-100 shadow-xl", children: _jsxs("div", { className: "card-body", children: [_jsx("h2", { className: "card-title", children: "Accessories" }), _jsx("p", { children: "Manage your accessory inventory" }), _jsx("div", { className: "card-actions justify-end", children: _jsx(Link, { to: "/accessories", className: "btn btn-primary", children: "View" }) })] }) }), _jsx("div", { className: "card bg-base-100 shadow-xl", children: _jsxs("div", { className: "card-body", children: [_jsx("h2", { className: "card-title", children: "Sales" }), _jsx("p", { children: "View and record sales" }), _jsx("div", { className: "card-actions justify-end", children: _jsx(Link, { to: "/sales", className: "btn btn-primary", children: "View" }) })] }) }), _jsx("div", { className: "card bg-base-100 shadow-xl", children: _jsxs("div", { className: "card-body", children: [_jsx("h2", { className: "card-title", children: "Brands & Models" }), _jsx("p", { children: "Manage brands and models" }), _jsx("div", { className: "card-actions justify-end", children: _jsx(Link, { to: "/brands", className: "btn btn-primary", children: "View" }) })] }) })] }), _jsx("div", { className: "mt-12 text-center", children: _jsxs("p", { className: "text-lg", children: ["Logged in as ", _jsx("span", { className: "font-bold", children: user?.username })] }) })] }));
};
export default Home;
