/**
 * admin.js — Shared Admin Panel utilities
 * Sprint 7 | منصة محاسبتك
 *
 * - Auth guard (redirect to login if no admin token)
 * - Shared sidebar rendering
 * - Shared stat fetching helpers
 */

const Admin = (() => {
  'use strict';

  // =============================================
  // AUTH GUARD
  // =============================================
  function guard() {
    const token = sessionStorage.getItem('admin_token');
    if (!token) {
      window.location.href = 'admin-login.html';
      return false;
    }
    return true;
  }

  // =============================================
  // NAV ITEMS definition
  // =============================================
  const NAV = [
    {
      id: 'admin-dashboard',
      label: 'لوحة التحكم',
      href: 'admin-dashboard.html',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`
    },
    {
      id: 'admin-subjects',
      label: 'المواد الدراسية',
      href: 'admin-subjects.html',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`
    },
    {
      id: 'admin-questions',
      label: 'بنك الأسئلة',
      href: 'admin-questions.html',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`
    },
    {
      id: 'admin-students',
      label: 'الطلاب',
      href: 'admin-students.html',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`
    },
  ];

  // =============================================
  // RENDER SIDEBAR
  // =============================================
  function renderSidebar(activeId) {
    const adminName = sessionStorage.getItem('admin_name') || 'مسؤول النظام';

    const navHTML = NAV.map(item => `
      <a href="${item.href}" class="admin-nav-item ${item.id === activeId ? 'active' : ''}">
        ${item.icon}
        <span>${item.label}</span>
      </a>
    `).join('');

    const sidebarHTML = `
      <aside class="admin-sidebar" id="adminSidebar">
        <div class="admin-sidebar-header">
          <div class="admin-logo-mark">م</div>
          <div>
            <div class="admin-logo-text">محاسبتك</div>
            <div class="admin-logo-sub">لوحة المسؤول</div>
          </div>
        </div>

        <nav class="admin-sidebar-nav">
          <div class="admin-nav-section">الإدارة</div>
          ${navHTML}
        </nav>

        <div class="admin-sidebar-footer">
          <div class="admin-user-row">
            <div class="admin-user-avatar">م</div>
            <div>
              <div class="admin-user-name">${adminName}</div>
              <div class="admin-user-role">مسؤول النظام</div>
            </div>
          </div>
          <button onclick="Admin.logout()" style="margin-top:var(--space-3);width:100%;padding:var(--space-2);background:hsla(0,0%,100%,0.08);border:none;border-radius:var(--radius-md);color:hsla(0,0%,100%,0.6);font-size:var(--text-xs);cursor:pointer;font-family:inherit;">
            تسجيل الخروج
          </button>
        </div>
      </aside>
    `;

    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
  }

  // =============================================
  // LOGOUT
  // =============================================
  function logout() {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_name');
    window.location.href = 'admin-login.html';
  }

  return { guard, renderSidebar, logout };
})();
