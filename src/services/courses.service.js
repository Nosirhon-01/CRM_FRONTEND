const API_URL = 'http://localhost:3000/api/v1';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const getCourses = async () => {
  try {
    const response = await fetch(`${API_URL}/courses`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    console.log('Courses data:', json.data);
    return json.data || [];
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    throw error;
  }
};

export const createCourse = async (payload) => {
  try {
    const response = await fetch(`${API_URL}/courses`, {
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
    console.error('Failed to create course:', error);
    throw error;
  }
};

export const deleteCourse = async (id) => {
  try {
    const response = await fetch(`${API_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error('Failed to delete course:', error);
    throw error;
  }
};

