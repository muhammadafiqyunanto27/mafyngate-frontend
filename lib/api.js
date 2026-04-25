import axios from 'axios';
import { API_URL } from './config';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let currentAccessToken = null;

if (typeof window !== 'undefined') {
  try {
    currentAccessToken = localStorage.getItem('accessToken');
  } catch (e) {
    console.warn('[API] localStorage access denied', e);
  }

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      currentAccessToken = urlToken;
      localStorage.setItem('accessToken', urlToken);
    }
  } catch (e) {
    console.warn('[API] Failed to parse token or save to localStorage', e);
  }
}

export const setAccessToken = (token) => {
  currentAccessToken = token;
  if (typeof window !== 'undefined') {
    try {
      if (token) localStorage.setItem('accessToken', token);
      else localStorage.removeItem('accessToken');
    } catch (e) {
      console.warn('[API] Could not update localStorage', e);
    }
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
        const res = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = res.data.data.accessToken;
        setAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        // Don't force redirect if we're on the landing page, login page, or currently trying to login
        if (typeof window !== 'undefined' && 
            window.location.pathname !== '/login' && 
            window.location.pathname !== '/' &&
            !window.location.search.includes('token=') &&
            !originalRequest.url.includes('/auth/login')) {
          console.log('[API] Refresh failed, redirecting to login...');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
