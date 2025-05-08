import React from 'react';
import type { ButtonHTMLAttributes } from 'react';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'link' | 'outline' | 'error';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: React.ReactNode;
}
declare const Button: React.FC<ButtonProps>;
export default Button;
