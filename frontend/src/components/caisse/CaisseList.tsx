import React from 'react';
import { Caisse } from '../../types/Caisse';
import { CaisseCard } from './CaisseCard';

type CaisseListProps = {
  caisses: Caisse[];
  selectedCaisse: Caisse | null;
  onSelectCaisse: (caisse: Caisse) => void;
};

export const CaisseList: React.FC<CaisseListProps> = ({ caisses, selectedCaisse, onSelectCaisse }) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {caisses.map((caisse) => (
        <CaisseCard
          key={caisse.id}
          caisse={caisse}
          isSelected={selectedCaisse?.id === caisse.id}
          onClick={() => onSelectCaisse(caisse)}
        />
      ))}
    </div>
  );
};
