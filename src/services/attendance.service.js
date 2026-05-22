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

export const createAttendance = async (payload) => {
  try {
    const response = await fetch(`${API_URL}/attendance`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!response.ok) await throwApiError(response);
    return await response.json();
  } catch (error) {
    console.error('Failed to record attendance:', error);
    throw error;
  }
};

export const createBulkAttendance = async (payload) => {
    try {
      const response = await fetch(`${API_URL}/attendance/bulk`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!response.ok) await throwApiError(response);
      return await response.json();
    } catch (error) {
      console.error('Failed to record bulk attendance:', error);
      throw error;
    }
  };

export default {
    createAttendance,
    createBulkAttendance
};
