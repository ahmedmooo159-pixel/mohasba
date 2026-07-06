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

        // Save student data locally (until real backend)
        if (typeof Storage !== 'undefined') {
          const yearLabels = {
            '1': 'السنة الأولى',
            '2': 'السنة الثانية',
            '3': 'السنة الثالثة',
            '4': 'السنة الرابعة'
          };
          localStorage.setItem('auth_token',   'mock-jwt-token-' + Date.now());
          localStorage.setItem('student_name', name);
          localStorage.setItem('student_year', yearLabels[year] || `السنة ${year}`);
          localStorage.setItem('student_section', section);
          localStorage.setItem('student_id',   email.replace(/[^a-z0-9]/gi, '_'));
        }

        // Redirect to dashboard
        window.location.href = 'dashboard.html';
        return;
      }

      // Real API call
      const data = await ApiClient.post('/auth/register', { name, email, password, year, section });
      
      // Save user info if API returns it
      if (data.token) {
        localStorage.setItem('auth_token',   data.token);
      }
      if (data.user) {
        const yearLabels = {
          '1': 'السنة الأولى',
          '2': 'السنة الثانية',
          '3': 'السنة الثالثة',
          '4': 'السنة الرابعة'
        };
        localStorage.setItem('student_id',      data.user.id   || data.user._id || '');
        localStorage.setItem('student_name',    data.user.name || name);
        localStorage.setItem('student_year',    data.user.academicYear || yearLabels[year] || `السنة ${year}`);
        localStorage.setItem('student_section', data.user.section || section);
        window.location.href = 'dashboard.html';
      } else {
        // No user object returned — go to login
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
