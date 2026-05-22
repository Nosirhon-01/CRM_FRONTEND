import apiClient from './api';

export const usersService = {
  // Barcha usersni olish
  getAllUsers: async (params = {}) => {
    try {
      const response = await apiClient.get('/users', { params });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Foydalanuvchilarni yuklashda xato';
      console.error('Error fetching users:', message);
      throw { message, status: error.response?.status };
    }
  },

  // User bo'yicha qidirish
  searchUsers: async (query) => {
    try {
      const response = await apiClient.get('/users', { params: { search: query } });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Foydalanuvchilarni qidirishda xato';
      console.error('Error searching users:', message);
      throw { message, status: error.response?.status };
    }
  },

  // Foydalanuvchini yangilash
  updateUser: async (userId, userData) => {
    try {
      const response = await apiClient.patch(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Foydalanuvchini yangilashda xato';
      console.error('Error updating user:', message);
      throw { message, status: error.response?.status };
    }
  },

  // Foydalanuvchini o'chirish
  deleteUser: async (userId) => {
    try {
      const response = await apiClient.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Foydalanuvchini o\'chirishda xato';
      console.error('Error deleting user:', message);
      throw { message, status: error.response?.status };
    }
  },

  // Foydalanuvchining ruxsatlarini yangilash
  updateUserRole: async (userId, role) => {
    try {
      const response = await apiClient.patch(`/users/${userId}`, { role });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Rol yangilashda xato';
      console.error('Error updating role:', message);
      throw { message, status: error.response?.status };
    }
  },
};
 
export default usersService;
