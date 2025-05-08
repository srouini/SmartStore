import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
    if (!isOpen)
        return null;
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl'
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50", children: _jsxs("div", { className: `modal-box ${sizeClasses[size]} w-full`, children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "font-bold text-lg", children: title }), _jsx("button", { className: "btn btn-sm btn-circle btn-ghost", onClick: onClose, children: "\u2715" })] }), _jsx("div", { className: "modal-body", children: children }), footer && (_jsx("div", { className: "modal-footer mt-6 flex justify-end gap-2", children: footer }))] }) }));
};
export default Modal;
