/**
 * examTimer.js — Countdown timer component for exams
 * Sprint 6 | منصة محاسبتك
 *
 * Usage:
 *   const timer = ExamTimer.create({
 *     durationMinutes: 10,
 *     containerSelector: '#timerDisplay',
 *     onTick: (remaining) => {},
 *     onWarning: () => {},
 *     onEnd: () => {}
 *   });
 *   timer.start();
 *   timer.pause();
 *   timer.getRemaining(); // seconds
 */

const ExamTimer = (() => {
  'use strict';

  function create(options = {}) {
    const {
      durationMinutes = 10,
      containerSelector = '#timerDisplay',
      onTick = null,
      onWarning = null,
      onEnd = null,
      warningThresholdSec = 120, // 2 minutes
      dangerThresholdSec = 30,
    } = options;

    let totalSeconds = durationMinutes * 60;
    let remaining = totalSeconds;
    let intervalId = null;
    let isRunning = false;

    function formatTime(sec) {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function render() {
      const container = document.querySelector(containerSelector);
      if (!container) return;

      container.textContent = formatTime(remaining);

      // CSS class for visual urgency
      container.closest('.runner-timer')?.classList.remove('warning', 'danger');
      if (remaining <= dangerThresholdSec) {
        container.closest('.runner-timer')?.classList.add('danger');
      } else if (remaining <= warningThresholdSec) {
        container.closest('.runner-timer')?.classList.add('warning');
      }
    }

    function tick() {
      remaining--;
      render();

      if (typeof onTick === 'function') onTick(remaining);

      if (remaining <= warningThresholdSec && remaining === warningThresholdSec) {
        if (typeof onWarning === 'function') onWarning();
      }

      if (remaining <= 0) {
        stop();
        if (typeof onEnd === 'function') onEnd();
      }
    }

    function start() {
      if (isRunning) return;
      isRunning = true;
      render();
      intervalId = setInterval(tick, 1000);
    }

    function pause() {
      isRunning = false;
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
    }

    function stop() {
      pause();
      remaining = 0;
    }

    function getRemaining() {
      return remaining;
    }

    function setRemaining(sec) {
      remaining = Math.max(0, sec);
      render();
    }

    return { start, pause, stop, getRemaining, setRemaining, render };
  }

  return { create };
})();
