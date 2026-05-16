import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: '/api',
});

// Token management via dedicated utility to break circular dependency
import { getAccessToken as getToken, getRefreshToken as getRefToken, setTokens as updateTokens, clearTokens as resetTokens } from '@/lib/tokens';

export const getAccessToken = () => getToken();
export const getRefreshToken = () => getRefToken();

export const setAccessToken = (token) => {
    updateTokens(token, getRefreshToken());
};

export const setRefreshToken = (token) => {
    updateTokens(getAccessToken(), token);
};

export const clearTokens = () => {
    resetTokens();
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
        // Lazily reset Zustand store to avoid circular dependency
        try {
            const { useAuthStore } = require('@/store/authStore');
            useAuthStore.setState({
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
                isLoading: false,
                error: null
            });
        } catch (e) {
            // Store may not be available (SSR), ignore
        }
    }
};

// Request interceptor - add auth header
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retrying, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Prevent infinite loop: Don't handle 401 for login, logout, or refresh requests
            if (originalRequest.url.includes('/auth/login') ||
                originalRequest.url.includes('/auth/logout') ||
                originalRequest.url.includes('/auth/refresh')) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            const storedRefreshToken = getRefreshToken();
            if (!storedRefreshToken) {
                clearTokens();
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            try {
                const { data } = await axios.post('/api/auth/refresh', { refreshToken: storedRefreshToken });
                if (data.success && data.data.accessToken) {
                    const newAccessToken = data.data.accessToken;
                    updateTokens(newAccessToken, storedRefreshToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                clearTokens();
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// API Response helper
const handleResponse = (response) => {
    if (response.data.success) {
        return response.data.data;
    }
    throw new Error(response.data.message || 'Request failed');
};

const handleError = (error) => {
    const message =
        error.response?.data?.error ||
        error.response?.data?.errors?.[0]?.message ||
        error.response?.data?.message ||
        error.message ||
        'An error occurred';
    throw new Error(message);
};

// ==================== AUTH API ====================
export const authApi = {
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            const data = handleResponse(response);
            if (data.accessToken) {
                setAccessToken(data.accessToken);
            }
            return data;
        } catch (error) {
            handleError(error);
        }
    },

    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            const data = handleResponse(response);
            if (data.accessToken) {
                setAccessToken(data.accessToken);
            }
            if (data.refreshToken) {
                setRefreshToken(data.refreshToken);
            }
            return data;
        } catch (error) {
            handleError(error);
        }
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
            clearTokens();
        } catch (error) {
            clearTokens();
        }
    },

    getMe: async () => {
        try {
            const response = await api.get('/auth/me');
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    verifyEmail: async (token) => {
        try {
            const response = await api.get(`/auth/verify-email?token=${token}`);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    forgotPassword: async (email) => {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    resetPassword: async (token, password) => {
        try {
            const response = await api.post('/auth/forgot-password', { token, newPassword: password });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },
};

// ==================== USER API ====================
export const userApi = {
    getDashboard: async () => {
        try {
            const response = await api.get('/user/dash');
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    getProfile: async () => {
        try {
            const response = await api.get('/user/profile');
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/user/profile', profileData);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    changePassword: async (passwords) => {
        try {
            const response = await api.put('/user/change-password', passwords);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },
};

// ==================== KYC API ====================
export const kycApi = {
    getStatus: async () => {
        try {
            const response = await api.get('/kyc/status');
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    upload: async (formData) => {
        try {
            const response = await api.post('/kyc/upload', formData);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    getDocuments: async () => {
        try {
            const response = await api.get('/kyc/documents');
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    resubmit: async (formData) => {
        try {
            const response = await api.post('/kyc/resubmit', formData);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },
};

// ==================== INDICES API ====================
export const indicesApi = {
    getAll: async (params = {}) => {
        try {
            const response = await api.get('/indices', { params });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    getById: async (id) => {
        try {
            const response = await api.get(`/indices/${id}`);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    getStats: async (id) => {
        try {
            const response = await api.get(`/indices/${id}/stats`);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },
};

// ==================== INVESTMENTS API ====================
export const investmentsApi = {
    getAll: async (params = {}) => {
        try {
            const response = await api.get('/investments', { params });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    getById: async (id) => {
        try {
            const response = await api.get(`/investments/${id}`);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    getActive: async () => {
        try {
            const response = await api.get('/investments/active');
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    getHistory: async (params = {}) => {
        try {
            const response = await api.get('/investments/history', { params });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    getSummary: async () => {
        try {
            const response = await api.get('/investments/summary');
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },
};

// ==================== PAYMENTS API ====================
export const paymentsApi = {
    createRequest: async (data) => {
        try {
            const response = await api.post('/payments/request', data);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    uploadProof: async (formData) => {
        try {
            const response = await api.post('/payments/upload-proof', formData);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    getMyRequests: async (params = {}) => {
        try {
            const response = await api.get('/payments/my-requests', { params });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    getById: async (id) => {
        try {
            const response = await api.get(`/payments/${id}`);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    getStatus: async (id) => {
        try {
            const response = await api.get(`/payments/${id}/status`);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },
};

// ==================== WITHDRAWALS API ====================
export const withdrawalsApi = {
    createRequest: async (data) => {
        try {
            const response = await api.post('/withdrawals/request', data);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    getMyRequests: async (params = {}) => {
        try {
            const response = await api.get('/withdrawals/my-requests', { params });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    getById: async (id) => {
        try {
            const response = await api.get(`/withdrawals/${id}`);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },
};

// ==================== RETURNS API ====================
export const returnsApi = {
    getHistory: async (params = {}) => {
        try {
            const response = await api.get('/returns/history', { params });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    getExpected: async () => {
        try {
            const response = await api.get('/returns/expected');
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },
};

// ==================== TICKETS API ====================
export const ticketsApi = {
    getAll: async (params = {}) => {
        try {
            const response = await api.get('/tickets', { params });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    create: async (data) => {
        try {
            const response = await api.post('/tickets', data);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    getById: async (id) => {
        try {
            const response = await api.get(`/tickets/${id}`);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    reply: async (id, message) => {
        try {
            const response = await api.post(`/tickets/${id}`, { message });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    close: async (id) => {
        try {
            const response = await api.post(`/tickets/${id}/close`);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },
};

// ==================== ADMIN API ====================
export const adminApi = {
    getDashboard: async () => {
        try {
            const response = await api.get('/admin/dashboard');
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    // Users
    getUsers: async (params = {}) => {
        try {
            const response = await api.get('/admin/users', { params });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    getUser: async (id) => {
        try {
            const response = await api.get(`/admin/users/${id}`);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    updateUser: async (id, data) => {
        try {
            const response = await api.put(`/admin/users/${id}`, data);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },
    deleteUser: async (id) => {
        try {
            const response = await api.delete(`/admin/users/${id}`);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },
    // KYC
    getKYCRecords: async (params = {}) => {
        try {
            const response = await api.get('/admin/kyc', { params });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    approveKYC: async (id) => {
        try {
            const response = await api.post(`/admin/kyc/${id}/approve`);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    rejectKYC: async (id, reason) => {
        try {
            const response = await api.post(`/admin/kyc/${id}/reject`, { reason });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    // Payments
    getPayments: async (params = {}) => {
        try {
            const response = await api.get('/admin/payments', { params });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    approvePayment: async (id) => {
        try {
            const response = await api.post(`/admin/payments/${id}/approve`);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    rejectPayment: async (id, reason) => {
        try {
            const response = await api.post(`/admin/payments/${id}/reject`, { reason });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    // Investments
    getInvestments: async (params = {}) => {
        try {
            const response = await api.get('/admin/investments', { params });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    addManualReturn: async (id, data) => {
        try {
            const response = await api.post(`/admin/investments/${id}/add-return`, data);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    // Withdrawals
    getWithdrawals: async (params = {}) => {
        try {
            const response = await api.get('/admin/withdrawals', { params });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    approveWithdrawal: async (id, transactionReference) => {
        try {
            const response = await api.post(`/admin/withdrawals/${id}/approve`, { transactionReference });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    rejectWithdrawal: async (id, reason) => {
        try {
            const response = await api.post(`/admin/withdrawals/${id}/reject`, { reason });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    // Returns
    getReturns: async (params = {}) => {
        try {
            const response = await api.get('/admin/returns', { params });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    // Indices
    getIndices: async (params = {}) => {
        try {
            const response = await api.get('/admin/indices', { params });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    createIndex: async (data) => {
        try {
            const response = await api.post('/admin/indices', data);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    updateIndex: async (id, data) => {
        try {
            const response = await api.put(`/admin/indices/${id}`, data);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    deleteIndex: async (id) => {
        try {
            const response = await api.delete(`/admin/indices/${id}`);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    distributeReturns: async (id, data) => {
        try {
            const response = await api.post(`/admin/indices/${id}/distribute-returns`, data);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    // Settings
    getSettings: async (category) => {
        try {
            const params = category ? { category } : {};
            const response = await api.get('/admin/settings', { params });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    updateSettings: async (category, settings) => {
        try {
            const response = await api.put('/admin/settings', { category, settings });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    initSettings: async () => {
        try {
            const response = await api.post('/admin/settings');
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    // Tickets
    getTickets: async (params = {}) => {
        try {
            const response = await api.get('/admin/tickets', { params });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    getTicket: async (id) => {
        try {
            const response = await api.get(`/admin/tickets/${id}`);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    replyTicket: async (id, message) => {
        try {
            const response = await api.post(`/admin/tickets/${id}`, { message });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    updateTicket: async (id, data) => {
        try {
            const response = await api.put(`/admin/tickets/${id}`, data);
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },
};

export const referralApi = {
    getStats: async () => {
        try {
            const response = await api.get('/user/referrals');
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    getBonuses: async () => {
        try {
            const response = await api.get('/user/referrals/bonuses');
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    },

    getAdminStats: async (params = {}) => {

        try {
            const response = await api.get('/admin/referrals', { params });
            return handleResponse(response);
        } catch (error) {
            handleError(error);
        }
    }
};

export default api;

