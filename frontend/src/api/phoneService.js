import api from './axios';
const phoneService = {
    // Get all phones
    getAllPhones: async (params) => {
        try {
            const response = await api.get('phones/', { params });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Get phone by ID
    getPhoneById: async (id) => {
        try {
            const response = await api.get(`phones/${id}/`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Create phone
    createPhone: async (phoneData) => {
        try {
            const response = await api.post('phones/', phoneData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Update phone
    updatePhone: async (id, phoneData) => {
        try {
            const response = await api.put(`phones/${id}/`, phoneData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Delete phone
    deletePhone: async (id) => {
        try {
            const response = await api.delete(`phones/${id}/`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Search phones by code
    searchByCode: async (code) => {
        try {
            const response = await api.get(`phones/?code=${code}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Search phones by name
    searchByName: async (name) => {
        try {
            const response = await api.get(`phones/?name=${name}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
};
export default phoneService;
