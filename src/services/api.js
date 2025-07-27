import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const baseApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable credentials for CORS
});
// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Payment API calls
export const paymentAPI = {
  // Initiate M-Pesa payment
  initiateMpesaPayment: (data) => 
    api.post('/payments/mpesa/initiate', data),

  // Query payment status
  queryPaymentStatus: (checkoutRequestID) => 
    api.get(`/payments/mpesa/status/${checkoutRequestID}`),

  // Get all payments
  getAllPayments: (params = {}) => 
    api.get('/payments', { params }),

  // Get payment by ID
  getPaymentById: (id) => 
    api.get(`/payments/${id}`),

  // Get payment statistics
  getPaymentStats: () => 
    api.get('/payments/stats'),
};

// Customer API calls (placeholder for future implementation)
export const customerAPI = {
  getAllCustomers: () => 
    api.get('/customers'),
  
  getCustomerById: (id) => 
    api.get(`/customers/${id}`),
  
  createCustomer: (data) => 
    api.post('/customers', data),
  
  updateCustomer: (id, data) => 
    api.put(`/customers/${id}`, data),
  
  deleteCustomer: (id) => 
    api.delete(`/customers/${id}`),
};

// Bill API calls (placeholder for future implementation)
export const billAPI = {
  getAllBills: () => 
    api.get('/bills'),
  
  getBillById: (id) => 
    api.get(`/bills/${id}`),
  
  createBill: (data) => 
    api.post('/bills', data),
  
  updateBill: (id, data) => 
    api.put(`/bills/${id}`, data),
  
  deleteBill: (id) => 
    api.delete(`/bills/${id}`),
};

// Plan API calls (placeholder for future implementation)
export const planAPI = {
  getAllPlans: () => 
    api.get('/plans'),
  
  getPlanById: (id) => 
    api.get(`/plans/${id}`),
  
  createPlan: (data) => 
    api.post('/plans', data),
  
  updatePlan: (id, data) => 
    api.put(`/plans/${id}`, data),
  
  deletePlan: (id) => 
    api.delete(`/plans/${id}`),
};

// Report API calls (placeholder for future implementation)
export const reportAPI = {
  getRevenueReport: (params) => 
    api.get('/reports/revenue', { params }),
  
  getCustomerReport: (params) => 
    api.get('/reports/customers', { params }),
  
  getPaymentReport: (params) => 
    api.get('/reports/payments', { params }),
  
  getUsageReport: (params) => 
    api.get('/reports/usage', { params }),
};

// Auth API calls (placeholder for future implementation)
export const authAPI = {
  login: (credentials) => 
    api.post('/auth/login', credentials),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  logout: () => 
    api.post('/auth/logout'),
};

// Health check
export const healthAPI = {
  checkHealth: () => 
    baseApi.get('/health'),
};

export default api; 