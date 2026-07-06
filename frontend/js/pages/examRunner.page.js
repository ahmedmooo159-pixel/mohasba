/**
 * examRunner.page.js — The core exam-taking engine
 * Sprint 6 | منصة محاسبتك
 *
 * Features:
 *   - Question-by-question navigation
 *   - MCQ and True/False support
 *   - Countdown timer with warning/danger states
 *   - Auto-save answers to localStorage on every interaction
 *   - Recovers saved answers on page reload (crash protection)
 *   - Submit and show results with full review
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==================================
  // Parse URL params
  // ==================================
  const params = new URLSearchParams(window.location.search);
  const sectionId = params.get('sectionId');

  if (!sectionId) {
    document.getElementById('examRunnerApp').innerHTML = `
      <div class="empty-state" style="min-height:60vh">
        <div class="empty-state-icon">⚠️</div>
        <p class="empty-state-text">لم يتم تحديد الامتحان. يرجى العودة لصفحة الامتحانات واختيار امتحان.</p>
        <a href="exams.html" class="runner-btn primary" style="margin-top:var(--space-4)">العودة للامتحانات</a>
      </div>
    `;
    return;
  }

  // ==================================
  // State
  // ==================================
  const STORAGE_KEY = `exam_${sectionId}`;

  let examData = null;     // { sectionId, title, durationMinutes, questions[] }
  let questions = [];
  let currentIndex = 0;
  let answers = {};        // { questionId: answer }
  let timer = null;
  let examSubmitted = false;

  // DOM
  const app = document.getElementById('examRunnerApp');

  // ==================================
  // LocalStorage helpers (Auto-save)
  // ==================================
  function saveState() {
    const state = {
      sectionId,
      currentIndex,
      answers,
      remainingSeconds: timer ? timer.getRemaining() : 0,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const state = JSON.parse(raw);
      // Expire after 24 hours
      if (Date.now() - state.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return state;
    } catch { return null; }
  }

  function clearState() {
    localStorage.removeItem(STORAGE_KEY);
  }

  // ==================================
  // Render: Exam Runner UI
  // ==================================
  function renderRunner() {
    const q = questions[currentIndex];
    const totalQuestions = questions.length;
    const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;
    const isLast = currentIndex === totalQuestions - 1;
    const isFirst = currentIndex === 0;

    app.innerHTML = `
      <!-- HEADER -->
      <div class="runner-header">
        <div class="runner-exam-title">${examData.title || 'امتحان'}</div>
        <div class="runner-timer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span id="timerDisplay">--:--</span>
        </div>
      </div>

      <!-- PROGRESS -->
      <div class="runner-progress">
        <div class="runner-progress-bar">
          <div class="runner-progress-fill" style="width:${progressPercent}%"></div>
        </div>
        <div class="runner-progress-text">${currentIndex + 1} / ${totalQuestions}</div>
      </div>

      <!-- QUESTION -->
      <div class="question-card">
        <div class="question-number">السؤال ${currentIndex + 1}</div>
        <span class="question-type-badge ${q.type}">${q.type === 'mcq' ? 'اختيار من متعدد' : 'صح أو خطأ'}</span>
        <div class="question-text">${q.text}</div>

        ${q.type === 'mcq' ? renderMCQ(q) : renderTrueFalse(q)}
      </div>

      <!-- NAVIGATION -->
      <div class="runner-nav">
        <button class="runner-btn" id="prevBtn" ${isFirst ? 'disabled' : ''}>
          ← السابق
        </button>
        ${isLast ? `
          <button class="runner-btn submit" id="submitBtn">
            تسليم الامتحان ✓
          </button>
        ` : `
          <button class="runner-btn primary" id="nextBtn">
            التالي →
          </button>
        `}
      </div>
    `;

    // Start/resume timer
    if (timer) timer.render();

    bindRunnerEvents(q, isLast);
  }

  function renderMCQ(q) {
    const selected = answers[q.id];
    return `
      <ul class="options-list">
        ${q.options.map((opt, i) => `
          <li class="option-item ${selected === i ? 'selected' : ''}" data-index="${i}">
            <div class="option-radio"></div>
            <span class="option-text">${opt}</span>
          </li>
        `).join('')}
      </ul>
    `;
  }

  function renderTrueFalse(q) {
    const selected = answers[q.id];
    return `
      <div class="tf-options">
        <button class="tf-btn ${selected === true ? 'selected' : ''}" data-value="true">✓ صح</button>
        <button class="tf-btn ${selected === false ? 'selected' : ''}" data-value="false">✗ خطأ</button>
      </div>
    `;
  }

  // ==================================
  // Bind Events
  // ==================================
  function bindRunnerEvents(q, isLast) {
    // MCQ options
    if (q.type === 'mcq') {
      document.querySelectorAll('.option-item').forEach(item => {
        item.addEventListener('click', () => {
          const idx = parseInt(item.getAttribute('data-index'));
          answers[q.id] = idx;
          saveState();
          // Update UI
          document.querySelectorAll('.option-item').forEach(o => o.classList.remove('selected'));
          item.classList.add('selected');
        });
      });
    }

    // True/False
    if (q.type === 'true_false') {
      document.querySelectorAll('.tf-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = btn.getAttribute('data-value') === 'true';
          answers[q.id] = val;
          saveState();
          document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        });
      });
    }

    // Prev
    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        saveState();
        renderRunner();
      }
    });

    // Next
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) nextBtn.addEventListener('click', () => {
      if (currentIndex < questions.length - 1) {
        currentIndex++;
        saveState();
        renderRunner();
      }
    });

    // Submit
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) submitBtn.addEventListener('click', () => {
      const unanswered = questions.filter(q => answers[q.id] === undefined).length;
      let msg = 'هل أنت متأكد من تسليم الامتحان؟';
      if (unanswered > 0) {
        msg = `لديك ${unanswered} سؤال/أسئلة لم تُجب عليها بعد.\n\nهل تريد التسليم على أي حال؟`;
      }
      if (confirm(msg)) {
        submitExam();
      }
    });
  }

  // ==================================
  // Submit & Results
  // ==================================
  function submitExam() {
    if (examSubmitted) return;
    examSubmitted = true;
    if (timer) timer.stop();
    clearState();

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;

    const reviewData = questions.map(q => {
      totalPoints += q.points;
      const userAnswer = answers[q.id];
      let isCorrect = false;
      let isSkipped = userAnswer === undefined;

      if (!isSkipped) {
        isCorrect = userAnswer === q.correctAnswer;
        if (isCorrect) {
          earnedPoints += q.points;
          correctCount++;
        } else {
          incorrectCount++;
        }
      } else {
        skippedCount++;
      }

      return { ...q, userAnswer, isCorrect, isSkipped };
    });

    const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = scorePercent >= 50;

    renderResults({ scorePercent, passed, correctCount, incorrectCount, skippedCount, totalPoints, earnedPoints, reviewData });
  }

  function renderResults(data) {
    app.innerHTML = `
      <div class="results-container">
        <!-- Hero Score -->
        <div class="results-hero">
          <div class="results-score-circle ${data.passed ? 'pass' : 'fail'}">
            ${data.scorePercent}%
          </div>
          <h2 class="results-title">${data.passed ? '🎉 أحسنت! نجحت في الامتحان' : '😔 للأسف لم تجتز هذه المرة'}</h2>
          <p class="results-subtitle">${data.passed ? 'استمر في التفوق!' : 'لا تقلق، راجع الأسئلة وحاول مرة أخرى.'}</p>
          
          <div class="results-stats">
            <div class="results-stat">
              <div class="results-stat-value" style="color:var(--color-success-600)">${data.correctCount}</div>
              <div class="results-stat-label">إجابة صحيحة</div>
            </div>
            <div class="results-stat">
              <div class="results-stat-value" style="color:var(--color-error-600)">${data.incorrectCount}</div>
              <div class="results-stat-label">إجابة خاطئة</div>
            </div>
            <div class="results-stat">
              <div class="results-stat-value" style="color:var(--color-text-muted)">${data.skippedCount}</div>
              <div class="results-stat-label">لم يُجب</div>
            </div>
            <div class="results-stat">
              <div class="results-stat-value" style="color:var(--color-primary)">${data.earnedPoints}/${data.totalPoints}</div>
              <div class="results-stat-label">الدرجة</div>
            </div>
          </div>

          <div class="results-actions">
            <a href="exams.html" class="runner-btn">العودة للامتحانات</a>
            <a href="exam-runner.html?sectionId=${sectionId}" class="runner-btn primary">إعادة المحاولة</a>
          </div>
        </div>

        <!-- Review -->
        <h3 class="results-review-title">مراجعة الأسئلة</h3>
        ${data.reviewData.map((q, i) => renderReviewQuestion(q, i)).join('')}
      </div>
    `;
  }

  function renderReviewQuestion(q, index) {
    const badge = q.isSkipped
      ? '<span class="review-result-badge skipped">لم يُجب</span>'
      : q.isCorrect
        ? '<span class="review-result-badge correct">✓ صحيح</span>'
        : '<span class="review-result-badge incorrect">✗ خطأ</span>';

    let answerDetails = '';

    if (q.type === 'mcq') {
      answerDetails = `
        <ul class="options-list" style="pointer-events:none;">
          ${q.options.map((opt, i) => {
            let cls = '';
            if (i === q.correctAnswer) cls = 'correct';
            else if (i === q.userAnswer && !q.isCorrect) cls = 'incorrect';
            return `<li class="option-item ${cls} ${i === q.userAnswer ? 'selected' : ''}">
              <div class="option-radio"></div>
              <span class="option-text">${opt}</span>
            </li>`;
          }).join('')}
        </ul>
      `;
    } else {
      const correctLabel = q.correctAnswer ? 'صح' : 'خطأ';
      const userLabel = q.isSkipped ? '—' : (q.userAnswer ? 'صح' : 'خطأ');
      answerDetails = `
        <div class="tf-options" style="pointer-events:none;">
          <div class="tf-btn ${q.correctAnswer === true ? 'correct' : ''} ${q.userAnswer === true && !q.isCorrect ? 'incorrect' : ''} ${q.userAnswer === true ? 'selected' : ''}">✓ صح</div>
          <div class="tf-btn ${q.correctAnswer === false ? 'correct' : ''} ${q.userAnswer === false && !q.isCorrect ? 'incorrect' : ''} ${q.userAnswer === false ? 'selected' : ''}">✗ خطأ</div>
        </div>
      `;
    }

    return `
      <div class="review-question">
        <div class="review-question-header">
          <span class="question-number" style="margin:0">السؤال ${index + 1}</span>
          ${badge}
        </div>
        <div class="question-text" style="font-size:var(--text-base);margin-bottom:var(--space-4)">${q.text}</div>
        ${answerDetails}
      </div>
    `;
  }

  // ==================================
  // Init: Load data
  // ==================================
  async function init() {
    app.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:var(--space-4);">
        <div class="skeleton" style="width:100%;max-width:600px;height:60px;border-radius:var(--radius-lg)"></div>
        <div class="skeleton" style="width:100%;max-width:600px;height:300px;border-radius:var(--radius-lg)"></div>
      </div>
    `;

    try {
      // Fetch exam section info from subjects
      const sectionsData = await ApiClient.get(`/subjects/all/exam-sections`);
      const allSections = sectionsData.examSections || [];
      const section = allSections.find(s => s.id === sectionId);

      if (!section) {
        app.innerHTML = `<div class="empty-state" style="min-height:60vh"><p>لم يتم العثور على هذا الامتحان.</p><a href="exams.html" class="runner-btn primary" style="margin-top:var(--space-4)">العودة</a></div>`;
        return;
      }

      // Fetch questions
      const qData = await ExamsApi.getQuestions(sectionId);
      questions = qData.questions || [];

      if (questions.length === 0) {
        app.innerHTML = `<div class="empty-state" style="min-height:60vh"><p>لا توجد أسئلة في هذا الامتحان.</p></div>`;
        return;
      }

      examData = {
        sectionId: section.id,
        title: section.title,
        durationMinutes: section.durationMinutes
      };

      // Check for saved state (crash recovery)
      const saved = loadState();
      if (saved && saved.sectionId === sectionId) {
        answers = saved.answers || {};
        currentIndex = saved.currentIndex || 0;

        // Create timer with remaining time
        timer = ExamTimer.create({
          durationMinutes: section.durationMinutes,
          containerSelector: '#timerDisplay',
          onEnd: () => submitExam()
        });
        timer.setRemaining(saved.remainingSeconds || section.durationMinutes * 60);
      } else {
        // Fresh start
        answers = {};
        currentIndex = 0;
        timer = ExamTimer.create({
          durationMinutes: section.durationMinutes,
          containerSelector: '#timerDisplay',
          onEnd: () => submitExam()
        });
      }

      renderRunner();
      timer.start();

    } catch (err) {
      console.error("Failed to init exam runner:", err);
      app.innerHTML = `
        <div class="empty-state" style="min-height:60vh">
          <div class="empty-state-icon" style="color:var(--color-error)">⚠️</div>
          <p class="empty-state-text">فشل تحميل الامتحان.</p>
          <a href="exams.html" class="runner-btn primary" style="margin-top:var(--space-4)">العودة</a>
        </div>
      `;
    }
  }

  // Auto-save on visibility change (tab switch / minimize)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !examSubmitted) saveState();
  });

  // Auto-save before page unload
  window.addEventListener('beforeunload', (e) => {
    if (!examSubmitted && questions.length > 0) {
      saveState();
    }
  });

  init();
});
