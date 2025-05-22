const API_URL = 'http://localhost:5000/api';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_URL}/auth/login`,
        REGISTER: `${API_URL}/auth/register`,
    },
    EXPENSES: {
        GET_ALL: `${API_URL}/expenses`,
        CREATE: `${API_URL}/expenses`,
        UPDATE: (id) => `${API_URL}/expenses/${id}`,
        DELETE: (id) => `${API_URL}/expenses/${id}`,
    }
}; 