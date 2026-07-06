/**
 * dashboard.page.js — Logic and DOM manipulation for the Dashboard page
 * Sprint 3 | منصة محاسبتك
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ─── Auth Guard ───────────────────────────────────────────────────────────────
  // Redirect to login if no token present
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Use the real student ID saved during login / register
  const STUDENT_ID = localStorage.getItem('student_id') || sessionStorage.getItem('student_id') || '';
  
  // DOM Elements
  const heroContainer = document.getElementById('dashboardHeroContainer');
  const statsContainer = document.getElementById('dashboardStatsContainer');
  const activityContainer = document.getElementById('dashboardActivityContainer');
  const progressContainer = document.getElementById('dashboardProgressContainer');

  /**
   * Show dynamic skeleton loader while loading data
   */
  function renderSkeletons() {
    // Stats skeletons
    if (statsContainer) {
      statsContainer.innerHTML = Array(4).fill(0).map(() => `
        <div class="stat-card" style="opacity: 0.7;">
          <div class="stat-card-header">
            <div class="skeleton" style="width: 100px; height: 16px;"></div>
            <div class="skeleton" style="width: 40px; height: 40px; border-radius: var(--radius-md);"></div>
          </div>
          <div class="skeleton" style="width: 80px; height: 32px; margin-bottom: var(--space-2);"></div>
          <div class="skeleton" style="width: 100%; height: 6px;"></div>
        </div>
      `).join('');
    }

    // Activity skeleton
    if (activityContainer) {
      activityContainer.innerHTML = `
        <div class="activity-list">
          ${Array(3).fill(0).map(() => `
            <div class="activity-item">
              <div class="skeleton" style="width: 44px; height: 44px; border-radius: var(--radius-full);"></div>
              <div class="activity-details">
                <div class="skeleton" style="width: 180px; height: 14px; margin-bottom: var(--space-2);"></div>
                <div class="skeleton" style="width: 80px; height: 10px;"></div>
              </div>
              <div class="skeleton" style="width: 40px; height: 20px; border-radius: var(--radius-full);"></div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Progress list skeleton
    if (progressContainer) {
      progressContainer.innerHTML = `
        <div class="subject-progress-list">
          ${Array(3).fill(0).map(() => `
            <div class="subject-progress-item">
              <div class="subject-progress-header">
                <div class="skeleton" style="width: 120px; height: 14px;"></div>
                <div class="skeleton" style="width: 30px; height: 14px;"></div>
              </div>
              <div class="skeleton" style="width: 100%; height: 8px; border-radius: var(--radius-full);"></div>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  /**
   * Display error message if API fails
   */
  function renderError(message) {
    const errorHTML = `
      <div class="dashboard-empty">
        <div class="dashboard-empty-icon" style="color: var(--color-error);">⚠️</div>
        <p>${message}</p>
        <button class="dashboard-hero-action" style="margin-top: var(--space-4);" onclick="window.location.reload()">إعادة المحاولة</button>
      </div>
    `;
    
    if (statsContainer) statsContainer.innerHTML = '';
    if (activityContainer) activityContainer.innerHTML = errorHTML;
    if (progressContainer) progressContainer.innerHTML = '';
  }

  /**
   * Populates the Student welcome Hero Section
   */
  function populateHero(student) {
    if (!heroContainer) return;
    
    // We determine next study path (concepts, videos, or exams based on progress)
    const nextLesson = student.nextLesson || { subject: 'المحاسبة المالية', chapter: 'الفصل الأول' };
    
    heroContainer.innerHTML = `
      <div class="dashboard-hero-content">
        <h2 class="dashboard-hero-title">أهلاً بك مجدداً، ${student.name} 👋</h2>
        <p class="dashboard-hero-subtitle">
          مستعد لاستكمال التعلم؟ الدرس القادم هو: <strong>${nextLesson.subject}</strong> — ${nextLesson.chapter}
        </p>
      </div>
      <a href="concepts.html" class="dashboard-hero-action" id="resumeLearningBtn">
        <span>استكمال التعلم</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
      </a>
    `;
  }

  /**
   * Populate Stats cards
   */
  function populateStats(stats) {
    if (!statsContainer) return;
    
    statsContainer.innerHTML = stats.map(stat => {
      // If stat is progress, draw progress line
      const hasProgress = stat.id === 'progress';
      const progressPercent = hasProgress ? parseInt(stat.value) : 0;
      
      return `
        <div class="stat-card" id="stat-card-${stat.id}">
          <div class="stat-card-header">
            <span class="stat-card-label">${stat.label}</span>
            <div class="stat-card-icon ${stat.color || 'primary'}">${stat.icon}</div>
          </div>
          <div>
            <div class="stat-card-value">${stat.value}</div>
            ${hasProgress ? `
              <div class="stat-card-progress" role="progressbar" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
                <div class="stat-card-progress-bar" style="width: 0%"></div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Trigger animation for progress bar width
    setTimeout(() => {
      const progressBar = statsContainer.querySelector('.stat-card-progress-bar');
      if (progressBar) {
        const progressVal = statsContainer.querySelector('.stat-card-progress').getAttribute('aria-valuenow');
        progressBar.style.width = `${progressVal}%`;
      }
    }, 50);
  }

  /**
   * Populate Recent Activity List
   */
  function populateActivity(activities) {
    if (!activityContainer) return;

    if (!activities || activities.length === 0) {
      activityContainer.innerHTML = `
        <div class="dashboard-empty">
          <div class="dashboard-empty-icon">📂</div>
          <p>لا توجد أنشطة مسجلة مؤخراً.</p>
        </div>
      `;
      return;
    }

    const activityIcons = {
      exam: '📝',
      video: '🎥',
      concept: '📚'
    };

    activityContainer.innerHTML = `
      <div class="activity-list">
        ${activities.map(act => `
          <div class="activity-item">
            <div class="activity-icon-container ${act.type || 'concept'}">
              ${activityIcons[act.type] || '📚'}
            </div>
            <div class="activity-details">
              <div class="activity-title" title="${act.title}">${act.title}</div>
              <div class="activity-time">${act.time}</div>
            </div>
            <span class="activity-badge ${act.statusClass || 'primary'}">${act.status}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Populate Weekly Progress Subject Bars
   */
  function populateProgress(subjects) {
    if (!progressContainer) return;

    if (!subjects || subjects.length === 0) {
      progressContainer.innerHTML = `
        <div class="dashboard-empty">
          <p>لا توجد بيانات تقدم للمواد.</p>
        </div>
      `;
      return;
    }

    progressContainer.innerHTML = `
      <div class="subject-progress-list">
        ${subjects.map((sub, index) => `
          <div class="subject-progress-item">
            <div class="subject-progress-header">
              <span class="subject-name">${sub.subject}</span>
              <span class="subject-percent ${sub.color || 'primary'}">${sub.percent}%</span>
            </div>
            <div class="subject-progress-bar-container">
              <div class="subject-progress-bar-fill ${sub.color || 'primary'}" id="subj-fill-${index}" style="width: 0%"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Trigger progressive animation of bars
    setTimeout(() => {
      subjects.forEach((sub, index) => {
        const fill = document.getElementById(`subj-fill-${index}`);
        if (fill) {
          fill.style.width = `${sub.percent}%`;
        }
      });
    }, 50);
  }

  /**
   * Main initializer function
   */
  async function loadDashboardData() {
    renderSkeletons();

    try {
      // Call student api service
      const data = await StudentApi.getDashboard(STUDENT_ID);
      
      // Store current user info in local storage for navigation shells to access
      if (typeof Storage !== 'undefined') {
        localStorage.setItem('student_name', data.student.name);
        localStorage.setItem('student_year', data.student.academicYear);
      }

      // Populate interface elements
      populateHero(data.student);
      populateStats(data.stats);
      populateActivity(data.recentActivity);
      populateProgress(data.weeklyProgress);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      renderError("عذراً، فشل تحميل بيانات لوحة التحكم. تأكد من اتصالك بالشبكة.");
    }
  }

  // Execute load
  loadDashboardData();
});
