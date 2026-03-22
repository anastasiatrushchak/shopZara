// services/authService.js
import axios from '../utils/axios';
import { API_ENDPOINTS } from './api';

export const authService = {
  login: async (credentials) => {
    const response = await axios.post(API_ENDPOINTS.LOGIN, credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await axios.post(API_ENDPOINTS.REGISTER, userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axios.get(API_ENDPOINTS.USER);
    return response.data;
  },
};