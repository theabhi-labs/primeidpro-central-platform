import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api/v1';

const api = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('primeidpro_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Extract data or format error
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors && error.response.data.errors.join(', ')) ||
      error.message ||
      'An unexpected network error occurred';

    // Auto logout on 401 token expiration (except for login/register/order pages)
    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes('/login') &&
      !window.location.pathname.includes('/register') &&
      !window.location.pathname.startsWith('/order')
    ) {
      if (localStorage.getItem('primeidpro_token')) {
        localStorage.removeItem('primeidpro_token');
        localStorage.removeItem('primeidpro_user');
        window.location.href = '/login?expired=true';
      }
    }

    return Promise.reject({ ...error, formattedMessage: message });
  }
);

// Auth Services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email })
};

// Customer Services
export const customerService = {
  uploadPhoto: (formData) =>
    api.post('/customer/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getTemplates: () => api.get('/customer/templates'),
  listCenters: (params) => api.get('/customer/centers', { params }),
  getCenter: (slugOrCode) => api.get(`/customer/centers/${slugOrCode}`),
  createOrder: (orderData) => api.post('/orders/create', orderData),
  getQuote: (quoteData) => api.post('/orders/quote', quoteData),
  trackOrder: (jobCode, trackingPin) =>
    api.get('/orders/track', { params: { jobCode, trackingPin } })
};

// Payment Services
export const paymentService = {
  createJobPaymentOrder: (orderId) => api.post('/payments/create-order', { orderId }),
  verifyJobPayment: (paymentData) => api.post('/payments/verify-payment', paymentData),
  createWalletTopupOrder: (amountInr, packageId) => api.post('/payments/wallet-order', { amountInr, packageId }),
  verifyWalletTopup: (topupData) => api.post('/payments/verify-wallet-topup', topupData)
};

// CSC Center Services
export const cscService = {
  getDashboardStats: () => api.get('/centers/dashboard'),
  getJobsQueue: (params) => api.get('/centers/orders', { params }),
  getJobDetails: (id) => api.get(`/centers/orders/${id}`),
  markCashReceived: (id) => api.post(`/centers/orders/${id}/cash-received`),
  createWalkInOrder: (data) => api.post('/orders/create', data),
  getWalletAndLedger: (params) => api.get('/centers/credits', { params }),
  generatePairingCode: () => api.post('/csc/pairing-code'),
  getKioskQr: () => api.get('/centers/qr'),
  getConnectedDevices: () => api.get('/centers/devices'),
  getServiceSettings: () => api.get('/centers/service-settings'),
  updateServiceSettings: (settings) => api.put('/centers/service-settings', settings),
  revokeDevice: (deviceId) => api.delete(`/centers/devices/${deviceId}`)
};

// Super Admin Services
export const adminService = {
  getAnalytics: () => api.get('/admin/dashboard'),
  listStudios: (params) => api.get('/admin/centers', { params }),
  updateStudio: (id, data) => api.patch(`/admin/centers/${id}`, data),
  listDevices: (params) => api.get('/admin/devices', { params }),
  updateDevice: (id, data) => api.patch(`/admin/devices/${id}`, data),
  listJobs: (params) => api.get('/admin/orders', { params }),
  listLedger: (params) => api.get('/admin/credits', { params }),
  listPricing: () => api.get('/admin/job-types'),
  updatePricing: (id, data) => api.put(`/admin/job-types/${id}`, data),
  listPackages: () => api.get('/admin/packages'),
  createPackage: (data) => api.post('/admin/packages', data),
  updatePackage: (id, data) => api.put(`/admin/packages/${id}`, data),
  listReleases: () => api.get('/admin/releases'),
  createRelease: (data) => api.post('/admin/releases', data)
};

// Health Service
export const healthService = {
  check: () => api.get('/health')
};

export { api };
export default api;
