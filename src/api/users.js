import axiosInstance from './axios';

export const userAPI = {
    getUsers: async () => {
        const response = await axiosInstance.get('/users');
        return response.data;
    },

    getUser: async (id) => {
        const response = await axiosInstance.get(`/users/${id}`);
        return response.data;
    },

    createUser: async (userData) => {
        const response = await axiosInstance.post('/users', userData);
        return response.data;
    },

    updateUser: async (id, userData) => {
        const response = await axiosInstance.put(`/users/${id}`, userData);
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await axiosInstance.delete(`/users/${id}`);
        return response.data;
    },
    
    changePassword: async (passwords) => {
        const response = await axiosInstance.post('/users/change-password', passwords);
        return response.data;
    },

    // Forgot password - request password reset
    forgotPassword: async (emailData) => {
        const response = await axiosInstance.post('/users/forgot-password', emailData);
        return response.data;
    },

    // Validate reset token
    validateResetToken: async (token) => {
        const response = await axiosInstance.get(`/users/validate-reset-token/${token}`);
        return response.data;
    },

    // Reset password with token
    resetPassword: async (data) => {
        const response = await axiosInstance.post('/users/reset-password', data);
        return response.data;
    }
};