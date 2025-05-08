import api from './axios';
const invoiceService = {
    // Get all invoices
    getAllInvoices: async (params) => {
        try {
            const response = await api.get('invoices/', { params });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Get invoice by ID
    getInvoiceById: async (id) => {
        try {
            const response = await api.get(`invoices/${id}/`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Get invoices by date range
    getInvoicesByDateRange: async (startDate, endDate) => {
        try {
            const response = await api.get(`invoices/?start_date=${startDate}&end_date=${endDate}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Get invoice by invoice number
    getInvoiceByNumber: async (invoiceNumber) => {
        try {
            const response = await api.get(`invoices/?invoice_number=${invoiceNumber}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Get invoices by customer info
    getInvoicesByCustomer: async (customerInfo) => {
        try {
            const response = await api.get(`invoices/?customer_info=${customerInfo}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
};
export default invoiceService;
