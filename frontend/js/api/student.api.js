/**
 * student.api.js — Student profile and dashboard API services
 */

const StudentApi = (() => {
  'use strict';

  return {
    /**
     * Fetch dashboard statistics and overview for a specific student ID
     * Endpoint: GET /api/students/:id/dashboard
     */
    getDashboard: async (studentId) => {
      // In mock mode, studentId is ignored and we serve local dashboard.json
      return ApiClient.get(`/students/${studentId}/dashboard`);
    },

    /**
     * Fetch student exam attempt history
     * Endpoint: GET /api/students/:id/attempts
     */
    getAttempts: async (studentId) => {
      return ApiClient.get(`/students/${studentId}/attempts`);
    }
  };
})();
