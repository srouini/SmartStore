import api from './axios';
const modelService = {
    // Get all models
    getAllModels: async () => {
        try {
            const response = await api.get('models/');
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Get models by brand ID
    getModelsByBrand: async (brandId) => {
        try {
            const response = await api.get(`models/?brand_id=${brandId}`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Get model by ID
    getModelById: async (id) => {
        try {
            const response = await api.get(`models/${id}/`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Create model
    createModel: async (modelData) => {
        try {
            const response = await api.post('models/', modelData);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Update model
    updateModel: async (id, modelData) => {
        try {
            const response = await api.put(`models/${id}/`, modelData);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Delete model
    deleteModel: async (id) => {
        try {
            const response = await api.delete(`models/${id}/`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
};
export default modelService;
