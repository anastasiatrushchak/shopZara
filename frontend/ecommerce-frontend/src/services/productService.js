// services/productService.js
import axios from '../utils/axios';
import { API_ENDPOINTS } from './api';

export const productService = {
  getProducts: async (params = {}) => {
    const response = await axios.get(API_ENDPOINTS.PRODUCTS, { params });
    return response.data;
  },

  getProduct: async (id) => {
    const response = await axios.get(`${API_ENDPOINTS.PRODUCTS}${id}/`);
    return response.data;
  },

  addReview: async (productId, reviewData) => {
    const response = await axios.post(
      `${API_ENDPOINTS.PRODUCTS}${productId}/add-feedback/`,
      reviewData
    );
    return response.data;
  },
  getCategories: async () => {
    const response = await axios.get(API_ENDPOINTS.CATEGORY);
    return response.data;
  },
};

export default productService;