import apiClient from './apiClient';

export const getStock = (params) => apiClient.get('/stock', { params });
export const getAllStock = () => apiClient.get('/stock/all');
export const searchStock = (term) => apiClient.get('/stock', { params: { filter: term } });
export const addStock = (data) => apiClient.post('/stock', data);
export const updateStock = (id, data) => apiClient.put(`/stock/${id}`, data);
export const deleteStock = (id) => apiClient.delete(`/stock/${id}`);

export const stockService = {
    getStock,
    getAllStock,
    searchStock,
    addStock,
    updateStock,
    deleteStock
};
