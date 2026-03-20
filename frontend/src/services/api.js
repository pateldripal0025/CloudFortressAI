import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',

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

// Response Interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response.data; // Standardize to return .data directly
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    console.error(`[API Response Error] ${error.config?.url}:`, message);
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
    const response = await axios.get('http://localhost:5001/api/risks/export', { 
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
    const response = await axios.get(`http://localhost:5001/api/risks/${id}/report`, { 
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
