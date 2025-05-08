import api from './axios';

export interface Stock {
  id: number;
  product: number;
  product_name: string;
  product_code: string;
  quantity: number;
  last_updated: string;
}

export interface AddStockRequest {
  product_id: number;
  quantity: number;
}

const stockService = {
  // Get all stock records
  getAllStock: async (params?: Record<string, any>) => {
    try {
      const response = await api.get('stock/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get stock by ID
  getStockById: async (id: number) => {
    try {
      const response = await api.get(`stock/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get low stock items (below threshold)
  getLowStock: async (threshold: number = 5) => {
    try {
      const response = await api.get(`stock/?low_stock=${threshold}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get out of stock items
  getOutOfStock: async () => {
    try {
      const response = await api.get('stock/?out_of_stock=true');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add stock to a product
  addStock: async (data: AddStockRequest) => {
    try {
      const response = await api.post('stock/add/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get stock by product type (phone or accessory)
  getStockByProductType: async (productType: 'phone' | 'accessory') => {
    try {
      const response = await api.get(`stock/?product_type=${productType}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default stockService;
