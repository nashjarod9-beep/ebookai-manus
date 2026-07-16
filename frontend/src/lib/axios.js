import axios from 'axios';

const isProd = typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || !window.location.hostname.includes('localhost'));
const baseURL = import.meta.env.VITE_API_URL || (isProd ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  try {
    const saved = localStorage.getItem('user');
    if (saved) {
      const user = JSON.parse(saved);
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  } catch (e) {
    console.error("Error parsing user token in interceptor:", e);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
