/**
 * subjects.api.js — Subjects, Chapters, and Concepts API services
 */

const SubjectsApi = (() => {
  'use strict';

  return {
    /**
     * Fetch all available subjects
     * Endpoint: GET /api/subjects
     */
    getSubjects: async () => {
      return ApiClient.get('/subjects');
    },

    /**
     * Fetch chapters for a specific subject
     * Endpoint: GET /api/subjects/:subjectId/chapters
     */
    getChapters: async (subjectId) => {
      const response = await ApiClient.get(`/subjects/${subjectId}/chapters`);
      // In mock mode, we filter the mock json based on subjectId
      if (ApiClient.isMock()) {
        return { chapters: response.chapters.filter(ch => ch.subjectId === subjectId) };
      }
      return response;
    },

    /**
     * Fetch concepts for a specific chapter
     * Endpoint: GET /api/chapters/:chapterId/concepts
     */
    getConcepts: async (chapterId) => {
      const response = await ApiClient.get(`/chapters/${chapterId}/concepts`);
      // In mock mode, we filter the mock json based on chapterId
      if (ApiClient.isMock()) {
        return { concepts: response.concepts.filter(c => c.chapterId === chapterId) };
      }
      return response;
    },

    /**
     * Fetch videos for a specific chapter
     * Endpoint: GET /api/chapters/:chapterId/videos
     */
    getVideos: async (chapterId) => {
      const response = await ApiClient.get(`/chapters/${chapterId}/videos`);
      // In mock mode, we filter the mock json based on chapterId
      if (ApiClient.isMock()) {
        return { videos: response.videos.filter(v => v.chapterId === chapterId) };
      }
      return response;
    }
  };
})();
