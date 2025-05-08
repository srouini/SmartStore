import React from 'react';
import type { ReactNode } from 'react';
interface CardProps {
    title?: string;
    children: ReactNode;
    footer?: ReactNode;
    className?: string;
}
declare const Card: React.FC<CardProps>;
export default Card;
