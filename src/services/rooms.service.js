import apiClient from './api';

const roomsService = {
  getAllRooms: async () => {
    try {
      const response = await apiClient.get('/rooms');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Xonalarni yuklashda xato';
      console.error('Error fetching rooms:', message);
      throw { message, status: error.response?.status };
    }
  },

  createRoom: async (roomData) => {
    try {
      const response = await apiClient.post('/rooms', roomData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Xona yaratishda xato';
      console.error('Error creating room:', message);
      throw { message, status: error.response?.status };
    }
  },

  updateRoom: async (id, roomData) => {
    try {
      const response = await apiClient.patch(`/rooms/${id}`, roomData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Xonani tahrirlashda xato';
      console.error('Error updating room:', message);
      throw { message, status: error.response?.status };
    }
  },

  deleteRoom: async (id) => {
    try {
      const response = await apiClient.delete(`/rooms/${id}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Xonani o\'chirishda xato';
      console.error('Error deleting room:', message);
      throw { message, status: error.response?.status };
    }
  }
};

export default roomsService;
