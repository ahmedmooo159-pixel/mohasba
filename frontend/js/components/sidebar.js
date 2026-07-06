/**
 * sidebar.js — App Sidebar Component
 * Sprint 2 | منصة محاسبتك
 *
 * Usage (في أي صفحة داخلية):
 *   <script src="../js/components/sidebar.js"></script>
 *   <script>Sidebar.init({ pageId: 'dashboard' });</script>
 *
 * Options:
 *   pageId   {string} — 'dashboard' | 'concepts' | 'videos' | 'exams'
 *   basePath {string} — override path prefix (auto-detected if not passed)
 *   userName {string} — اسم الطالب (default: 'أحمد محمود')
 *   userYear {string} — السنة الدراسية (default: 'السنة الثانية')
 *
 * Public API:
 *   Sidebar.init(options)  — inject sidebar into DOM
 *   Sidebar.open()         — show sidebar drawer (mobile)
 *   Sidebar.close()        — hide sidebar drawer (mobile)
 *   Sidebar.toggle()       — toggle; returns true if now open
 *
 * Dependencies (يجب تحميل CSS قبله):
 *   - css/base.css
 *   - css/layout.css
 */

const Sidebar = (() => {
  'use strict';

  // =============================================
  // NAV ITEMS — مطابقة تمامًا لـ Navbar
  // =============================================
  const NAV_ITEMS = [
    {
      id: 'dashboard',
      label: 'الصفحة الرئيسية',
      page: 'dashboard.html',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
               <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
             </svg>`,
    },
    {
      id: 'concepts',
      label: 'المصطلحات والتعريفات',
      page: 'concepts.html',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
               <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
             </svg>`,
    },
    {
      id: 'videos',
      label: 'الفيديوهات',
      page: 'videos.html',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
               <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
               <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
             </svg>`,
    },
    {
      id: 'exams',
      label: 'الامتحانات',
      page: 'exams.html',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
               <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
             </svg>`,
    },
  ];

  // =============================================
  // STATE
  // =============================================
  let _isOpen = false;

  // =============================================
  // PATH AUTO-DETECTION
  // =============================================
  function autoBasePath() {
    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.includes('/pages/admin/')) return '../';
    if (path.includes('/pages/'))       return './';
    return 'pages/';
  }

  // =============================================
  // RENDER
  // =============================================
  function render({
    pageId   = '',
    basePath = null,
    userName = 'أحمد محمود',
    userYear = 'السنة الثانية',
  } = {}) {
    const base = basePath !== null ? basePath : autoBasePath();
    const initials = userName ? userName.trim().charAt(0) : 'أ';

    const navItemsHTML = NAV_ITEMS.map(item => {
      const active = item.id === pageId;
      return `<a href="${base}${item.page}"
                 class="sidebar-nav-item${active ? ' active' : ''}"
                 data-page="${item.id}"
                 ${active ? 'aria-current="page"' : ''}>
                ${item.icon}
                <span>${item.label}</span>
              </a>`;
    }).join('\n');

    return `
      <!-- ===== APP SIDEBAR ===== -->
      <aside class="app-sidebar"
             id="appSidebar"
             role="navigation"
             aria-label="القائمة الجانبية"
             aria-hidden="true">

        <!-- Logo -->
        <a href="${base}dashboard.html" class="sidebar-header" aria-label="محاسبتك — الرئيسية">
          <div class="sidebar-logo-mark" aria-hidden="true">م</div>
          <div>
            <div class="sidebar-logo-text">محاسبتك</div>
            <div class="sidebar-logo-sub">كلية التجارة — حسابات</div>
          </div>
        </a>

        <!-- Main Navigation -->
        <nav class="sidebar-nav" aria-label="روابط التنقل الرئيسية">
          <div class="sidebar-nav-section-label" aria-hidden="true">القائمة</div>
          ${navItemsHTML}
        </nav>

        <!-- User Footer -->
        <div class="sidebar-footer">
          <div class="sidebar-user" id="sidebarUserBtn" role="button" tabindex="0" aria-label="الملف الشخصي لـ ${userName}">
            <div class="sidebar-user-avatar" aria-hidden="true">${initials}</div>
            <div class="sidebar-user-info">
              <div class="sidebar-user-name">${userName}</div>
              <div class="sidebar-user-year">${userYear}</div>
            </div>
            <div class="sidebar-logout-btn"
                 id="logoutBtn"
                 role="button"
                 tabindex="0"
                 title="تسجيل الخروج"
                 aria-label="تسجيل الخروج">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </div>
          </div>
        </div>
      </aside>

      <!-- Overlay (mobile drawer backdrop) -->
      <div class="sidebar-overlay" id="sidebarOverlay" aria-hidden="true"></div>
    `;
  }

  // =============================================
  // MOBILE DRAWER SHOW / HIDE
  // =============================================
  function applyMobileStyles(sidebar) {
    // Apply mobile drawer CSS that can't be in the stylesheet because it overrides .app-sidebar display:none
    Object.assign(sidebar.style, {
      display:    'flex',
      flexDirection: 'column',
      position:   'fixed',
      top:        '0',
      right:      '0',
      width:      'var(--sidebar-width)',
      height:     '100vh',
      background: 'var(--color-sidebar-bg)',
      transform:  'translateX(100%)',
      opacity:    '0',
      transition: `transform var(--transition-base), opacity var(--transition-base)`,
      zIndex:     'var(--z-modal)',
      overflowY:  'auto',
    });
  }

  function open() {
    if (_isOpen) return true;
    _isOpen = true;

    const sidebar = document.getElementById('appSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!sidebar) return _isOpen;

    sidebar.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      sidebar.style.transform = 'translateX(0)';
      sidebar.style.opacity   = '1';
    });
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    return _isOpen;
  }

  function close() {
    if (!_isOpen) return false;
    _isOpen = false;

    const sidebar = document.getElementById('appSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!sidebar) return _isOpen;

    sidebar.style.transform = 'translateX(100%)';
    sidebar.style.opacity   = '0';
    sidebar.setAttribute('aria-hidden', 'true');

    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
    return _isOpen;
  }

  function toggle() {
    return _isOpen ? close() : open();
  }

  // =============================================
  // EVENTS
  // =============================================
  function bindEvents() {
    // Close on overlay click
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) overlay.addEventListener('click', close);

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && _isOpen) close();
    });

    // On resize to desktop: close drawer + reset styles
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024 && _isOpen) {
        close();
        // Reset inline drawer styles so CSS takes over
        const sidebar = document.getElementById('appSidebar');
        if (sidebar) sidebar.removeAttribute('style');
      }
    });

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      const doLogout = () => {
        // تُنفَّذ لاحقًا في Sprint 9 عند ربط الباك اند
        if (typeof Storage !== 'undefined') {
          sessionStorage.clear();
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
        window.location.href = autoBasePath() === './' ? '../pages/login.html' : 'pages/login.html';
      };
      logoutBtn.addEventListener('click', doLogout);
      logoutBtn.addEventListener('keydown', e => { if (e.key === 'Enter') doLogout(); });
    }
  }

  // =============================================
  // PUBLIC API
  // =============================================
  function init(options = {}) {
    // Inject sidebar HTML at end of body
    document.body.insertAdjacentHTML('beforeend', render(options));

    // On mobile: apply drawer initial styles
    if (window.innerWidth < 1024) {
      const sidebar = document.getElementById('appSidebar');
      if (sidebar) applyMobileStyles(sidebar);
    }

    bindEvents();
  }

  return { init, open, close, toggle };

})();
