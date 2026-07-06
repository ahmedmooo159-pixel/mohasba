const fs = require('fs');
const files = [
  'frontend/pages/dashboard.html',
  'frontend/pages/concepts.html',
  'frontend/pages/videos.html',
  'frontend/pages/exams.html',
  'frontend/pages/exam-runner.html'
];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Add config.js before apiClient.js (double quotes variant)
  if (!content.includes('config.js')) {
    content = content.replace(
      '<script src="../js/api/apiClient.js"></script>',
      '<script src="../js/api/config.js"></script>\n  <script src="../js/api/apiClient.js"></script>'
    );
  }

  // Add ai.api.js before aiChatWidget.js (double quotes variant)
  if (!content.includes('ai.api.js')) {
    content = content.replace(
      '<script src="../js/components/aiChatWidget.js"></script>',
      '<script src="../js/api/ai.api.js"></script>\n  <script src="../js/components/aiChatWidget.js"></script>'
    );
  }

  fs.writeFileSync(file, content);
  console.log('Patched:', file);
});
