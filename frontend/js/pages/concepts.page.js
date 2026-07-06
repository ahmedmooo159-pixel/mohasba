/**
 * concepts.page.js — Logic and DOM manipulation for the Concepts page
 * Sprint 4 | منصة محاسبتك
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const conceptsContainer = document.getElementById('conceptsContainer');

  /**
   * Show dynamic skeleton loader while loading concepts
   */
  function renderSkeletons() {
    if (!conceptsContainer) return;
    conceptsContainer.innerHTML = Array(3).fill(0).map(() => `
      <div class="concept-card" style="opacity: 0.7;">
        <div class="skeleton" style="width: 150px; height: 24px; margin-bottom: var(--space-3);"></div>
        <div class="skeleton" style="width: 100%; height: 16px; margin-bottom: var(--space-2);"></div>
        <div class="skeleton" style="width: 80%; height: 16px;"></div>
      </div>
    `).join('');
  }

  /**
   * Render actual concept cards
   */
  function renderConcepts(concepts) {
    if (!conceptsContainer) return;

    if (!concepts || concepts.length === 0) {
      conceptsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📚</div>
          <p class="empty-state-text">لا توجد مصطلحات أو تعريفات مسجلة في هذا الشابتر حتى الآن.</p>
        </div>
      `;
      return;
    }

    conceptsContainer.innerHTML = `
      <div class="concepts-container">
        ${concepts.map(concept => `
          <div class="concept-card">
            <div class="concept-header">
              <div class="concept-term">${concept.term}</div>
              <div class="concept-category">${concept.category}</div>
            </div>
            <div class="concept-definition">${concept.definition}</div>
            ${concept.example ? `
              <div class="concept-example">
                <strong>مثال:</strong> ${concept.example}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Handle the event when a new chapter is selected from the Sidebar
   */
  async function onChapterChanged(chapterId) {
    if (!chapterId) {
      if (conceptsContainer) conceptsContainer.innerHTML = `
        <div class="empty-state">
          <p class="empty-state-text">اختر مادة وشابتر لعرض المصطلحات الخاصة بهما.</p>
        </div>
      `;
      return;
    }

    renderSkeletons();

    try {
      const data = await SubjectsApi.getConcepts(chapterId);
      renderConcepts(data.concepts);
    } catch (err) {
      console.error("Failed to load concepts:", err);
      if (conceptsContainer) {
        conceptsContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon" style="color: var(--color-error);">⚠️</div>
            <p class="empty-state-text">عذراً، حدث خطأ أثناء تحميل المصطلحات.</p>
          </div>
        `;
      }
    }
  }

  // Initialize the reusable Subject/Chapter selector
  SubjectSelector.init({
    subjectsContainerId: 'subjectListContainer',
    chaptersContainerId: 'chapterListContainer',
    onChapterSelect: onChapterChanged
  });

});
