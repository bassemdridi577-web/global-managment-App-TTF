import apiClient from './apiClient';

export const getTransformators = () => apiClient.get('/transformator');
export const addTransformator = (data) => apiClient.post('/transformator', data);
export const updateTransformator = (id, data) => apiClient.put(`/transformator/${id}`, data);
export const deleteTransformator = (id) => apiClient.delete(`/transformator/${id}`);

export const getArticlesForTransformator = (transformatorId) => apiClient.get(`/transformator/${transformatorId}/articles`);
export const addArticleToTransformator = (transformatorId, data) => apiClient.post(`/transformator/${transformatorId}/articles`, data);
export const updateArticleForTransformator = (id, data) => apiClient.put(`/articles/${id}`, data);
export const removeArticleFromTransformator = (id) => apiClient.delete(`/articles/${id}`);

export const transformerService = {
    getTransformators,
    addTransformator,
    updateTransformator,
    deleteTransformator,
    getArticlesForTransformator,
    addArticleToTransformator,
    updateArticleForTransformator,
    removeArticleFromTransformator
};
