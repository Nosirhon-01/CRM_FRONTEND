import axios from 'axios';

import { API_BASE_URL } from '../config/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL || "API_BASE_URL",
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Cookies'ni qo'shish
});

// Request interceptor - token qo'sh
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request config error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - 401 da logout qil
apiClient.interceptors.response.use(
  (response) => {
    // Success response'da data qaytarish
    return response;
  },
  (error) => {
    // 401 - Unauthorized
    if (error.response?.status === 401) {
      console.warn('Token expired or invalid, logging out');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuth');
      window.location.href = '/login';
      return Promise.reject({
        message: 'Seans tugadi, iltimos qayta kiring',
        status: 401
      });
    }
    
    // 403 - Forbidden
    if (error.response?.status === 403) {
      return Promise.reject({
        message: 'Siz bu amaliyotni bajarishga huquqingiz yo\'q',
        status: 403
      });
    }

    // Boshqa xatoliklar
    const errorMessage = error.response?.data?.message || error.message || 'Noma\'lum xato';
    console.error('API Error:', errorMessage, error.response?.status);
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      details: error.response?.data
    });
  }
);

export default apiClient;
