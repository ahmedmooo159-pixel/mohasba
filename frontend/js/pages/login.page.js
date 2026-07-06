/**
 * login.page.js — Logic and DOM manipulation for the Login page
 * منصة محاسبتك
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');
  const submitBtn = document.getElementById('submitBtn');
  const errorMsg = document.getElementById('errorMsg');

  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    errorMsg.textContent = '';
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      errorMsg.textContent = 'يرجى إدخال البريد الإلكتروني وكلمة المرور';
      return;
    }

    // Set loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    try {
      const response = await AuthApi.login(email, password);

      // Handle both flat {token, user} and nested {data: {token, user}} responses
      const token = response.token || response.data?.token;
      const user  = response.user  || response.data?.user || response.data;

      if (typeof Storage !== 'undefined') {
        if (token) localStorage.setItem('auth_token', token);
        if (user) {
          localStorage.setItem('student_name', user.name || user.fullName || user.username || '');
          localStorage.setItem('student_year', user.academicYear || user.grade || user.year || '');
          localStorage.setItem('student_id',   user._id || user.id || '');
          localStorage.setItem('student_email', user.email || email);
          if (user.role) localStorage.setItem('student_role', user.role);
        }
      }

      // Redirect to dashboard
      window.location.href = 'dashboard.html';

    } catch (err) {
      console.error('Login error:', err);
      errorMsg.textContent = err.message || 'فشل تسجيل الدخول، يرجى المحاولة مرة أخرى.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  });
});
