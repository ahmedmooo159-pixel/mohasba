/**
 * apiClient.js — Unified HTTP wrapper
 * منصة محاسبتك — Sprint 9 (Production-Ready)
 *
 * ✅ يدعم Mock mode (التطوير المحلي)
 * ✅ يدعم Live API mode (بعد توصيل الباك اند)
 * ✅ إضافة Auth token تلقائياً في كل request
 * ✅ Timeout بعد TIMEOUT_MS لتجنب التعليق
 * ✅ Auto-logout لما الـ token ينتهي (401 Unauthorized)
 * ✅ Retry مرة واحدة عند فشل الشبكة (Network Error)
 *
 * للتبديل للـ API الحقيقي:
 *   افتح js/api/config.js وغيّر USE_MOCK إلى false
 *   وحدّث BACKEND_BASE_URL بالرابط الصحيح.
 */

const ApiClient = (() => {
  'use strict';

  // ─── Config ───────────────────────────────────────────────────────────────────
  // AppConfig is loaded from config.js — if not found fall back to safe defaults
  const cfg = (typeof AppConfig !== 'undefined')
    ? AppConfig
    : { USE_MOCK: true, BACKEND_BASE_URL: 'http://localhost:5000/api', AUTH_TOKEN_KEY: 'auth_token', TIMEOUT_MS: 10000, MOCK_LATENCY_MS: [150, 300] };

  const USE_MOCK        = cfg.USE_MOCK;
  const BASE_URL        = cfg.BACKEND_BASE_URL;
  const TOKEN_KEY       = cfg.AUTH_TOKEN_KEY;
  const TIMEOUT_MS      = cfg.TIMEOUT_MS;
  const [LAT_MIN, LAT_MAX] = cfg.MOCK_LATENCY_MS;

  // ─── Mock File Mapping ────────────────────────────────────────────────────────
  const MOCK_MAPPING = {
    '/students/dashboard':   'dashboard.json',
    '/subjects':             'subjects.json',
    '/subjects/chapters':    'chapters.json',
    '/chapters/concepts':    'concepts.json',
    '/chapters/videos':      'videos.json',
    '/subjects/exam-sections': 'exam-sections.json',
    '/exam-sections/questions': 'questions.json',
  };

  // Detect relative base path for local JSON files
  function getLocalBasePath() {
    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.includes('/pages/admin/')) return '../../data/';
    if (path.includes('/pages/'))       return '../data/';
    return 'data/';
  }

  // Normalize dynamic segments so mock mapping can match
  function normalizePath(endpoint) {
    let clean = endpoint.split('?')[0];
    clean = clean.replace(/\/students\/[a-zA-Z0-9_%-]+\/dashboard/,     '/students/dashboard');
    clean = clean.replace(/\/students\/[a-zA-Z0-9_%-]+\/attempts/,      '/students/attempts');
    clean = clean.replace(/\/subjects\/[a-zA-Z0-9_%-]+\/chapters/,      '/subjects/chapters');
    clean = clean.replace(/\/subjects\/[a-zA-Z0-9_%-]+\/exam-sections/, '/subjects/exam-sections');
    clean = clean.replace(/\/chapters\/[a-zA-Z0-9_%-]+\/concepts/,      '/chapters/concepts');
    clean = clean.replace(/\/chapters\/[a-zA-Z0-9_%-]+\/videos/,        '/chapters/videos');
    clean = clean.replace(/\/exam-sections\/[a-zA-Z0-9_%-]+\/questions/,'/exam-sections/questions');
    return clean;
  }

  // ─── Token Helpers ────────────────────────────────────────────────────────────
  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
  }

  function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('student_name');
    localStorage.removeItem('student_year');
    localStorage.removeItem('student_id');
    localStorage.removeItem('student_email');
    localStorage.removeItem('student_role');
    // Redirect to login only if not already there
    if (!window.location.pathname.includes('login')) {
      // Detect depth level: root=0, /pages/=1, /pages/admin/=2
      const path = window.location.pathname.replace(/\\/g, '/');
      let loginPath = 'pages/login.html';
      if (path.includes('/pages/admin/')) loginPath = '../../pages/login.html';
      else if (path.includes('/pages/'))  loginPath = '../pages/login.html';
      window.location.href = loginPath;
    }
  }

  // ─── Timeout Wrapper ─────────────────────────────────────────────────────────
  function withTimeout(promise, ms) {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
    );
    return Promise.race([promise, timeout]);
  }

  // ─── Core Request ─────────────────────────────────────────────────────────────
  async function request(endpoint, options = {}, retryOnNetworkError = true) {
    const method  = (options.method || 'GET').toUpperCase();
    const headers = { 'Content-Type': 'application/json', ...options.headers };

    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // ── MOCK MODE ──
    if (USE_MOCK) {
      const normalized = normalizePath(endpoint);
      const mockFile   = MOCK_MAPPING[normalized];

      if (!mockFile) {
        // POST/PUT/DELETE in mock mode: just acknowledge silently
        if (method !== 'GET') {
          await new Promise(r => setTimeout(r, LAT_MIN + Math.random() * (LAT_MAX - LAT_MIN)));
          return { success: true, message: 'Mock write acknowledged.' };
        }
        console.warn(`[ApiClient] No mock mapping for: ${endpoint} (${normalized})`);
        return Promise.reject(new Error(`Mock endpoint not mapped: ${endpoint}`));
      }

      const localPath = `${getLocalBasePath()}${mockFile}`;
      await new Promise(r => setTimeout(r, LAT_MIN + Math.random() * (LAT_MAX - LAT_MIN)));

      const res = await fetch(localPath);
      if (!res.ok) throw new Error(`Failed to load mock data: ${res.statusText}`);
      return res.json();
    }

    // ── LIVE API MODE ──
    const url          = `${BASE_URL}${endpoint}`;
    const fetchOptions = { method, headers };

    if (options.body) {
      fetchOptions.body = typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body);
    }

    try {
      const res = await withTimeout(fetch(url, fetchOptions), TIMEOUT_MS);

      // 401 → token expired or invalid
      if (res.status === 401) {
        clearAuth();
        throw new Error('انتهت جلستك. يرجى تسجيل الدخول مجدداً.');
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${res.status}: ${res.statusText}`);
      }

      // 204 No Content
      if (res.status === 204) return { success: true };

      return res.json();

    } catch (err) {
      // Retry once on network error (but not on HTTP errors or timeout)
      if (retryOnNetworkError && err.name === 'TypeError') {
        console.warn('[ApiClient] Network error — retrying once…');
        return request(endpoint, options, false);
      }
      console.error(`[ApiClient] ${method} ${url} →`, err.message);
      throw err;
    }
  }

  // ─── Auth helpers (Sprint 9 convenience) ──────────────────────────────────────
  function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  function logout() {
    clearAuth();
  }

  // ─── Public API ───────────────────────────────────────────────────────────────
  return {
    get:    (endpoint, opts = {})       => request(endpoint, { ...opts, method: 'GET' }),
    post:   (endpoint, body, opts = {}) => request(endpoint, { ...opts, method: 'POST',   body }),
    put:    (endpoint, body, opts = {}) => request(endpoint, { ...opts, method: 'PUT',    body }),
    patch:  (endpoint, body, opts = {}) => request(endpoint, { ...opts, method: 'PATCH',  body }),
    delete: (endpoint, opts = {})       => request(endpoint, { ...opts, method: 'DELETE' }),

    isMock:    () => USE_MOCK,
    saveToken,
    getToken,
    logout,
  };
})();
