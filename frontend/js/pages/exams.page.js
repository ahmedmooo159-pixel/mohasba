/**
 * exams.page.js — Logic for the Exams listing page
 * Sprint 6 | منصة محاسبتك
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const sectionsContainer = document.getElementById('examSectionsContainer');

  function renderSkeletons() {
    if (!sectionsContainer) return;
    sectionsContainer.innerHTML = `
      <div class="exam-sections-grid">
        ${Array(3).fill(0).map(() => `
          <div class="exam-section-card" style="opacity:0.6;pointer-events:none;">
            <div class="skeleton" style="width:100%;height:48px;margin-bottom:var(--space-3);border-radius:var(--radius-md)"></div>
            <div class="skeleton" style="width:60%;height:16px;margin-bottom:var(--space-2)"></div>
            <div class="skeleton" style="width:100%;height:36px;border-radius:var(--radius-md)"></div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderSections(sections) {
    if (!sectionsContainer) return;

    if (!sections || sections.length === 0) {
      sectionsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <p class="empty-state-text">لا توجد امتحانات متاحة لهذه المادة حتى الآن.</p>
        </div>
      `;
      return;
    }

    sectionsContainer.innerHTML = `
      <div class="exam-sections-grid">
        ${sections.map(section => `
          <div class="exam-section-card">
            <div class="exam-section-header">
              <div class="exam-section-icon">${section.icon}</div>
              <h3 class="exam-section-title">${section.title}</h3>
            </div>
            <div class="exam-section-meta">
              <span>📝 ${section.questionsCount} سؤال</span>
              <span>⏱ ${section.durationMinutes} دقيقة</span>
              <span>${section.type === 'theory' ? '📖 نظري' : '🧮 عملي'}</span>
            </div>
            <a href="exam-runner.html?sectionId=${section.id}"
               class="exam-start-btn">
              ابدأ الامتحان
            </a>
          </div>
        `).join('')}
      </div>
    `;
  }

  async function onSubjectChanged(subjectId) {
    if (!subjectId) {
      if (sectionsContainer) sectionsContainer.innerHTML = `
        <div class="empty-state">
          <p class="empty-state-text">اختر مادة لعرض الامتحانات المتاحة لها.</p>
        </div>
      `;
      return;
    }

    renderSkeletons();

    try {
      const data = await ExamsApi.getExamSections(subjectId);
      renderSections(data.examSections);
    } catch (err) {
      console.error("Failed to load exam sections:", err);
      if (sectionsContainer) {
        sectionsContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon" style="color:var(--color-error)">⚠️</div>
            <p class="empty-state-text">فشل تحميل الامتحانات.</p>
          </div>
        `;
      }
    }
  }

  // We use SubjectSelector but only need the subject level, not chapters.
  // So we pass onChapterSelect as null and use a custom subject callback.
  // We need a small adaptation: use the raw subjects API and render cards manually.

  async function init() {
    try {
      const data = await SubjectsApi.getSubjects();
      const subjects = data.subjects || [];

      const subjectContainer = document.getElementById('subjectListContainer');
      if (!subjectContainer || subjects.length === 0) return;

      let selectedId = subjects[0].id;

      function renderSubjectCards() {
        subjectContainer.innerHTML = `
          <div class="subject-list">
            ${subjects.map(s => `
              <div class="subject-card ${s.id === selectedId ? 'active' : ''}"
                   data-id="${s.id}" role="button" tabindex="0">
                <div class="subject-icon">${s.icon}</div>
                <div class="subject-name">${s.name}</div>
              </div>
            `).join('')}
          </div>
        `;

        subjectContainer.querySelectorAll('.subject-card').forEach(card => {
          const id = card.getAttribute('data-id');
          card.addEventListener('click', () => {
            if (id === selectedId) return;
            selectedId = id;
            renderSubjectCards();
            onSubjectChanged(id);
          });
        });
      }

      renderSubjectCards();
      onSubjectChanged(selectedId);

    } catch (err) {
      console.error("Failed to init exam page:", err);
    }
  }

  init();
});
