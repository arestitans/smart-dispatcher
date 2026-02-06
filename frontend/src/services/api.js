import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const PUBLIC_MODE = import.meta.env.VITE_PUBLIC_MODE === 'true';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Fast timeout to fail quickly and fall back to mock data
    timeout: PUBLIC_MODE ? 1000 : 5000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    // In public/demo mode, avoid sending auth headers to prevent backend 401s
    if (!PUBLIC_MODE) {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // In public/demo mode, do not auto-logout on 401 so UI can use local fallbacks
        if (error.response?.status === 401) {
            if (!PUBLIC_MODE) {
                useAuthStore.getState().logout();
                window.location.href = '/login';
            } else {
                // Let components handle errors and show mock data
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);

// ===== MOCK DATA GENERATORS FOR PUBLIC/DEMO MODE =====
const generateMockDashboard = () => ({
    pendingActions: 142,
    onFieldFleet: 48,
    avgResponse: 18,
    dailyCompletion: 84,
    guaranteeClaims: 12,
    technicalIssues: 8,
    systemIssues: 3,
    completionRate: 94.2
});

const generateMockOrders = () => [
    { id: 'ORD-4459', customer: 'PT. Digital Solution', phone: '0812-3456-789', address: 'Jl. Sudirman No. 45, Jakarta', coordinates: { lat: -6.2088, lng: 106.8456 }, product: 'INDIHOME', schedule: '2024-10-24', status: 'TECHNICAL_ISSUE', priority: 'HIGH', assignee: { id: 'TX-9021', name: 'Budi Santoso' } },
    { id: 'ORD-4421', customer: 'Apt. Kemang Village', phone: '0877-8899-001', address: 'Lantai 12, Unit 1205, Jakarta', coordinates: { lat: -6.2625, lng: 106.8114 }, product: 'ORBIT', schedule: '2024-10-25', status: 'SCHEDULE', priority: 'NORMAL', assignee: { id: 'TX-9024', name: 'Andi Wijaya' } },
    { id: 'ORD-4501', customer: 'Sinar Mas Land', phone: '0821-2233-445', address: 'BSD City, Tangerang', coordinates: { lat: -6.3086, lng: 106.6385 }, product: 'HSI', schedule: '2024-10-24', status: 'OPEN', priority: 'HIGH', assignee: null },
    { id: 'ORD-4498', customer: 'Robby Hermawan', phone: '0815-5566-778', address: 'Pondok Indah Blok A-12', coordinates: { lat: -6.2694, lng: 106.7825 }, product: 'DATIN', schedule: '2024-10-23', status: 'PS_DONE', priority: 'NORMAL', assignee: { id: 'TX-9023', name: 'Dedi Triadi' } },
];

const generateMockTechnicians = () => [
    { id: 'TX-9021', name: 'Budi Santoso', photo: 'https://randomuser.me/api/portraits/men/1.jpg', area: 'Jakarta Selatan', rank: 'TOP', stats: { revenuePoints: 1250, completedOrders: 156, avgHandlingTime: 45, slaCompliance: 98, guaranteeClaims: 0 } },
    { id: 'TX-9023', name: 'Siti Rahma', photo: 'https://randomuser.me/api/portraits/women/1.jpg', area: 'Jakarta Pusat', rank: 'TOP', stats: { revenuePoints: 1100, completedOrders: 142, avgHandlingTime: 48, slaCompliance: 96, guaranteeClaims: 0 } },
    { id: 'TX-9022', name: 'Ahmad Subarjo', photo: 'https://randomuser.me/api/portraits/men/2.jpg', area: 'Jakarta Selatan', rank: 'GOOD', stats: { revenuePoints: 980, completedOrders: 124, avgHandlingTime: 52, slaCompliance: 94, guaranteeClaims: 1 } },
];

const generateMockClaims = () => [
    { id: 'CLM-1000', orderId: 'ORD-8700', customer: 'PT. Digital', technician: { id: 'TX-9021', name: 'Budi Santoso' }, product: 'INDIHOME', originalPsDate: '2024-09-20', claimDate: '2024-10-05', remainingDays: 10, status: 'INVESTIGATION', description: 'Connection issue' },
];

// ===== API WRAPPERS =====
// In public mode, skip network entirely and return mock data instantly
const callAPI = (fn, mockData) => {
    if (PUBLIC_MODE && mockData) {
        // Return mock data immediately with no network call
        return Promise.resolve({ data: mockData });
    }
    return fn();
};

// Auth API
export const authAPI = {
    login: (username, password) => callAPI(() => api.post('/auth/login', { username, password })),
    verify: () => callAPI(() => api.get('/auth/verify')),
};

// Orders API
export const ordersAPI = {
    getAll: (params) => callAPI(() => api.get('/orders', { params }), { orders: generateMockOrders() }),
    getById: (id) => callAPI(() => api.get(`/orders/${id}`)),
    create: (data) => api.post('/orders', data),
    assign: (id, data) => api.post(`/orders/${id}/assign`, data),
    updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
    getStats: () => api.get('/orders/stats/summary'),
};

// Technicians API
export const techniciansAPI = {
    getAll: (params) => callAPI(() => api.get('/technicians', { params }), { technicians: generateMockTechnicians() }),
    getById: (id) => callAPI(() => api.get(`/technicians/${id}`)),
    getRanking: () => callAPI(() => api.get('/technicians/ranking'), { ranking: generateMockTechnicians() }),
    getPerformance: (id) => callAPI(() => api.get(`/technicians/${id}/performance`)),
    getGeneralReview: () => callAPI(() => api.get('/technicians/review/general'), {
        totalTechnicians: 6,
        avgCompletionRate: 113,
        avgSlaCompliance: 90.5,
        avgHandlingTime: 56,
        totalRevenue: 5590,
        byRank: { top: 2, good: 2, average: 1, poor: 1 },
        techsWithClaims: []
    }),
    sendBulkMessage: (data) => api.post('/technicians/message/bulk', data),
    bulkSendOrders: (technicianIds) => api.post('/technicians/orders/bulk-send', { technicianIds }),
    getPending: () => callAPI(() => api.get('/technicians/pending'), { pending: [] }),
    approve: (id, data) => api.post(`/technicians/${id}/approve`, data),
    reject: (id, reason) => api.post(`/technicians/${id}/reject`, { reason }),
};

// Claims API
export const claimsAPI = {
    getAll: (params) => callAPI(() => api.get('/claims', { params }), { claims: generateMockClaims() }),
    getById: (id) => callAPI(() => api.get(`/claims/${id}`)),
    create: (data) => api.post('/claims', data),
    updateStatus: (id, status) => api.patch(`/claims/${id}/status`, { status }),
};

// Analytics API
export const analyticsAPI = {
    getDashboard: () => callAPI(() => api.get('/analytics/dashboard'), generateMockDashboard()),
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

// Users API
export const usersAPI = {
    getAll: () => api.get('/users'),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.patch(`/users/${id}`, data),
    changePassword: (id, currentPassword, newPassword) => api.patch(`/users/${id}/password`, { currentPassword, newPassword }),
    resetPassword: (id, newPassword) => api.patch(`/users/${id}/password-reset`, { newPassword }),
    delete: (id) => api.delete(`/users/${id}`),
};

export default api;
