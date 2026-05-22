const API_URL = 'http://localhost:3000/api/v1';

const getAuthHeaders = () => ({
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

export const createHomework = async ({ lesson_id, group_id, title, file }) => {
  try {
    const formData = new FormData();
    formData.append('lesson_id', lesson_id);
    formData.append('group_id', group_id);
    formData.append('title', title);
    if (file) formData.append('file', file);

    const response = await fetch(`${API_URL}/homework`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });

    if (!response.ok) await throwApiError(response);
    return await response.json();
  } catch (error) {
    console.error('Failed to create homework:', error);
    throw error;
  }
};

export default {
  createHomework
};
