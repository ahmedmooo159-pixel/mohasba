/**
 * videos.page.js — Logic and DOM manipulation for the Videos page
 * Sprint 5 | منصة محاسبتك
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const videosContainer = document.getElementById('videosContainer');

  /**
   * Show dynamic skeleton loader while loading videos
   */
  function renderSkeletons() {
    if (!videosContainer) return;
    
    // Create skeleton grid
    videosContainer.innerHTML = `
      <div class="videos-grid">
        ${Array(3).fill(0).map(() => `
          <div class="video-card" style="opacity: 0.7;">
            <div class="skeleton" style="width: 100%; padding-top: 56.25%;"></div>
            <div class="video-info">
              <div class="skeleton" style="width: 100%; height: 20px; margin-bottom: var(--space-2);"></div>
              <div class="skeleton" style="width: 70%; height: 20px; margin-bottom: var(--space-4);"></div>
              <div style="display:flex; gap:10px; align-items:center;">
                <div class="skeleton" style="width: 24px; height: 24px; border-radius: var(--radius-full);"></div>
                <div class="skeleton" style="width: 100px; height: 14px;"></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render actual video cards
   */
  function renderVideos(videos) {
    if (!videosContainer) return;

    if (!videos || videos.length === 0) {
      videosContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🎥</div>
          <p class="empty-state-text">لا توجد فيديوهات مسجلة في هذا الشابتر حتى الآن.</p>
        </div>
      `;
      return;
    }

    videosContainer.innerHTML = `
      <div class="videos-grid">
        ${videos.map(video => `
          <div class="video-card">
            
            <a href="https://www.youtube.com/watch?v=${video.youtubeId}" target="_blank" class="video-thumbnail-container" aria-label="تشغيل فيديو: ${video.title}">
              <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail" loading="lazy" />
              <div class="video-duration">${video.duration}</div>
              <div class="video-play-overlay">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </a>

            <div class="video-info">
              <h3 class="video-title" title="${video.title}">${video.title}</h3>
              
              <div class="video-meta">
                <div class="video-instructor-icon" aria-hidden="true">${video.instructor.charAt(0)}</div>
                <span>${video.instructor}</span>
              </div>
              
              <a href="https://www.youtube.com/watch?v=${video.youtubeId}" target="_blank" class="video-action-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                متابعة المشاهدة
              </a>
            </div>

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
      if (videosContainer) videosContainer.innerHTML = `
        <div class="empty-state">
          <p class="empty-state-text">اختر مادة وشابتر لعرض الفيديوهات الخاصة بهما.</p>
        </div>
      `;
      return;
    }

    renderSkeletons();

    try {
      const data = await SubjectsApi.getVideos(chapterId);
      renderVideos(data.videos);
    } catch (err) {
      console.error("Failed to load videos:", err);
      if (videosContainer) {
        videosContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon" style="color: var(--color-error);">⚠️</div>
            <p class="empty-state-text">عذراً، حدث خطأ أثناء تحميل الفيديوهات.</p>
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
