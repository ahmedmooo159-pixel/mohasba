/**
 * subjectSelector.js — Reusable component for selecting a Subject and Chapter
 * Sprint 4 | منصة محاسبتك
 *
 * Usage:
 *   SubjectSelector.init({
 *     subjectsContainerId: 'subjectListContainer',
 *     chaptersContainerId: 'chapterListContainer',
 *     onChapterSelect: (chapterId) => { ... }
 *   });
 */

const SubjectSelector = (() => {
  'use strict';

  let config = {
    subjectsContainerId: null,
    chaptersContainerId: null,
    onChapterSelect: null
  };

  let state = {
    subjects: [],
    chapters: [],
    selectedSubjectId: null,
    selectedChapterId: null
  };

  /**
   * Fetch subjects and render them
   */
  async function loadSubjects() {
    try {
      const data = await SubjectsApi.getSubjects();
      state.subjects = data.subjects || [];
      
      // Auto-select first subject if none selected
      if (state.subjects.length > 0 && !state.selectedSubjectId) {
        state.selectedSubjectId = state.subjects[0].id;
      }
      
      renderSubjects();
      
      if (state.selectedSubjectId) {
        loadChapters(state.selectedSubjectId);
      }
    } catch (err) {
      console.error("Failed to load subjects:", err);
      renderError(config.subjectsContainerId, "فشل تحميل المواد.");
    }
  }

  /**
   * Fetch chapters for a given subject and render them
   */
  async function loadChapters(subjectId) {
    try {
      renderLoading(config.chaptersContainerId);
      const data = await SubjectsApi.getChapters(subjectId);
      state.chapters = data.chapters || [];
      
      // Auto-select first chapter
      if (state.chapters.length > 0) {
        state.selectedChapterId = state.chapters[0].id;
      } else {
        state.selectedChapterId = null;
      }
      
      renderChapters();
      
      // Notify parent page that a chapter is selected
      if (state.selectedChapterId && typeof config.onChapterSelect === 'function') {
        config.onChapterSelect(state.selectedChapterId);
      } else if (!state.selectedChapterId && typeof config.onChapterSelect === 'function') {
        config.onChapterSelect(null); // No chapters available
      }
    } catch (err) {
      console.error("Failed to load chapters:", err);
      renderError(config.chaptersContainerId, "فشل تحميل الشباتر.");
    }
  }

  /**
   * Render horizontal subjects list
   */
  function renderSubjects() {
    const container = document.getElementById(config.subjectsContainerId);
    if (!container) return;

    if (state.subjects.length === 0) {
      container.innerHTML = `<div class="empty-state-text">لا توجد مواد مسجلة.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="subject-list">
        ${state.subjects.map(subj => `
          <div class="subject-card ${subj.id === state.selectedSubjectId ? 'active' : ''}" 
               data-id="${subj.id}"
               role="button"
               tabindex="0"
               aria-pressed="${subj.id === state.selectedSubjectId}">
            <div class="subject-icon">${subj.icon}</div>
            <div class="subject-name">${subj.name}</div>
          </div>
        `).join('')}
      </div>
    `;

    // Bind events
    const cards = container.querySelectorAll('.subject-card');
    cards.forEach(card => {
      const id = card.getAttribute('data-id');
      card.addEventListener('click', () => handleSubjectClick(id));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSubjectClick(id);
        }
      });
    });
  }

  /**
   * Render vertical chapters list
   */
  function renderChapters() {
    const container = document.getElementById(config.chaptersContainerId);
    if (!container) return;

    if (state.chapters.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: var(--space-4);">
          <div class="empty-state-text">لا توجد شباتر متاحة لهذه المادة حتى الآن.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="chapter-list">
        ${state.chapters.map(chap => `
          <div class="chapter-item ${chap.id === state.selectedChapterId ? 'active' : ''}"
               data-id="${chap.id}"
               role="button"
               tabindex="0"
               aria-pressed="${chap.id === state.selectedChapterId}">
            <div class="chapter-title">${chap.title}</div>
            <div class="chapter-desc">${chap.description}</div>
          </div>
        `).join('')}
      </div>
    `;

    // Bind events
    const items = container.querySelectorAll('.chapter-item');
    items.forEach(item => {
      const id = item.getAttribute('data-id');
      item.addEventListener('click', () => handleChapterClick(id));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleChapterClick(id);
        }
      });
    });
  }

  /**
   * Handle subject selection
   */
  function handleSubjectClick(subjectId) {
    if (state.selectedSubjectId === subjectId) return; // Already selected
    
    state.selectedSubjectId = subjectId;
    renderSubjects(); // Update active UI
    loadChapters(subjectId);
  }

  /**
   * Handle chapter selection
   */
  function handleChapterClick(chapterId) {
    if (state.selectedChapterId === chapterId) return; // Already selected
    
    state.selectedChapterId = chapterId;
    renderChapters(); // Update active UI
    
    if (typeof config.onChapterSelect === 'function') {
      config.onChapterSelect(chapterId);
    }
  }

  /**
   * Helper: Render loading skeleton
   */
  function renderLoading(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
      <div class="skeleton" style="height: 60px; margin-bottom: var(--space-2); border-radius: var(--radius-md);"></div>
      <div class="skeleton" style="height: 60px; margin-bottom: var(--space-2); border-radius: var(--radius-md);"></div>
    `;
  }

  /**
   * Helper: Render error state
   */
  function renderError(containerId, msg) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `<div class="empty-state-text" style="color: var(--color-error);">${msg}</div>`;
  }

  /**
   * Public init function
   */
  function init(options) {
    config = { ...config, ...options };
    
    // Setup initial loading UI
    const sContainer = document.getElementById(config.subjectsContainerId);
    if (sContainer) {
      sContainer.innerHTML = `
        <div style="display:flex; gap:12px; overflow:hidden;">
          <div class="skeleton" style="width:140px; height:120px; border-radius:var(--radius-lg);"></div>
          <div class="skeleton" style="width:140px; height:120px; border-radius:var(--radius-lg);"></div>
        </div>
      `;
    }

    // Start data fetch
    loadSubjects();
  }

  return { init };
})();
