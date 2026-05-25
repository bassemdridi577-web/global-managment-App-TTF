import apiClient from './apiClient';

export const updateUser = (id, data) => apiClient.put(`/users/${id}`, data);
export const refreshAllClients = () => apiClient.post('/admin/refresh-clients');
export const verifyAdminCode = (code) => apiClient.post('/admin/verify-code', { code });

export const getBackupStatus = () => apiClient.get('/admin/backup/status');
export const toggleBackup = (enabled) => apiClient.post('/admin/backup/toggle', { enabled });
export const triggerManualBackup = () => apiClient.post('/admin/backup');

export const adminService = {
    updateUser,
    refreshAllClients,
    verifyAdminCode,
    getBackupStatus,
    toggleBackup,
    triggerManualBackup
};
