import { API_BASE_URL } from '../config/api';

export const getGroupExams = async (groupId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/exams`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    console.error('Error fetching exams:', error);
    return { success: false, error: error.message };
  }
};

export const createExam = async (groupId, payload) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/exams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error creating exam');
    return { success: true, data };
  } catch (error) {
    console.error('Error creating exam:', error);
    throw error;
  }
};

export const getExamSubmissions = async (groupId, examId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/exams/${examId}/submissions`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error fetching exam submissions');
    return data;
  } catch (error) {
    console.error('Error fetching exam submissions:', error);
    throw error;
  }
};

export const updateExam = async (groupId, examId, payload) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/exams/${examId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error updating exam');
    return { success: true, data };
  } catch (error) {
    console.error('Error updating exam:', error);
    throw error;
  }
};

export const deleteExam = async (groupId, examId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/exams/${examId}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error deleting exam');
    return { success: true, data };
  } catch (error) {
    console.error('Error deleting exam:', error);
    throw error;
  }
};
