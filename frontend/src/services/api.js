import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Add auth token and log request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An unexpected error occurred';
    console.error(`[API Response Error] ${error.config?.url}:`, message);
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out');
    }
    
    return Promise.reject(error);
  }
);

export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary'),
};

export const scanService = {
  getHistory: () => api.get('/scans/history'),
  startScan: (provider) => api.post('/scans/start', { provider }),
  getRisks: (scanId) => api.get(`/scans/${scanId}/risks`),
};

export const riskService = {
  getAllRisks: () => api.get('/risks'),
};

export const aiService = {
  getPriorityInsights: () => api.get('/ai/priority-insights'),
};

export default api;
