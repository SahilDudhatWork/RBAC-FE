import axiosInstance from './axios';

export const authAPI = {
    login: async (email, password) => {
        const response = await axiosInstance.post('/auth/login', { email, password });
        return response.data;
    },

    register: async (userData) => {
        const response = await axiosInstance.post('/auth/register', userData);
        return response.data;
    },

    getMe: async () => {
        const response = await axiosInstance.get('/auth/me');
        return response.data;
    },

    getPermissions: async () => {
        const response = await axiosInstance.get('/auth/permissions');
        return response.data;
    }
};