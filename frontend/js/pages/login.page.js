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
      
      // Save token and user info
      if (typeof Storage !== 'undefined') {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('student_name', response.user.name);
        localStorage.setItem('student_year', response.user.academicYear);
        localStorage.setItem('student_id', response.user.id);
      }

      // Redirect to dashboard
      window.location.href = 'dashboard.html';
      
    } catch (err) {
      console.error('Login error:', err);
      errorMsg.textContent = err.message || 'فشل تسجيل الدخول، يرجى المحاولة مرة أخرى.';
    } finally {
      // Remove loading state
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  });
});
