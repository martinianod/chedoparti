import axios from 'axios';

//const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
const baseURL = '/api';

const apiClient = axios.create({
  baseURL,
});

apiClient.interceptors.request.use((config) => {
  // Skip authentication for auth endpoints
  const isAuthEndpoint =
    config.url?.includes('/auth/login') || config.url?.includes('/auth/register');

  if (!isAuthEndpoint) {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Response interceptor for error handling and token refresh
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

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Skip refresh for login/register endpoints
      const isAuthEndpoint = 
        originalRequest.url?.includes('/auth/login') || 
        originalRequest.url?.includes('/auth/register');
      
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }
      
      if (isRefreshing) {
        // Queue the request while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Try to refresh the token
        const { data } = await apiClient.post('/auth/refresh');
        const { token } = data;
        
        // Save new token
        localStorage.setItem('token', token);
        apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        
        // Process queued requests
        processQueue(null, token);
        
        // Retry original request
        originalRequest.headers['Authorization'] = 'Bearer ' + token;
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // For all other errors, just reject
    return Promise.reject(error);
  }
);

export default apiClient;

