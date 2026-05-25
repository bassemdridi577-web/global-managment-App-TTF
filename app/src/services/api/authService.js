import apiClient from './apiClient';

export const getMe = () => apiClient.get('/auth/me');

export const authService = {
    getMe
};
