const API_URL = 'http://localhost:3000/api/v1';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const throwApiError = async (response, fallbackMessage) => {
  let message = fallbackMessage || `Error: ${response.status} ${response.statusText}`;
  try {
    const data = await response.json();
    message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message || message;
  } catch {
    // Keep fallback when response is not JSON.
  }
  throw new Error(message);
};

export const getStudents = async (page = 1, limit = 10) => {
  try {
    const response = await fetch(`${API_URL}/students?page=${page}&limit=${limit}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch students');
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getAllStudents = async () => {
  try {
    const response = await fetch(`${API_URL}/students/all`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch all students');
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createStudent = async (formData) => {
  try {
    const response = await fetch(`${API_URL}/students`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData, // FormData for file upload
    });
    if (!response.ok) await throwApiError(response, 'Talaba yaratishda xatolik');
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateStudent = async (id, formData) => {
  try {
    const response = await fetch(`${API_URL}/students/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });
    if (!response.ok) await throwApiError(response, 'Talabani yangilashda xatolik');
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteStudent = async (id) => {
  try {
    const response = await fetch(`${API_URL}/students/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete student');
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateStudentCoin = async (id, amount) => {
  try {
    const response = await fetch(`${API_URL}/students/${id}/update-coin`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount }),
    });
    if (!response.ok) throw new Error('Failed to update coins');
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default {
  getStudents,
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  updateStudentCoin,
};
