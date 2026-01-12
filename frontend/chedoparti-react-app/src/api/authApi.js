import apiClient from './client';

const authApi = {
  login: async (email, password) => {
    // /api/auth/login → API Gateway → user-service (StripPrefix quita /api)
    return apiClient.post('/auth/login', {
      email,
      password,
    });
  },

  register: async (userData) => {
    // /api/auth/register → API Gateway → user-service (StripPrefix quita /api)
    return apiClient.post('/auth/register', userData);
  },

  me: async () => {
    // /api/auth/me → API Gateway → user-service
    return apiClient.get('/auth/me');
  },

  forgotPassword: async (email) => {
    // /api/auth/forgot-password → API Gateway → user-service
    return apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token, newPassword) => {
    // /api/auth/reset-password → API Gateway → user-service
    return apiClient.post('/auth/reset-password', { token, newPassword });
  },
};

export default authApi;
