import apiClient from './apiClient';

export const getNonConformityReports = () => apiClient.get('/non-conformity');
export const saveNonConformityReport = (data) => apiClient.post('/non-conformity', data);
export const deleteNonConformityReport = (id) => apiClient.delete(`/non-conformity/${id}`);

export const nonConformityService = {
    getNonConformityReports,
    saveNonConformityReport,
    deleteNonConformityReport
};
