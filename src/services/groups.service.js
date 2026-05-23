import { API_BASE_URL } from '../config/api';

const API_URL = API_BASE_URL;

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const getGroups = async () => {
  try {
    const response = await fetch(`${API_URL}/groups/all`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
    const json = await response.json();
    return json.data || [];
  } catch (error) {
    console.error('Failed to fetch groups:', error);
    throw error;
  }
};

export const createGroup = async (payload) => {
  try {
    const response = await fetch(`${API_URL}/groups`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to create group:', error);
    throw error;
  }
};

export const deleteGroup = async (id) => {
  try {
    const response = await fetch(`${API_URL}/groups/${id}/deactivate`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to delete group:', error);
    throw error;
  }
};

export const getArchivedGroups = async () => {
  try {
    const response = await fetch(`${API_URL}/groups/archive/all`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
    const json = await response.json();
    return json.data || [];
  } catch (error) {
    console.error('Failed to fetch archived groups:', error);
    throw error;
  }
};

export const restoreGroup = async (id) => {
  try {
    const response = await fetch(`${API_URL}/groups/${id}/restore`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to restore group:', error);
    throw error;
  }
};

export const assignTeacherToGroup = async (groupId, teacherId) => {
  try {
    const response = await fetch(`${API_URL}/groups/${groupId}/assign-teacher`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ teacher_id: teacherId })
    });
    if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to assign teacher to group:', error);
    throw error;
  }
};

export const updateGroup = async (id, payload) => {
  try {
    const response = await fetch(`${API_URL}/groups/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to update group:', error);
    throw error;
  }
};

export const toggleGroupStatus = async (id) => {
  try {
    const response = await fetch(`${API_URL}/groups/${id}/toggle-status`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to toggle group status:', error);
    throw error;
  }
};

export const getGroupById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/groups/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch group details:', error);
    throw error;
  }
};

export default {
  getGroups,
  getArchivedGroups,
  createGroup,
  deleteGroup,
  restoreGroup,
  updateGroup,
  getGroupById,
  assignTeacherToGroup,
  toggleGroupStatus
};
