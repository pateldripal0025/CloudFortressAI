import axios from 'axios';

const API_URL = '/api/v1';

const fetchRisks = async ({ search = '', severity = '', provider = '', page = 1, limit = 10 }) => {
  try {
    const params = new URLSearchParams({
      search,
      severity,
      provider,
      page,
      limit
    });
    const environment = localStorage.getItem('selectedEnv') || 'production';
    const response = await axios.get(`${API_URL}/risks?${params.toString()}`, {
      headers: { 'x-env': environment }
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data?.error || error.message);
    throw error;
  }
};

const fetchRiskById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/risks/${id}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data?.error || error.message);
    throw error;
  }
};

const fetchVulnerabilityById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/vulnerabilities/${id}`);
    return response.data;
  } catch (error) {
    console.error('Vulnerability Error:', error.response?.data?.error || error.message);
    throw error;
  }
};

const resolveRisk = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/risks/${id}/resolve`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data?.error || error.message);
    throw error;
  }
};

const exportRisksToCSV = async () => {
  try {
    const response = await axios.get(`${API_URL}/risks/export`, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'risks_export.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Export Error:', error);
    throw error;
  }
};
const exportRiskReport = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/risks/${id}/export`, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `risk_report_${id}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Report Download Error:', error);
    throw error;
  }
};

const getNotifications = async () => {
  try {
    const response = await axios.get(`${API_URL}/notifications`);
    return response.data;
  } catch (error) {
    console.error('Notification Fetch Error:', error);
    throw error;
  }
};

const markNotificationRead = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    console.error('Notification Update Error:', error);
    throw error;
  }
};

const clearNotifications = async () => {
  try {
    const response = await axios.delete(`${API_URL}/notifications/clear`);
    return response.data;
  } catch (error) {
    console.error('Notification Clear Error:', error);
    throw error;
  }
};

const globalSearch = async (query) => {
  try {
    const environment = localStorage.getItem('selectedEnv') || 'production';
    const response = await axios.get(`${API_URL}/search?q=${query}`, {
      headers: { 'x-env': environment }
    });
    return response.data;
  } catch (error) {
    console.error('Search Error:', error.response?.data?.error || error.message);
    throw error;
  }
};

const downloadPDFReport = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/risks/${id}/report`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Risk_Report_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PDF Download Error:', error);
    throw error;
  }
};

const fetchVulnerabilities = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params);
    const response = await axios.get(`http://localhost:5000/api/vulnerabilities?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Vulnerability API Error:', error);
    return [];
  }
};

export default {
  fetchRisks,
  fetchRiskById,
  fetchVulnerabilityById,
  resolveRisk,
  getNotifications,
  markNotificationRead,
  clearNotifications,
  globalSearch,
  exportRisksToCSV,
  exportRiskReport,
  downloadPDFReport,
  fetchVulnerabilities
};
