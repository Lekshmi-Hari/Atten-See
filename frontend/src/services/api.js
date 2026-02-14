import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    console.log('📤 API Request:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        tokenLength: token ? token.length : 0
    });
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token added to request');
    } else {
        console.warn('⚠️ No token found in localStorage');
    }
    return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        console.log('📥 API Response Success:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('❌ API Response Error:', {
            url: error.config?.url,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/users/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },
    register: async (userData) => {
        const response = await api.post('/users', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem('user'));
    }
};

export const sessionService = {
    getAll: async () => {
        const response = await api.get('/sessions');
        return response.data;
    },
    create: async (sessionData) => {
        const response = await api.post('/sessions', sessionData);
        return response.data;
    },
    getStats: async () => {
        const response = await api.get('/sessions/stats');
        return response.data;
    }
};

export const lectureService = {
    getAll: async () => {
        const response = await api.get('/lectures');
        return response.data;
    },
    create: async (lectureData) => {
        const response = await api.post('/lectures', lectureData);
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/lectures/${id}`);
        return response.data;
    }
};

export const goalService = {
    getAll: async () => {
        try {
            const response = await api.get('/goals');
            return response.data;
        } catch (error) {
            console.error('Get goals error:', error.response?.data || error.message);
            throw error;
        }
    },
    create: async (goalData) => {
        try {
            console.log('Creating goal:', goalData);
            const response = await api.post('/goals', goalData);
            console.log('Goal created:', response.data);
            return response.data;
        } catch (error) {
            console.error('Create goal error:', error.response?.data || error.message);
            throw error;
        }
    },
    update: async (id, goalData) => {
        try {
            const response = await api.put(`/goals/${id}`, goalData);
            return response.data;
        } catch (error) {
            console.error('Update goal error:', error.response?.data || error.message);
            throw error;
        }
    },
    delete: async (id) => {
        try {
            const response = await api.delete(`/goals/${id}`);
            return response.data;
        } catch (error) {
            console.error('Delete goal error:', error.response?.data || error.message);
            throw error;
        }
    }
};

export default api;
