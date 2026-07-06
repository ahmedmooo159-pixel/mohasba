/**
 * config.js — Environment configuration
 * منصة محاسبتك
 *
 * ⚙️ عشان تشغّل الـ API الحقيقي:
 *   غيّر USE_MOCK إلى false — بس كده خلاص.
 */

const AppConfig = Object.freeze({
  // ─── Toggle ──────────────────────────────────────────────
  USE_MOCK: false,   // ✅ LIVE MODE — Railway backend

  // ─── Backend ─────────────────────────────────────────────
  BACKEND_BASE_URL: 'https://nodejsapi-production-055c.up.railway.app/api',

  // ─── Token Storage Keys ───────────────────────────────────
  AUTH_TOKEN_KEY: 'auth_token',
  STUDENT_ID_KEY: 'student_id',

  // ─── Request defaults ─────────────────────────────────────
  TIMEOUT_MS: 12000,
  MOCK_LATENCY_MS: [150, 300],
});
