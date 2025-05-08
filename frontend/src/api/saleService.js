import api from './axios';
const saleService = {
    // Get all sales
    getAllSales: async (params) => {
        try {
            const response = await api.get('sales/', { params });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Get sale by ID
    getSaleById: async (id) => {
        try {
            const response = await api.get(`sales/${id}/`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Record a new sale
    recordSale: async (saleData) => {
        try {
            const response = await api.post('sales/record/', saleData);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Get sales by date range
    getSalesByDateRange: async (startDate, endDate) => {
        try {
            const response = await api.get(`sales/?start_date=${startDate}&end_date=${endDate}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Get sales by type
    getSalesByType: async (saleType) => {
        try {
            const response = await api.get(`sales/?sale_type=${saleType}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Get sales by user
    getSalesByUser: async (userId) => {
        try {
            const response = await api.get(`sales/?sold_by=${userId}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Get sales with invoices
    getSalesWithInvoices: async () => {
        try {
            const response = await api.get('sales/?has_invoice=true');
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Get sales by customer name
    getSalesByCustomer: async (customerName) => {
        try {
            const response = await api.get(`sales/?customer=${customerName}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
};
export default saleService;
