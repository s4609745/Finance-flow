import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401 && error.response?.data?.message !== 'Invalid credentials') {
      console.log('Token expired or invalid, logging out');
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Auth
  register: (data: any) => api.post('/api/register', data),
  login: (data: any) => api.post('/api/login', data),
  getCurrentUser: () => api.get('/api/auth/user'),

  // Categories
  getCategories: (type?: string) => api.get(`/api/categories${type ? `?type=${type}` : ''}`),
  createCategory: (data: any) => api.post('/api/categories', data),
  updateCategory: (id: string, data: any) => api.patch(`/api/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/api/categories/${id}`),

  // Transactions
  getTransactions: (params?: any) => api.get('/api/transactions', { params }),
  getTransaction: (id: string) => api.get(`/api/transactions/${id}`),
  createTransaction: (data: any) => api.post('/api/transactions', data),
  updateTransaction: (id: string, data: any) => api.patch(`/api/transactions/${id}`, data),
  deleteTransaction: (id: string) => api.delete(`/api/transactions/${id}`),
  exportTransactions: () => api.get('/api/transactions/export/csv', { responseType: 'blob' }),

  // Analytics
  getUserStats: (params?: any) => api.get('/api/analytics/stats', { params }),
  getRecentTransactions: (params?: any) => api.get('/api/analytics/recent-transactions', { params }),
  getCategoryExpenses: (params?: any) => api.get('/api/analytics/category-expenses', { params }),

  // Admin
  getAllUsers: () => api.get('/api/admin/users'),
  updateUserStatus: (id: string, data: any) => api.patch(`/api/admin/users/${id}/status`, data),
  updateUserRole: (id: string, data: any) => api.patch(`/api/admin/users/${id}/role`, data),
  getAdminStats: () => api.get('/api/admin/stats'),
};