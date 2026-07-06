/**
 * auth.api.js — Authentication API services
 * منصة محاسبتك — Sprint 9 (Production-Ready)
 */

const AuthApi = (() => {
  'use strict';

  return {
    /**
     * Student Login
     * POST /api/auth/login
     */
    login: async (email, password) => {
      if (ApiClient.isMock()) {
        await new Promise(r => setTimeout(r, 800));
        if (!email || !password) throw new Error('يرجى إدخال البريد وكلمة المرور');
        const mockToken = 'mock-jwt-token-' + Date.now();
        ApiClient.saveToken(mockToken);
        return {
          token: mockToken,
          user: {
            id: email.replace(/[^a-z0-9]/gi, '_'),
            name: 'أحمد محمود',
            academicYear: 'السنة الثانية',
            email,
          }
        };
      }

      // Live mode — endpoint: POST /api/users/login
      const data = await ApiClient.post('/users/login', { email, password });
      // Backend may return token at root level or nested
      const token = data.token || data.data?.token;
      if (token) ApiClient.saveToken(token);
      // Save student info (backend may return user at root or nested in data)
      const user = data.user || data.data?.user || data.data;
      if (user) {
        localStorage.setItem('student_id',   user.id   || user._id || '');
        localStorage.setItem('student_name', user.name || user.fullName || user.username || '');
        localStorage.setItem('student_year', user.academicYear || user.year || '');
      }
      return data;
    },

    /**
     * Student Register
     * POST /api/auth/register
     */
    register: async (payload) => {
      if (ApiClient.isMock()) {
        await new Promise(r => setTimeout(r, 900));
        const mockToken = 'mock-jwt-token-' + Date.now();
        ApiClient.saveToken(mockToken);
        return { token: mockToken, user: { ...payload } };
      }

      // Live mode — endpoint: POST /api/users/register
      const data = await ApiClient.post('/users/register', payload);
      const token = data.token || data.data?.token;
      if (token) ApiClient.saveToken(token);
      return data;
    },

    /**
     * Logout — clears token and redirects
     */
    logout: () => {
      ApiClient.logout();
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: () => !!ApiClient.getToken(),
  };
})();
