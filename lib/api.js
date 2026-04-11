import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

let currentAccessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

export const setAccessToken = (token) => {
  currentAccessToken = token;
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('accessToken', token);
    else localStorage.removeItem('accessToken');
  }
};

// Request interceptor to attach access token
api.interceptors.request.use((config) => {
  if (currentAccessToken) {
    config.headers.Authorization = `Bearer ${currentAccessToken}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent interceptor from handling auth endpoints to avoid loops
    if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/login')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/auth/refresh`, {}, { withCredentials: true });
        const newToken = res.data.data.accessToken;
        setAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
