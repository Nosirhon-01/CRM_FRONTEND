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

// Upload actual video file (multipart/form-data)
export const uploadVideo = async (groupId, formData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/groups/${groupId}/videos/upload`, {
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

// Upload with progress tracking via XMLHttpRequest
export const uploadVideoWithProgress = (groupId, formData, onProgress) => {
  return new Promise((resolve, reject) => {
    const token = localStorage.getItem('token');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/groups/${groupId}/videos/upload`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(json);
        else reject(new Error(json.message || 'Upload failed'));
      } catch {
        reject(new Error('Invalid server response'));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error')));
    xhr.send(formData);
  });
};

// Create video record without file (URL only)
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
