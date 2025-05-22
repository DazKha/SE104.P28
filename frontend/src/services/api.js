import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

// Create axios instance with default config
const api = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth services
export const authService = {
    login: async (credentials) => {
        const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
        return response.data;
    },
    register: async (userData) => {
        const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
        return response.data;
    },
};

// Expense services
export const expenseService = {
    getAll: async () => {
        const response = await api.get(API_ENDPOINTS.EXPENSES.GET_ALL);
        return response.data;
    },
    create: async (expenseData) => {
        const response = await api.post(API_ENDPOINTS.EXPENSES.CREATE, expenseData);
        return response.data;
    },
    update: async (id, expenseData) => {
        const response = await api.put(API_ENDPOINTS.EXPENSES.UPDATE(id), expenseData);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(API_ENDPOINTS.EXPENSES.DELETE(id));
        return response.data;
    },
}; 