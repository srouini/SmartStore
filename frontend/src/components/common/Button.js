import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Button = ({ children, variant = 'primary', size = 'md', isLoading = false, icon, className = '', ...props }) => {
    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        accent: 'btn-accent',
        ghost: 'btn-ghost',
        link: 'btn-link',
        outline: 'btn-outline',
        error: 'btn-error'
    };
    const sizeClasses = {
        xs: 'btn-xs',
        sm: 'btn-sm',
        md: '',
        lg: 'btn-lg'
    };
    return (_jsxs("button", { className: `btn ${variantClasses[variant]} ${sizeClasses[size]} ${className}`, disabled: isLoading || props.disabled, ...props, children: [isLoading && _jsx("span", { className: "loading loading-spinner loading-xs mr-2" }), !isLoading && icon && _jsx("span", { className: "mr-2", children: icon }), children] }));
};
export default Button;
