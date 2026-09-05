import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization Bearer token if present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('orvix_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API Calls
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data?.token) {
    localStorage.setItem('orvix_token', response.data.token);
    localStorage.setItem('orvix_user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data?.token) {
    localStorage.setItem('orvix_token', response.data.token);
    localStorage.setItem('orvix_user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('orvix_token');
  localStorage.removeItem('orvix_user');
};

// System Health
export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};

export const checkMlServiceHealth = async () => {
  try {
    const mlUrl = import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.get(`${mlUrl}/health`);
    return response.data;
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};

// Dashboard Stats
export const fetchDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

// Recovery Case REST APIs
export const fetchRecoveryCases = async (params = {}) => {
  const response = await api.get('/recovery/cases', { params });
  return response.data;
};

export const fetchRecoveryCaseById = async (id) => {
  const response = await api.get(`/recovery/cases/${id}`);
  return response.data;
};

export const createRecoveryCase = async (caseData) => {
  const response = await api.post('/recovery/cases', caseData);
  return response.data;
};

export const decideRecoveryCase = async (id, decisionData = {}) => {
  const response = await api.post(`/recovery/cases/${id}/decide`, decisionData);
  return response.data;
};

export const executeRecoveryCase = async (id, executionData = {}) => {
  const response = await api.post(`/recovery/cases/${id}/execute`, executionData);
  return response.data;
};

export const stopRecoveryCase = async (id, stopData = {}) => {
  const response = await api.post(`/recovery/cases/${id}/stop`, stopData);
  return response.data;
};

export const escalateRecoveryCase = async (id, escalateData = {}) => {
  const response = await api.post(`/recovery/cases/${id}/escalate`, escalateData);
  return response.data;
};

// Legacy fallback helper alias
export const fetchCases = fetchRecoveryCases;
export const fetchCaseById = fetchRecoveryCaseById;

// Customer Recovery Intelligence
export const fetchCustomers = async (params = {}) => {
  const response = await api.get('/customers', { params });
  return response.data;
};

export const fetchCustomerById = async (id) => {
  const response = await api.get(`/customers/${id}`);
  return response.data;
};

// Policy
export const fetchPolicy = async () => {
  const response = await api.get('/policies');
  return response.data;
};

export const updatePolicy = async (policyData) => {
  const response = await api.put('/policies', policyData);
  return response.data;
};

// Audit Logs
export const fetchAuditLogs = async (params = {}) => {
  const response = await api.get('/audit-logs', { params });
  return response.data;
};

// Experiments & Analytics
export const fetchExperimentStats = async () => {
  const response = await api.get('/experiments/stats');
  return response.data;
};

export const fetchAnalyticsExperiments = async () => {
  const response = await api.get('/analytics/experiments');
  return response.data;
};

export default api;
