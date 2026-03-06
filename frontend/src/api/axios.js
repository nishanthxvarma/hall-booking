import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Add auth token to requests
API.interceptors.request.use((config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        const { token } = JSON.parse(userInfo);
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;
