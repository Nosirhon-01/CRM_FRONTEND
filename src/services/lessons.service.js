const API_URL = 'http://localhost:3000/api/v1';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

const throwApiError = async (response) => {
  let message = `Error: ${response.status}`;
  try {
    const data = await response.json();
    message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message || message;
  } catch {
    // Keep the status fallback when the response is not JSON.
  }
  throw new Error(message);
};

export const getGroupLessons = async (groupId) => {
  try {
    const response = await fetch(`${API_URL}/lessons/group/${groupId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) await throwApiError(response);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch group lessons:', error);
    throw error;
  }
};

export const createLesson = async (payload) => {
  try {
    const response = await fetch(`${API_URL}/lessons`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!response.ok) await throwApiError(response);
    return await response.json();
  } catch (error) {
    console.error('Failed to create lesson:', error);
    throw error;
  }
};

export const updateLesson = async (id, payload) => {
  try {
    const response = await fetch(`${API_URL}/lessons/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!response.ok) await throwApiError(response);
    return await response.json();
  } catch (error) {
    console.error('Failed to update lesson:', error);
    throw error;
  }
};

export const deleteLesson = async (id) => {
  try {
    const response = await fetch(`${API_URL}/lessons/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) await throwApiError(response);
    return await response.json();
  } catch (error) {
    console.error('Failed to delete lesson:', error);
    throw error;
  }
};

export default {
    getGroupLessons,
    createLesson,
    updateLesson,
    deleteLesson
};
