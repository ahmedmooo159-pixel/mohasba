/**
 * student.api.js — Student profile and dashboard API services
 * منصة محاسبتك
 *
 * Confirmed live endpoints (Railway backend):
 *   GET /api/users         — list of users (admin, requires token)
 *   GET /api/users/:id     — single user profile (requires token)
 *
 * ⚠️ /students/:id/dashboard and /students/:id/attempts are NOT
 *    confirmed on the backend yet — they fall back to mock data
 *    until the backend team implements them.
 */

const StudentApi = (() => {
  'use strict';

  return {
    /**
     * Fetch dashboard statistics for a student
     *
     * Live: tries GET /api/users/:id first (gets profile data)
     * Falls back to mock dashboard.json if backend endpoint isn't ready
     */
    getDashboard: async (studentId) => {
      if (ApiClient.isMock()) {
        return ApiClient.get(`/students/${studentId}/dashboard`);
      }

      // Try the live endpoint (backend may not have a dedicated dashboard route)
      try {
        const resp = await ApiClient.get(`/students/${studentId}/dashboard`);
        return resp?.data || resp;
      } catch {
        // Endpoint not ready — fall back to user profile
        try {
          const userResp = await ApiClient.get(`/users/${studentId}`);
          const user = userResp?.data?.user || userResp?.user || userResp?.data || {};
          // Shape it like a dashboard object so the page doesn't break
          return {
            student: {
              name:         user.name || user.fullName || localStorage.getItem('student_name') || 'الطالب',
              academicYear: user.grade || user.academicYear || localStorage.getItem('student_year') || '',
              email:        user.email || '',
            },
            stats:         { totalSubjects: 0, completedExams: 0, averageScore: 0, totalHours: 0 },
            recentActivity:[],
            weeklyProgress:[],
          };
        } catch {
          // If even /users/:id fails, return a minimal dashboard from localStorage
          return {
            student: {
              name:         localStorage.getItem('student_name') || 'الطالب',
              academicYear: localStorage.getItem('student_year') || '',
            },
            stats:         { totalSubjects: 0, completedExams: 0, averageScore: 0, totalHours: 0 },
            recentActivity:[],
            weeklyProgress:[],
          };
        }
      }
    },

    /**
     * Fetch student exam attempt history
     * Live: GET /api/students/:id/attempts  (TBD)
     */
    getAttempts: async (studentId) => {
      if (ApiClient.isMock()) {
        return ApiClient.get(`/students/${studentId}/attempts`);
      }
      try {
        const resp = await ApiClient.get(`/students/${studentId}/attempts`);
        return resp?.data || resp;
      } catch {
        return { attempts: [] };
      }
    },

    /**
     * Get single user profile from backend
     * Live: GET /api/users/:id  (confirmed ✅)
     */
    getProfile: async (userId) => {
      const resp = await ApiClient.get(`/users/${userId}`);
      return resp?.data?.user || resp?.user || resp?.data || resp;
    },
  };
})();
