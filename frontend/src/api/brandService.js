import api from './axios';
const brandService = {
    // Get all brands
    getAllBrands: async () => {
        try {
            const response = await api.get('brands/');
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Get brand by ID
    getBrandById: async (id) => {
        try {
            const response = await api.get(`brands/${id}/`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
    // Create brand
    createBrand: async (brandData) => {
        try {
            const response = await api.post('brands/', brandData, {
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
    // Update brand
    updateBrand: async (id, brandData) => {
        try {
            const response = await api.put(`brands/${id}/`, brandData, {
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
    // Delete brand
    deleteBrand: async (id) => {
        try {
            const response = await api.delete(`brands/${id}/`);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },
};
export default brandService;
