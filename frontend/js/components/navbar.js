/**
 * navbar.js — App Header + Bottom Navigation Component
 * Sprint 2 | منصة محاسبتك
 *
 * Usage (في أي صفحة داخلية):
 *   <script src="../js/components/navbar.js"></script>
 *   <script>Navbar.init({ pageId: 'dashboard' });</script>
 *
 * Options:
 *   pageId   {string} — 'dashboard' | 'concepts' | 'videos' | 'exams'
 *   basePath {string} — override path prefix (auto-detected if not passed)
 *
 * Dependencies (يجب تحميل CSS قبله):
 *   - css/base.css
 *   - css/layout.css
 */

const Navbar = (() => {
  'use strict';

  // =============================================
  // NAV ITEMS — نفس القائمة في sidebar وbottom-nav
  // =============================================
  const NAV_ITEMS = [
    {
      id: 'dashboard',
      label: 'الداشبورد',
      page: 'dashboard.html',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
               <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
             </svg>`,
    },
    {
      id: 'concepts',
      label: 'المصطلحات',
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
  // PATH AUTO-DETECTION
  // يكتشف مستوى الصفحة ويحدد الـ base path تلقائيًا
  // =============================================
  function autoBasePath() {
    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.includes('/pages/admin/')) return '../';  // admin pages
    if (path.includes('/pages/'))       return './';   // inner pages
    return 'pages/';                                   // frontend root
  }

  // =============================================
  // RENDER
  // =============================================
  function render({ pageId = '', basePath = null } = {}) {
    const base = basePath !== null ? basePath : autoBasePath();

    // Bottom Nav items
    const bottomNavHTML = NAV_ITEMS.map(item => {
      const active = item.id === pageId;
      return `<a href="${base}${item.page}"
                 class="bottom-nav-item${active ? ' active' : ''}"
                 data-page="${item.id}"
                 ${active ? 'aria-current="page"' : ''}>
                ${item.icon}
                <span>${item.label}</span>
              </a>`;
    }).join('');

    return `
      <!-- ===== APP HEADER ===== -->
      <header class="app-header" id="appHeader" role="banner">

        <!-- Hamburger (mobile only) -->
        <button class="header-menu-btn"
                id="sidebarToggleBtn"
                aria-label="فتح القائمة الجانبية"
                aria-expanded="false"
                aria-controls="appSidebar">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <!-- Logo (mobile) -->
        <a href="${base}dashboard.html" class="header-logo" aria-label="محاسبتك — الرئيسية">
          <div class="header-logo-mark" aria-hidden="true">م</div>
          <span class="header-logo-text">محاسبتك</span>
        </a>

        <!-- Search -->
        <div class="header-search" role="search">
          <svg class="header-search-icon"
               xmlns="http://www.w3.org/2000/svg"
               fill="none" viewBox="0 0 24 24"
               stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="search"
                 id="headerSearchInput"
                 class="header-search-input"
                 placeholder="ابحث في المنهج..."
                 aria-label="البحث في المنهج"
                 autocomplete="off" />
        </div>

        <!-- Right-side actions -->
        <div class="header-actions" role="group" aria-label="إجراءات الحساب">

          <!-- Notifications bell -->
          <button class="header-icon-btn"
                  id="notifBtn"
                  aria-label="الإشعارات (3 جديدة)"
                  title="الإشعارات">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <span class="notif-badge" aria-hidden="true"></span>
          </button>

          <!-- User avatar -->
          <button class="header-avatar-btn"
                  id="avatarBtn"
                  aria-label="الملف الشخصي"
                  title="أحمد محمود">
            أ
          </button>

        </div>
      </header>

      <!-- ===== BOTTOM NAVIGATION (mobile) ===== -->
      <nav class="bottom-nav"
           id="bottomNav"
           role="navigation"
           aria-label="التنقل الرئيسي">
        ${bottomNavHTML}
      </nav>
    `;
  }

  // =============================================
  // EVENTS
  // =============================================
  function bindEvents() {
    // Hamburger — delegates to Sidebar.toggle() if Sidebar is loaded
    const menuBtn = document.getElementById('sidebarToggleBtn');
    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        if (typeof Sidebar !== 'undefined' && typeof Sidebar.toggle === 'function') {
          const nowOpen = Sidebar.toggle();
          menuBtn.setAttribute('aria-expanded', String(nowOpen));
        }
      });
    }
  }

  // =============================================
  // PUBLIC API
  // =============================================
  function init(options = {}) {
    document.body.insertAdjacentHTML('afterbegin', render(options));
    bindEvents();
  }

  return { init };

})();
