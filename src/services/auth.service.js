import apiClient from './api';

export const authService = {
  // Login
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });
      
      // Backend accessToken qaytaradi, uni token deb saqlaymiz
      const token = response.data.accessToken || response.data.access_token || response.data.token;
      
      if (token) {
        localStorage.setItem('token', token);
        
        // User data saqlaymiz
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      
      return response.data;
    } catch (error) {
      const message = error.message || error.response?.data?.message || 'Login xatosi';
      console.error('Login error:', message);
      throw { message, ...error };
    }
  },

  // Register
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      
      // Agar register'da token bo'lsa, saqlaymiz
      const token = response.data.accessToken || response.data.access_token || response.data.token;
      
      if (token) {
        localStorage.setItem('token', token);
      }
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      const message = error.message || error.response?.data?.message || 'Ro\'yxatdan o\'tish xatosi';
      console.error('Register error:', message);
      throw { message, ...error };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};
