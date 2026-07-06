/**
 * authGuard.js — Route protection for authenticated pages
 * منصة محاسبتك
 *
 * يُضاف هذا الملف كأول script في أي صفحة تحتاج مصادقة.
 * إذا لم يكن هناك توكن صالح، يُعاد توجيه المستخدم لصفحة تسجيل الدخول فوراً.
 */

(function () {
  'use strict';

  const TOKEN_KEY = 'auth_token';

  const token =
    localStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem(TOKEN_KEY);

  if (!token) {
    // Determine correct path to login page based on current directory depth
    const path = window.location.pathname.replace(/\\/g, '/');
    const isInSubfolder = path.includes('/pages/') || path.split('/').length > 3;
    const loginUrl = isInSubfolder ? '../pages/login.html' : 'pages/login.html';
    window.location.replace(loginUrl);
  }
})();
