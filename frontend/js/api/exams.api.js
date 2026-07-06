/**
 * exams.api.js — Exams and Questions API services
 * منصة محاسبتك
 *
 * ⚠️ Live endpoints for exams/questions are NOT yet confirmed on the Railway backend.
 *    These fall back gracefully so the exam pages still work with mock data
 *    until the backend team adds these routes.
 */

const ExamsApi = (() => {
  'use strict';

  return {
    /**
     * Fetch exam sections for a specific subject/course
     * Mock: local exam-sections.json
     * Live: GET /api/courses/:courseId/exam-sections  (TBD)
     */
    getExamSections: async (subjectId) => {
      if (ApiClient.isMock()) {
        const response = await ApiClient.get(`/subjects/${subjectId}/exam-sections`);
        return { examSections: response.examSections.filter(es => es.subjectId === subjectId) };
      }
      try {
        const resp = await ApiClient.get(`/courses/${subjectId}/exam-sections`);
        return { examSections: resp?.data?.examSections || resp?.examSections || resp?.data || [] };
      } catch (err) {
        console.warn('[ExamsApi] exam-sections endpoint not available:', err.message);
        return { examSections: [] };
      }
    },

    /**
     * Fetch questions for a specific exam section
     * Mock: local questions.json
     * Live: GET /api/exam-sections/:sectionId/questions  (TBD)
     */
    getQuestions: async (sectionId) => {
      if (ApiClient.isMock()) {
        const response = await ApiClient.get(`/exam-sections/${sectionId}/questions`);
        return { questions: response.questions.filter(q => q.sectionId === sectionId) };
      }
      try {
        const resp = await ApiClient.get(`/exam-sections/${sectionId}/questions`);
        return { questions: resp?.data?.questions || resp?.questions || resp?.data || [] };
      } catch (err) {
        console.warn('[ExamsApi] questions endpoint not available:', err.message);
        return { questions: [] };
      }
    },

    /**
     * Submit exam answers
     * Mock: always succeeds
     * Live: POST /api/exam-sections/:sectionId/submit  (TBD)
     */
    submitExam: async (sectionId, answers) => {
      if (ApiClient.isMock()) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, message: 'تم التسليم بنجاح' };
      }
      try {
        return await ApiClient.post(`/exam-sections/${sectionId}/submit`, { answers });
      } catch (err) {
        console.warn('[ExamsApi] submit endpoint not available:', err.message);
        return { success: true, message: 'تم التسليم (offline mode)' };
      }
    }
  };
})();
