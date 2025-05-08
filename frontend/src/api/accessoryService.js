import api from './axios';
const accessoryService = {
    // Get all accessories
    getAllAccessories: async (params) => {
        try {
            const response = await api.get('accessories/', { params });
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Get accessory by ID
    getAccessoryById: async (id) => {
        try {
            const response = await api.get(`accessories/${id}/`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Create accessory
    createAccessory: async (accessoryData) => {
        try {
            const response = await api.post('accessories/', accessoryData, {
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
    // Update accessory
    updateAccessory: async (id, accessoryData) => {
        try {
            const response = await api.put(`accessories/${id}/`, accessoryData, {
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
    // Delete accessory
    deleteAccessory: async (id) => {
        try {
            const response = await api.delete(`accessories/${id}/`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Search accessories by code
    searchByCode: async (code) => {
        try {
            const response = await api.get(`accessories/?code=${code}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Search accessories by name
    searchByName: async (name) => {
        try {
            const response = await api.get(`accessories/?name=${name}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Get accessories by category
    getByCategory: async (category) => {
        try {
            const response = await api.get(`accessories/?category=${category}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Get accessories compatible with a specific phone
    getCompatibleWithPhone: async (phoneId) => {
        try {
            const response = await api.get(`accessories/?compatible_with=${phoneId}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
};
export default accessoryService;
