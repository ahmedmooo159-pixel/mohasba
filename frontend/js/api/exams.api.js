/**
 * exams.api.js — Exams and Questions API services
 */

const ExamsApi = (() => {
  'use strict';

  return {
    /**
     * Fetch exam sections for a specific subject
     * Endpoint: GET /api/subjects/:subjectId/exam-sections
     */
    getExamSections: async (subjectId) => {
      const response = await ApiClient.get(`/subjects/${subjectId}/exam-sections`);
      if (ApiClient.isMock()) {
        return { examSections: response.examSections.filter(es => es.subjectId === subjectId) };
      }
      return response;
    },

    /**
     * Fetch questions for a specific exam section
     * Endpoint: GET /api/exam-sections/:sectionId/questions
     */
    getQuestions: async (sectionId) => {
      const response = await ApiClient.get(`/exam-sections/${sectionId}/questions`);
      if (ApiClient.isMock()) {
        return { questions: response.questions.filter(q => q.sectionId === sectionId) };
      }
      return response;
    },

    /**
     * Submit exam answers
     * Endpoint: POST /api/exam-sections/:sectionId/submit
     */
    submitExam: async (sectionId, answers) => {
      if (ApiClient.isMock()) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, message: 'تم التسليم بنجاح' };
      }
      return ApiClient.post(`/exam-sections/${sectionId}/submit`, { answers });
    }
  };
})();
