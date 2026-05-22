const API_URL = 'http://localhost:3000/api/v1';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const getBranches = async () => {
  try {
    const response = await fetch(`${API_URL}/rooms`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    console.log('Branches data:', json.data);
    return json.data || [];
  } catch (error) {
    console.error('Failed to fetch branches:', error);
    throw error;
  }
};

export const createBranch = async (payload) => {
  try {
    const response = await fetch(`${API_URL}/rooms`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error('Failed to create branch:', error);
    throw error;
  }
};

export const deleteBranch = async (id) => {
  try {
    const response = await fetch(`${API_URL}/rooms/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error('Failed to delete branch:', error);
    throw error;
  }
};
