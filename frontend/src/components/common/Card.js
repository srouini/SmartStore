import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Card = ({ title, children, footer, className = '' }) => {
    return (_jsxs("div", { className: `card bg-base-100 shadow-md ${className}`, children: [title && (_jsx("div", { className: "card-title p-4 border-b border-base-200", children: _jsx("h2", { className: "text-lg font-semibold", children: title }) })), _jsx("div", { className: "card-body p-4", children: children }), footer && (_jsx("div", { className: "card-footer p-4 border-t border-base-200", children: footer }))] }));
};
export default Card;
