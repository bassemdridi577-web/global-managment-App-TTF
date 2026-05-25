import axios from 'axios';
import * as mockData from './mockData';

const getApiBase = () => {
    if (process.env.REACT_APP_API_BASE) return process.env.REACT_APP_API_BASE;
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:5050`;
};

export const API_BASE = getApiBase();

const apiClient = axios.create({
    baseURL: `${API_BASE}/api`,
});

// Mock Interceptor for Portfolio Deployment
apiClient.interceptors.request.use(async (config) => {
    // If we are on GitHub Pages or if specified in env, use mocks
    const useMocks = window.location.hostname.includes('github.io') || 
                     process.env.REACT_APP_MOCK_API === 'true' ||
                     true; // Default to true for this transition

    if (useMocks) {
        console.log(`[Mock API] Intercepting ${config.method.toUpperCase()} ${config.url}`);
        
        // Define mock responses
        let data = null;
        
        if (config.url.includes('/auth/login') || config.url.includes('/auth/me')) {
            data = mockData.mockUser;
        } else if (config.url.includes('/pv-essai/stats/conformity-trend')) {
            data = mockData.mockConformityTrend;
        } else if (config.url.includes('/pv-essai/stats/conformity-by-power')) {
            data = mockData.mockConformityByPower;
        } else if (config.url.includes('/pv-essai/stats')) {
            data = mockData.mockStats;
        } else if (config.url.includes('/transformator')) {
            data = mockData.mockTransformers;
        } else if (config.url.includes('/pv-essai')) {
            data = mockData.mockPVs;
        } else if (config.url.includes('/stock')) {
            data = mockData.mockStock;
        } else if (config.url.includes('/non-conformity')) {
            data = mockData.mockNonConformities;
        } else if (config.url.includes('/transformer-study')) {
            data = mockData.mockStudies;
        } else if (config.url.includes('/facture')) {
            data = mockData.mockFactures;
        } else if (config.url.includes('/users')) {
            data = [mockData.mockUser];
        } else if (config.url.includes('/messages') || config.url.includes('/chat/sessions')) {
            data = [];
        } else if (config.url.includes('/production-line') || config.url.includes('/production-steps')) {
            data = [];
        } else if (config.url.includes('/commande')) {
            data = [];
        } else if (config.url.includes('/operators') || config.url.includes('/teams')) {
            data = [];
        } else if (config.url.includes('/logs')) {
            data = [];
        }

        // Return a mock response
        return Promise.reject({
            config,
            response: {
                data: data || (config.method === 'get' ? [] : {}),
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
            },
            isMock: true
        });
    }
    return config;
});

// Update response interceptor to handle mock data
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.isMock) {
            return Promise.resolve(error.response);
        }
        
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized access - redirecting to login...');
            localStorage.removeItem('token');
            localStorage.removeItem('controleur');
            window.dispatchEvent(new Event('unauthorized'));
        }
        return Promise.reject(error);
    }
);

export const setAuthHeaders = (user, token) => {
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.common['Authorization'];
    }

    if (user) {
        apiClient.defaults.headers.common['user-id'] = user.id;
        apiClient.defaults.headers.common['user-role'] = user.role;
    } else {
        delete apiClient.defaults.headers.common['user-id'];
        delete apiClient.defaults.headers.common['user-role'];
    }
};

export default apiClient;
