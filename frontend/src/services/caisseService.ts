import api from '../api/axios';
import { Caisse, CaisseDetail, CaisseOperation, CaisseDeposit, CaisseWithdrawal, PaginatedResponse } from '../types/Caisse';

// Get all cash registers
export const getCaisses = async (): Promise<Caisse[]> => {
  const response = await api.get('/caisse/');
  return response.data.results;
};

// Get a single cash register by ID
export const getCaisseById = async (id: number): Promise<CaisseDetail> => {
  const response = await api.get(`/caisse/${id}/`);
  return response.data;
};

// Add funds to a cash register
export const depositFunds = async (caisseId: number, data: CaisseDeposit): Promise<any> => {
  const response = await api.post(`/caisse/${caisseId}/deposit/`, data);
  return response.data;
};

// Withdraw funds from a cash register
export const withdrawFunds = async (caisseId: number, data: CaisseWithdrawal): Promise<any> => {
  const response = await api.post(`/caisse/${caisseId}/withdraw/`, data);
  return response.data;
};

// Get operations for a cash register with pagination and filtering
export const getCaisseOperations = async (
  page: number = 1,
  filters: {
    caisse?: number;
    operation_type?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
  } = {}
): Promise<PaginatedResponse<CaisseOperation>> => {
  const params = {
    page,
    ...filters,
  };
  
  const response = await api.get('/caisse-operations/', { params });
  return response.data;
};

// Create a new cash register
export const createCaisse = async (data: Partial<Caisse>): Promise<Caisse> => {
  const response = await api.post('/caisse/', data);
  return response.data;
};

// Update a cash register
export const updateCaisse = async (id: number, data: Partial<Caisse>): Promise<Caisse> => {
  const response = await api.put(`/caisse/${id}/`, data);
  return response.data;
};

// Delete a cash register
export const deleteCaisse = async (id: number): Promise<void> => {
  await api.delete(`/caisse/${id}/`);
};
