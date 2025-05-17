import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import supplierService from '../api/supplierService';
import { Supplier } from '../api/purchaseService';

interface SupplierContextType {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: number, supplier: Supplier) => void;
  removeSupplier: (id: number) => void;
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined);

export const useSupplierContext = () => {
  const ctx = useContext(SupplierContext);
  if (!ctx) throw new Error('useSupplierContext must be used within SupplierProvider');
  return ctx;
};

// Simple hook to access just the suppliers array
export const useSuppliers = () => useSupplierContext().suppliers;

interface SupplierProviderProps {
  children: ReactNode;
}

export const SupplierProvider: React.FC<SupplierProviderProps> = ({ children }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await supplierService.getAllSuppliers({ all: true });
      setSuppliers(Array.isArray(data) ? data : data.results ?? []);
    } catch (err: any) {
      setError('Failed to fetch suppliers');
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => { 
    fetchSuppliers(); 
  }, []);

  // Function to add a supplier to the context
  const addSupplier = (supplier: Supplier) => {
    setSuppliers(prev => [...prev, supplier]);
  };

  // Function to update a supplier in the context
  const updateSupplier = (id: number, updatedSupplier: Supplier) => {
    setSuppliers(prev => 
      prev.map(supplier => 
        supplier.id === id ? { ...supplier, ...updatedSupplier } : supplier
      )
    );
  };

  // Function to remove a supplier from the context
  const removeSupplier = (id: number) => {
    setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
  };

  const value: SupplierContextType = {
    suppliers,
    loading,
    error,
    refresh: fetchSuppliers,
    addSupplier,
    updateSupplier,
    removeSupplier
  };

  return (
    <SupplierContext.Provider value={value}>
      {children}
    </SupplierContext.Provider>
  );
};
