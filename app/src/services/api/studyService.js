import apiClient from './apiClient';

export const getTransformerStudies = () => apiClient.get('/transformer-study');
export const getTransformerStudyById = (id) => apiClient.get(`/transformer-study/${id}`);
export const createTransformerStudy = (data) => apiClient.post('/transformer-study', data);
export const updateTransformerStudy = (id, data) => apiClient.put(`/transformer-study/${id}`, data);
export const deleteTransformerStudy = (id) => apiClient.delete(`/transformer-study/${id}`);

export const studyService = {
    getTransformerStudies,
    getTransformerStudyById,
    createTransformerStudy,
    updateTransformerStudy,
    deleteTransformerStudy
};
