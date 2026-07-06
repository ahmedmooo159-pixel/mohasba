/**
 * auth.api.js — Authentication API services
 * منصة محاسبتك — Sprint 9 (Production-Ready)
 *
 * Confirmed live endpoints (Railway backend):
 *   POST /api/users/login    — requires { email, password }
 *   POST /api/users/register — requires { email, password, name, role, grade, ... }
 *
 * Response shape from backend:
 *   { status: 'success', data: { token, user: {...} } }
 *   OR flat: { token, user: {...} }
 */

const AuthApi = (() => {
  'use strict';

  // ─── Helper: normalise response into { token, user } ─────────────────────────
  function extractTokenAndUser(data) {
    const token = data.token || data.data?.token || null;
    const user  = data.user  || data.data?.user  || data.data || null;
    return { token, user };
  }

  return {
    /**
     * Student Login
     * POST /api/users/login
     * Body: { email, password }
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
            id:           email.replace(/[^a-z0-9]/gi, '_'),
            _id:          email.replace(/[^a-z0-9]/gi, '_'),
            name:         'أحمد محمود',
            academicYear: 'السنة الثانية',
            email,
            role:         'student',
          }
        };
      }

      // Live mode — POST /api/users/login
      const data = await ApiClient.post('/users/login', { email, password });
      const { token, user } = extractTokenAndUser(data);

      if (token) ApiClient.saveToken(token);
      if (user) {
        localStorage.setItem('student_id',    user._id || user.id || '');
        localStorage.setItem('student_name',  user.name || user.fullName || user.username || '');
        localStorage.setItem('student_year',  user.academicYear || user.grade || user.year || '');
        localStorage.setItem('student_email', user.email || email);
        if (user.role) localStorage.setItem('student_role', user.role);
      }
      return { token, user };
    },

    /**
     * Student Register
     * POST /api/users/register
     *
     * The backend requires specific fields — we send everything the form collects.
     * If the backend rejects with "All fields are required", that means the backend
     * schema requires fields we don't know yet (ask backend dev for the exact schema).
     *
     * Payload mapping (frontend form → backend field names):
     *   name         → name
     *   email        → email
     *   password     → password
     *   year (1-4)   → grade ('first'|'second'|'third'|'fourth')
     *   section      → section
     *   role         → role ('student')
     */
    register: async (payload) => {
      if (ApiClient.isMock()) {
        await new Promise(r => setTimeout(r, 900));
        const mockToken = 'mock-jwt-token-' + Date.now();
        ApiClient.saveToken(mockToken);
        return { token: mockToken, user: { ...payload } };
      }

      // Map year number to grade string
      const gradeMap = { '1': 'first', '2': 'second', '3': 'third', '4': 'fourth' };
      const backendPayload = {
        name:     payload.name,
        email:    payload.email,
        password: payload.password,
        role:     payload.role || 'student',
        grade:    gradeMap[String(payload.year || payload.academicYear)] || payload.grade || 'first',
        section:  payload.section || 'A',
        // include any extra fields the backend might need
        ...(payload.phone       && { phone: payload.phone }),
        ...(payload.username    && { username: payload.username }),
        ...(payload.nationalId  && { nationalId: payload.nationalId }),
      };

      const data = await ApiClient.post('/users/register', backendPayload);
      const { token, user } = extractTokenAndUser(data);

      if (token) ApiClient.saveToken(token);
      return { token, user };
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
