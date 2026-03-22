// services/userService.js
import api from '../utils/axios';
import { API_ENDPOINTS } from './api';

export const getUserProfile = async () => {
    const response = await api.get(API_ENDPOINTS.USER);
    return response.data;
};

export const updateUserProfile = async (userData) => {
    const response = await api.patch(API_ENDPOINTS.USER, userData);
    return response.data;
};