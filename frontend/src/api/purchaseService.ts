import api from './axios';
import { PaginatedResponse } from './supplierService';

export interface PurchaseItem {
  id: number;
  purchase: number;
  product_id: number;
  product_name: string;
  product_code: string;
  quantity: number;
  discount: number;
  unit_price: number;
  ht: number;
  tva: number;
  ttc: number;
}

export interface Supplier {
  id: number;
  name: string;
  address: string | null;
  email: string | null;
  tel: string | null;
  code: string | null;
  RC: string | null;
  NIF: string | null;
  AI: string | null;
  NIS: string | null;
  soumis_tva: boolean;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: number;
  supplier: number;
  supplier_details: Supplier;
  reference_number: string;
  date: string;
  ht: number;
  discount: number;
  tva: number;
  ttc: number;
  payment_status: string;
  payment_status_display: string;
  payment_method: string;
  payment_method_display: string;
  notes: string | null;
  soumis_tva: boolean;
  created_at: string;
  updated_at: string;
  items: PurchaseItem[];
}

const purchaseService = {
  // Get all purchases
  getAllPurchases: async (params?: Record<string, any>) => {
    try {
      const response = await api.get<PaginatedResponse<Purchase>>('purchases/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get purchase by ID
  getPurchaseById: async (id: number) => {
    try {
      const response = await api.get(`purchases/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create purchase
  createPurchase: async (purchaseData: Record<string, any>) => {
    try {
      const response = await api.post('purchases/', purchaseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update purchase
  updatePurchase: async (id: number, purchaseData: Record<string, any>) => {
    try {
      const response = await api.put(`purchases/${id}/`, purchaseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete purchase
  deletePurchase: async (id: number) => {
    try {
      const response = await api.delete(`purchases/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search purchases by reference number
  searchByReferenceNumber: async (referenceNumber: string, page?: number, pageSize?: number) => {
    try {
      const params: Record<string, any> = { reference_number: referenceNumber };
      if (page) params.page = page;
      if (pageSize) params.page_size = pageSize;
      
      const response = await api.get<PaginatedResponse<Purchase>>('purchases/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get purchases by date range
  getByDateRange: async (startDate: string, endDate: string, page?: number, pageSize?: number) => {
    try {
      const params: Record<string, any> = { start_date: startDate, end_date: endDate };
      if (page) params.page = page;
      if (pageSize) params.page_size = pageSize;
      
      const response = await api.get<PaginatedResponse<Purchase>>('purchases/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get purchases by payment status
  getByPaymentStatus: async (status: string, page?: number, pageSize?: number) => {
    try {
      const params: Record<string, any> = { payment_status: status };
      if (page) params.page = page;
      if (pageSize) params.page_size = pageSize;
      
      const response = await api.get<PaginatedResponse<Purchase>>('purchases/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get purchases by supplier
  getBySupplier: async (supplierName: string, page?: number, pageSize?: number) => {
    try {
      const params: Record<string, any> = { supplier: supplierName };
      if (page) params.page = page;
      if (pageSize) params.page_size = pageSize;
      
      const response = await api.get<PaginatedResponse<Purchase>>('purchases/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default purchaseService;
