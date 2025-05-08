import api from './axios';

export interface PurchaseItem {
  id: number;
  purchase: number;
  product_type: string;
  product_id: number;
  product_name: string;
  product_code: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Purchase {
  id: number;
  supplier_name: string;
  supplier_contact: string;
  reference_number: string;
  date: string;
  total_amount: number;
  payment_status: string;
  payment_status_display: string;
  payment_method: string;
  payment_method_display: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items: PurchaseItem[];
}

const purchaseService = {
  // Get all purchases
  getAllPurchases: async (params?: Record<string, any>) => {
    try {
      const response = await api.get('purchases/', { params });
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
  searchByReferenceNumber: async (referenceNumber: string) => {
    try {
      const response = await api.get(`purchases/?reference_number=${referenceNumber}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get purchases by date range
  getByDateRange: async (startDate: string, endDate: string) => {
    try {
      const response = await api.get(`purchases/?start_date=${startDate}&end_date=${endDate}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get purchases by payment status
  getByPaymentStatus: async (status: string) => {
    try {
      const response = await api.get(`purchases/?payment_status=${status}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get purchases by supplier
  getBySupplier: async (supplierName: string) => {
    try {
      const response = await api.get(`purchases/?supplier=${supplierName}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default purchaseService;
