/**
 * register.page.js — Logic for Student Registration page
 * منصة محاسبتك
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const registerForm = document.getElementById('registerForm');
  const submitBtn    = document.getElementById('submitBtn');
  const errorMsg     = document.getElementById('errorMsg');
  const passwordInput   = document.getElementById('passwordInput');
  const confirmPassInput = document.getElementById('confirmPasswordInput');

  if (!registerForm) return;

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = '';

    const name        = document.getElementById('nameInput').value.trim();
    const email       = document.getElementById('emailInput').value.trim();
    const password    = passwordInput.value.trim();
    const confirmPass = confirmPassInput.value.trim();
    const year        = document.getElementById('yearSelect').value;
    const section     = document.getElementById('sectionSelect').value;

    // --- Validation ---
    if (!name || !email || !password || !confirmPass || !year || !section) {
      errorMsg.textContent = 'يرجى ملء جميع الحقول المطلوبة.';
      return;
    }

    if (password.length < 6) {
      errorMsg.textContent = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.';
      return;
    }

    if (password !== confirmPass) {
      errorMsg.textContent = 'كلمة المرور وتأكيدها غير متطابقتين.';
      confirmPassInput.focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errorMsg.textContent = 'يرجى إدخال بريد إلكتروني صحيح.';
      return;
    }

    // --- Submit ---
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    try {
      // In mock mode: simulate register delay then redirect
      if (typeof ApiClient !== 'undefined' && ApiClient.isMock()) {
        await new Promise(resolve => setTimeout(resolve, 900));
        const yearLabels = { '1': 'السنة الأولى', '2': 'السنة الثانية', '3': 'السنة الثالثة', '4': 'السنة الرابعة' };
        localStorage.setItem('auth_token',       'mock-jwt-token-' + Date.now());
        localStorage.setItem('student_name',     name);
        localStorage.setItem('student_year',     yearLabels[year] || `السنة ${year}`);
        localStorage.setItem('student_section',  section);
        localStorage.setItem('student_id',       email.replace(/[^a-z0-9]/gi, '_'));
        window.location.href = 'dashboard.html';
        return;
      }

      // Real API call via AuthApi — handles field mapping & response normalisation
      const data = await AuthApi.register({ name, email, password, year, section, role: 'student' });

      const yearLabels = { '1': 'السنة الأولى', '2': 'السنة الثانية', '3': 'السنة الثالثة', '4': 'السنة الرابعة' };
      const user = data.user || {};

      if (data.token) {
        localStorage.setItem('auth_token',      data.token);
        localStorage.setItem('student_id',      user._id || user.id || '');
        localStorage.setItem('student_name',    user.name || name);
        localStorage.setItem('student_year',    user.academicYear || user.grade || yearLabels[year] || `السنة ${year}`);
        localStorage.setItem('student_section', user.section || section);
        window.location.href = 'dashboard.html';
      } else {
        // Registered but no token — go to login
        window.location.href = 'login.html';
      }

    } catch (err) {
      console.error('Register error:', err);
      errorMsg.textContent = err.message || 'فشل إنشاء الحساب، حاول مرة أخرى.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  });

  // Real-time password match indicator
  confirmPassInput.addEventListener('input', () => {
    if (confirmPassInput.value && confirmPassInput.value !== passwordInput.value) {
      confirmPassInput.style.borderColor = 'var(--color-error)';
    } else {
      confirmPassInput.style.borderColor = '';
    }
  });
});
