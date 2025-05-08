import api from './axios';

export interface SaleItem {
  id: number;
  sale: number;
  product: number;
  product_name: string;
  product_code: string;
  product_type: string;
  quantity_sold: number;
  price_per_item: number;
}

export interface Sale {
  id: number;
  sale_date: string;
  sale_type: string;
  sale_type_display: string;
  total_amount: number;
  sold_by: number | null;
  sold_by_username: string | null;
  has_invoice: boolean;
  customer_name: string | null;
  items: SaleItem[];
}

export interface RecordSaleItem {
  product_id: number;
  quantity: number;
}

export interface RecordSaleRequest {
  sale_type: 'bulk' | 'semi-bulk' | 'particular';
  customer_name?: string;
  generate_invoice: boolean;
  items: RecordSaleItem[];
}

const saleService = {
  // Get all sales
  getAllSales: async (params?: Record<string, any>) => {
    try {
      const response = await api.get('sales/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get sale by ID
  getSaleById: async (id: number) => {
    try {
      const response = await api.get(`sales/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Record a new sale
  recordSale: async (saleData: RecordSaleRequest) => {
    try {
      const response = await api.post('sales/record/', saleData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get sales by date range
  getSalesByDateRange: async (startDate: string, endDate: string) => {
    try {
      const response = await api.get(`sales/?start_date=${startDate}&end_date=${endDate}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get sales by type
  getSalesByType: async (saleType: 'bulk' | 'semi-bulk' | 'particular') => {
    try {
      const response = await api.get(`sales/?sale_type=${saleType}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get sales by user
  getSalesByUser: async (userId: number) => {
    try {
      const response = await api.get(`sales/?sold_by=${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get sales with invoices
  getSalesWithInvoices: async () => {
    try {
      const response = await api.get('sales/?has_invoice=true');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get sales by customer name
  getSalesByCustomer: async (customerName: string) => {
    try {
      const response = await api.get(`sales/?customer=${customerName}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default saleService;
