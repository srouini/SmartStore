import React from 'react';
import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, footer, className = '' }) => {
  return (
    <div className={`card bg-base-100 shadow-md ${className}`}>
      {title && (
        <div className="card-title p-4 border-b border-base-200">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
      )}
      <div className="card-body p-4">
        {children}
      </div>
      {footer && (
        <div className="card-footer p-4 border-t border-base-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
