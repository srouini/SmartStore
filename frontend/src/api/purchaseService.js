import api from './axios';
const purchaseService = {
    // Get all purchases
    getAllPurchases: async (params) => {
        try {
            const response = await api.get('purchases/', { params });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Get purchase by ID
    getPurchaseById: async (id) => {
        try {
            const response = await api.get(`purchases/${id}/`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Create purchase
    createPurchase: async (purchaseData) => {
        try {
            const response = await api.post('purchases/', purchaseData);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Update purchase
    updatePurchase: async (id, purchaseData) => {
        try {
            const response = await api.put(`purchases/${id}/`, purchaseData);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Delete purchase
    deletePurchase: async (id) => {
        try {
            const response = await api.delete(`purchases/${id}/`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Search purchases by reference number
    searchByReferenceNumber: async (referenceNumber) => {
        try {
            const response = await api.get(`purchases/?reference_number=${referenceNumber}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Get purchases by date range
    getByDateRange: async (startDate, endDate) => {
        try {
            const response = await api.get(`purchases/?start_date=${startDate}&end_date=${endDate}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Get purchases by payment status
    getByPaymentStatus: async (status) => {
        try {
            const response = await api.get(`purchases/?payment_status=${status}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Get purchases by supplier
    getBySupplier: async (supplierName) => {
        try {
            const response = await api.get(`purchases/?supplier=${supplierName}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }
};
export default purchaseService;
