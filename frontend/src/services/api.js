import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for catching global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error (offline)
      console.warn('Network error: You might be offline.');
    } else if (error.response.status === 401) {
      // OTP routes return 401 for wrong/expired OTP — this is expected validation, NOT a session expiry.
      // Do NOT redirect to home for these routes; let the component catch block handle the error.
      const requestUrl = error.config?.url || '';
      const isOtpRoute = requestUrl.includes('/auth/otp/');
      if (!isOtpRoute) {
        console.warn('Unauthorized access - Token expired or invalid.');
        sessionStorage.removeItem('userInfo');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
