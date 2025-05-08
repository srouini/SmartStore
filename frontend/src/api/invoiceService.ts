import api from './axios';
import type { Sale } from './saleService';

export interface Invoice {
  id: number;
  sale: number;
  sale_info: Sale;
  invoice_date: string;
  invoice_number: string;
  customer_info: string | null;
  total_amount: number;
}

const invoiceService = {
  // Get all invoices
  getAllInvoices: async (params?: Record<string, any>) => {
    try {
      const response = await api.get('invoices/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get invoice by ID
  getInvoiceById: async (id: number) => {
    try {
      const response = await api.get(`invoices/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get invoices by date range
  getInvoicesByDateRange: async (startDate: string, endDate: string) => {
    try {
      const response = await api.get(`invoices/?start_date=${startDate}&end_date=${endDate}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get invoice by invoice number
  getInvoiceByNumber: async (invoiceNumber: string) => {
    try {
      const response = await api.get(`invoices/?invoice_number=${invoiceNumber}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get invoices by customer info
  getInvoicesByCustomer: async (customerInfo: string) => {
    try {
      const response = await api.get(`invoices/?customer_info=${customerInfo}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default invoiceService;
