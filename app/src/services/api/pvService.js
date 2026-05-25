import apiClient from './apiClient';

export const getPvStats = (params) => apiClient.get('/pv-essai/stats', { params });
export const listPvs = (params) => apiClient.get('/pv-essai', { params });
export const getPvById = (id) => apiClient.get(`/pv-essai/${id}`);
export const createPv = (data) => apiClient.post('/pv-essai', data);
export const deletePv = (id) => apiClient.delete(`/pv-essai/${id}`);
export const getConformityTrend = (params) => apiClient.get('/pv-essai/stats/conformity-trend', { params });
export const getConformityByPower = (params) => apiClient.get('/pv-essai/stats/conformity-by-power', { params });

export const pvService = {
    getPvStats,
    listPvs,
    getPvById,
    createPv,
    deletePv,
    getConformityTrend,
    getConformityByPower
};
