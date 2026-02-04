import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (username, password) => api.post('/auth/login', { username, password }),
    verify: () => api.get('/auth/verify'),
};

// Orders API
export const ordersAPI = {
    getAll: (params) => api.get('/orders', { params }),
    getById: (id) => api.get(`/orders/${id}`),
    create: (data) => api.post('/orders', data),
    assign: (id, data) => api.post(`/orders/${id}/assign`, data),
    updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
    getStats: () => api.get('/orders/stats/summary'),
};

// Technicians API
export const techniciansAPI = {
    getAll: (params) => api.get('/technicians', { params }),
    getById: (id) => api.get(`/technicians/${id}`),
    getRanking: () => api.get('/technicians/ranking'),
    getPerformance: (id) => api.get(`/technicians/${id}/performance`),
    getGeneralReview: () => api.get('/technicians/review/general'),
    sendBulkMessage: (data) => api.post('/technicians/message/bulk', data),
    bulkSendOrders: (technicianIds) => api.post('/technicians/orders/bulk-send', { technicianIds }),
    getPending: () => api.get('/technicians/pending'),
    approve: (id, data) => api.post(`/technicians/${id}/approve`, data),
    reject: (id, reason) => api.post(`/technicians/${id}/reject`, { reason }),
};

// Claims API
export const claimsAPI = {
    getAll: (params) => api.get('/claims', { params }),
    getById: (id) => api.get(`/claims/${id}`),
    create: (data) => api.post('/claims', data),
    updateStatus: (id, status) => api.patch(`/claims/${id}/status`, { status }),
};

// Analytics API
export const analyticsAPI = {
    getDashboard: () => api.get('/analytics/dashboard'),
    getProducts: () => api.get('/analytics/products'),
    getTrends: () => api.get('/analytics/trends'),
    getRevenue: () => api.get('/analytics/revenue'),
    getRegional: () => api.get('/analytics/regional'),
    getWorkload: () => api.get('/analytics/workload'),
};

// Upload API
export const uploadAPI = {
    parse: (formData) => api.post('/upload/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    import: (formData) => api.post('/upload/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    uploadSpreadsheet: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/upload/spreadsheet', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    importOrders: (data) => api.post('/upload/import/orders', data),
    importTechnicians: (data) => api.post('/upload/import/technicians', data),
};

export default api;
