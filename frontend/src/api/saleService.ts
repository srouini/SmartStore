import api from './axios';
import { PaginatedResponse } from './supplierService';

export interface SaleItem {
  id: number;
  sale: number;
  product: number;
  product_name: string;
  product_code: string;
  product_type: string;
  quantity_sold: number;
  price_per_item: number;
  discount?: number;
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
  discount?: number;
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
      const response = await api.get<PaginatedResponse<Sale>>('sales/', { params });
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
  getSalesByDateRange: async (startDate: string, endDate: string, page?: number, pageSize?: number) => {
    try {
      const params: Record<string, any> = { start_date: startDate, end_date: endDate };
      if (page) params.page = page;
      if (pageSize) params.page_size = pageSize;
      
      const response = await api.get<PaginatedResponse<Sale>>('sales/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get sales by type
  getSalesByType: async (saleType: 'bulk' | 'semi-bulk' | 'particular', page?: number, pageSize?: number) => {
    try {
      const params: Record<string, any> = { sale_type: saleType };
      if (page) params.page = page;
      if (pageSize) params.page_size = pageSize;
      
      const response = await api.get<PaginatedResponse<Sale>>('sales/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get sales by user
  getSalesByUser: async (userId: number, page?: number, pageSize?: number) => {
    try {
      const params: Record<string, any> = { sold_by: userId };
      if (page) params.page = page;
      if (pageSize) params.page_size = pageSize;
      
      const response = await api.get<PaginatedResponse<Sale>>('sales/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get sales with invoices
  getSalesWithInvoices: async (page?: number, pageSize?: number) => {
    try {
      const params: Record<string, any> = { has_invoice: true };
      if (page) params.page = page;
      if (pageSize) params.page_size = pageSize;
      
      const response = await api.get<PaginatedResponse<Sale>>('sales/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get sales by customer name
  getSalesByCustomer: async (customerName: string, page?: number, pageSize?: number) => {
    try {
      const params: Record<string, any> = { customer: customerName };
      if (page) params.page = page;
      if (pageSize) params.page_size = pageSize;
      
      const response = await api.get<PaginatedResponse<Sale>>('sales/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default saleService;
