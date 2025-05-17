import React from 'react';
import { Caisse } from '../../types/Caisse';

type CaisseCardProps = {
  caisse: Caisse;
  isSelected: boolean;
  onClick: () => void;
};

export const CaisseCard: React.FC<CaisseCardProps> = ({ caisse, isSelected, onClick }) => {
  return (
    <div 
      className={`card bg-base-100 shadow-md cursor-pointer w-60 ${isSelected ? 'border-2 border-primary' : ''}`}
      onClick={onClick}
    >
      <div className="card-body">
        <h2 className="card-title">{caisse.name}</h2>
        <p className={`text-2xl font-bold ${Number(caisse.current_balance) > 0 ? 'text-success' : 'text-error'}`}>
          ${Number(caisse.current_balance).toFixed(2)}
        </p>
        <p className="text-xs text-gray-500">
          Last updated: {new Date(caisse.last_updated).toLocaleString()}
        </p>
      </div>
    </div>
  );
};
