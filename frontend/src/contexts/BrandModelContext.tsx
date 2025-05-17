import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import brandService, { Brand } from '../api/brandService';
import modelService, { Model } from '../api/modelService';

interface BrandModelContextType {
  brands: Brand[];
  models: Model[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  getModelsByBrand: (brandId: number) => Model[];
}

const BrandModelContext = createContext<BrandModelContextType | undefined>(undefined);

export const useBrandModelContext = () => {
  const ctx = useContext(BrandModelContext);
  if (!ctx) throw new Error('useBrandModelContext must be used within BrandModelProvider');
  return ctx;
};

export const useBrands = () => useBrandModelContext().brands;
export const useModels = (brandId?: number) => {
  const { models, getModelsByBrand } = useBrandModelContext();
  return brandId ? getModelsByBrand(brandId) : models;
};

interface BrandModelProviderProps {
  children: ReactNode;
}

export const BrandModelProvider: React.FC<BrandModelProviderProps> = ({ children }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [brandData, modelData] = await Promise.all([
        brandService.getAllBrands({ all: true }),
        modelService.getAllModels({ all: true })
      ]);
      console.log('Fetched brands:', brandData);
      setBrands(Array.isArray(brandData) ? brandData : brandData.results ?? []);
      setModels(Array.isArray(modelData) ? modelData : modelData.results ?? []);
    } catch (err: any) {
      setError('Failed to fetch brands/models');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const getModelsByBrand = (brandId: number) => models.filter(m => m.brand === brandId);

  const value: BrandModelContextType = {
    brands,
    models,
    loading,
    error,
    refresh: fetchAll,
    getModelsByBrand,
  };

  return (
    <BrandModelContext.Provider value={value}>
      {children}
    </BrandModelContext.Provider>
  );
};
