import { API_BASE_URL } from '../config/api';

const API_URL = API_BASE_URL;

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const getGroupVideos = async (groupId, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString 
      ? `${API_URL}/groups/${groupId}/videos?${queryString}`
      : `${API_URL}/groups/${groupId}/videos`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('Error fetching group videos:', error);
    throw error;
  }
};

export const getVideoById = async (groupId, videoId) => {
  try {
    const response = await fetch(`${API_URL}/groups/${groupId}/videos/${videoId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('Error fetching video:', error);
    throw error;
  }
};

export const deleteVideo = async (groupId, videoId) => {
  try {
    const response = await fetch(`${API_URL}/groups/${groupId}/videos/${videoId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
};

export const uploadVideo = async (groupId, formData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/groups/${groupId}/videos`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData
    });
    
    if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
};

export const createVideo = async (groupId, dto) => {
  try {
    const response = await fetch(`${API_URL}/groups/${groupId}/videos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(dto)
    });
    
    if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('Error creating video:', error);
    throw error;
  }
};


export const updateVideo = async (groupId, videoId, dto) => {
  try {
    const response = await fetch(API_URL + '/groups/' + groupId + '/videos/' + videoId, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(dto)
    });
    if (!response.ok) throw new Error('Error updating video');
    return await response.json();
  } catch (error) {
    console.error('Error updating video:', error);
    throw error;
  }
};

