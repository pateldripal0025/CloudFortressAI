import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: `${config.apiUrl}/api`,

  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Add auth token and log request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cf_token');
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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handle errors globally and auto-rotate refresh tokens
api.interceptors.response.use(
  (response) => {
    return response.data; // Standardize to return .data directly
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Auto-refresh expired access tokens seamlessly
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login') && !originalRequest.url.includes('/auth/register')) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('cf_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${config.apiUrl}/api/auth/refresh`, { refreshToken });
          if (res.data && res.data.token) {
            const newAccessToken = res.data.token;
            localStorage.setItem('cf_token', newAccessToken);
            originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
            processQueue(null, newAccessToken);
            isRefreshing = false;
            return api(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          // Clear dead session credentials
          localStorage.removeItem('cf_token');
          localStorage.removeItem('cf_refresh_token');
          // Trigger custom event or reload to clear state
          window.dispatchEvent(new Event('auth_session_expired'));
          return Promise.reject(refreshError);
        }
      }
    }

    const message = error.response?.data?.message || error.response?.data?.detail || error.message || 'An unexpected error occurred';
    console.error(`[API Response Error] ${error.config?.url}:`, message);
    error.message = message; // Permanently override with detailed backend response message
    return Promise.reject(error);
  }
);

// Python Backend Instance (Port 8000) - For fallback or specific tasks
const pythonApi = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  timeout: 10000,
});

export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary'),
  getAnalytics: () => api.get('/analytics'),
  getAIPriorityInsights: () => api.get('/ai/priority-insights'),
  getThreatSurfaceData: () => api.get('/dashboard/threat-surface'),
  getResourceSphereData: () => api.get('/dashboard/resource-sphere'),
};


export const scanService = {
  startScan: (provider) => api.post('/scans/start', { provider }),
  getHistory: () => api.get('/scans/history'),
};

export const vulnerabilityService = {
  getVulnerabilities: () => api.get('/vulnerabilities'),
};

export const riskService = {
  fetchRisks: (params) => {
    // Explicitly handle empty params to avoid trailing ?
    const query = params ? new URLSearchParams(params).toString() : '';
    return api.get(`/risks${query ? '?' + query : ''}`);
  },
  fetchRiskById: (id) => api.get(`/risks/${id}`),
  resolveRisk: (id) => api.put(`/risks/${id}/resolve`),
  createRisk: (data) => api.post('/risks', data),
  updateRisk: (id, data) => api.patch(`/risks/${id}`, data),
  deleteRisk: (id) => api.delete(`/risks/${id}`),
  
  exportRisksToCSV: async () => {
    // We need a fresh axios instance or bypass the interceptor for blob
    const response = await axios.get(`${config.apiUrl}/api/risks/export`, { 
      responseType: 'blob',
      headers: { Authorization: `Bearer ${localStorage.getItem('cf_token')}` }
    });
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `risks_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
  
  downloadPDFReport: async (id) => {
    const response = await axios.get(`${config.apiUrl}/api/risks/${id}/report`, { 
      responseType: 'blob',
      headers: { Authorization: `Bearer ${localStorage.getItem('cf_token')}` }
    });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Risk_Report_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Notifications (Now on Node Backend)
  getNotifications: () => api.get('/notifications'),
  markNotificationRead: (id) => api.put(`/notifications/${id}/read`),
  clearNotifications: () => api.delete('/notifications/clear'),

  // Search
  globalSearch: (query) => api.get(`/search?search=${query}`),
};


export const assetService = {
  getAssets: () => api.get('/assets'),
};

export { pythonApi };
export default api;
