// services/api.js
import axios from '../utils/axios';

export const API_ENDPOINTS = {
  LOGIN: '/user/token/',
  REGISTER: '/user/create/',
  PRODUCTS: '/product/products/',
  CART: '/product/cartitems/',
  USER: '/user/me/',
  CATEGORY:'/product/category/',
};