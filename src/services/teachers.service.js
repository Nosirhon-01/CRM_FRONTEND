import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1/teachers';

const getHeaders = () => {
    return {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    };
};

export const getAllTeachers = async () => {
    try {
        const response = await axios.get(API_URL, getHeaders());
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createTeacher = async (formData) => {
    try {
        const headers = getHeaders().headers;
        const response = await axios.post(API_URL, formData, {
            headers: {
                ...headers,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateTeacher = async (id, formData) => {
    try {
        const headers = getHeaders().headers;
        const response = await axios.patch(`${API_URL}/${id}`, formData, {
            headers: {
                ...headers,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteTeacher = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, getHeaders());
        return response.data;
    } catch (error) {
        throw error;
    }
};
