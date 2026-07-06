/**
 * subjects.api.js — Subjects (Courses), Chapters, Concepts & Videos API services
 * منصة محاسبتك
 *
 * ⚠️ NOTE: The Railway backend uses /courses instead of /subjects
 *   Live:  GET /api/courses           → list of subjects/courses
 *   Live:  GET /api/courses/:id       → single course detail
 *   Mock:  reads from local subjects.json
 */

const SubjectsApi = (() => {
  'use strict';

  return {
    /**
     * Fetch all available subjects/courses
     * Live Endpoint: GET /api/courses
     * Mock Endpoint: local subjects.json
     */
    getSubjects: async () => {
      if (ApiClient.isMock()) {
        return ApiClient.get('/subjects');
      }
      // Live backend uses /courses
      const resp = await ApiClient.get('/courses');
      // Normalize: backend returns { status, data: { courses: [...] } }
      // We expose it as { subjects: [...] } to keep frontend code unchanged
      const courses = resp?.data?.courses || resp?.courses || resp?.data || [];
      return {
        subjects: courses.map(c => ({
          _id:         c._id,
          id:          c._id,
          name:        c.title || c.name || 'غير محدد',
          title:       c.title || c.name || 'غير محدد',
          icon:        c.icon  || '📚',
          color:       c.color || '#7c3aed',
          description: c.description || '',
          price:       c.price,
          // keep original fields too
          ...c,
        }))
      };
    },

    /**
     * Fetch chapters for a specific subject/course
     * Live Endpoint: GET /api/courses/:courseId/chapters  (TBD by backend)
     * Mock Endpoint: local chapters.json filtered by subjectId
     */
    getChapters: async (subjectId) => {
      if (ApiClient.isMock()) {
        const response = await ApiClient.get(`/subjects/${subjectId}/chapters`);
        return { chapters: response.chapters.filter(ch => ch.subjectId === subjectId) };
      }
      // Try the live endpoint — backend may not have chapters yet
      try {
        const resp = await ApiClient.get(`/courses/${subjectId}/chapters`);
        const chapters = resp?.data?.chapters || resp?.chapters || resp?.data || [];
        return { chapters };
      } catch (err) {
        console.warn('[SubjectsApi] /courses/:id/chapters not available yet:', err.message);
        return { chapters: [] };
      }
    },

    /**
     * Fetch concepts for a specific chapter
     * Live Endpoint: GET /api/chapters/:chapterId/concepts  (TBD by backend)
     * Mock Endpoint: local concepts.json filtered by chapterId
     */
    getConcepts: async (chapterId) => {
      if (ApiClient.isMock()) {
        const response = await ApiClient.get(`/chapters/${chapterId}/concepts`);
        return { concepts: response.concepts.filter(c => c.chapterId === chapterId) };
      }
      try {
        const resp = await ApiClient.get(`/chapters/${chapterId}/concepts`);
        const concepts = resp?.data?.concepts || resp?.concepts || resp?.data || [];
        return { concepts };
      } catch (err) {
        console.warn('[SubjectsApi] /chapters/:id/concepts not available yet:', err.message);
        return { concepts: [] };
      }
    },

    /**
     * Fetch videos for a specific chapter
     * Live Endpoint: GET /api/chapters/:chapterId/videos  (TBD by backend)
     * Mock Endpoint: local videos.json filtered by chapterId
     */
    getVideos: async (chapterId) => {
      if (ApiClient.isMock()) {
        const response = await ApiClient.get(`/chapters/${chapterId}/videos`);
        return { videos: response.videos.filter(v => v.chapterId === chapterId) };
      }
      try {
        const resp = await ApiClient.get(`/chapters/${chapterId}/videos`);
        const videos = resp?.data?.videos || resp?.videos || resp?.data || [];
        return { videos };
      } catch (err) {
        console.warn('[SubjectsApi] /chapters/:id/videos not available yet:', err.message);
        return { videos: [] };
      }
    }
  };
})();
