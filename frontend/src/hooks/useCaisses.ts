import { useState, useEffect } from 'react';
import { getCaisses, createCaisse } from '../services/caisseService';
import { Caisse as CaisseType } from '../types/Caisse';

export const useCaisses = () => {
  const [caisses, setCaisses] = useState<CaisseType[]>([]);
  const [selectedCaisse, setSelectedCaisse] = useState<CaisseType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCaisses = async () => {
    setIsLoading(true);
    try {
      const data = await getCaisses();
      setCaisses(data);
      if (data.length > 0 && !selectedCaisse) {
        setSelectedCaisse(data[0]);
      }
      return data;
    } catch (error) {
      console.error('Error fetching cash registers:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCaisse = async (name: string) => {
    try {
      await createCaisse({ name });
      await fetchCaisses();
      return true;
    } catch (error) {
      console.error('Error creating cash register:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCaisses();
  }, []);

  return {
    caisses,
    selectedCaisse,
    setSelectedCaisse,
    isLoading,
    fetchCaisses,
    handleCreateCaisse
  };
};
