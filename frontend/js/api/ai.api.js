/**
 * ai.api.js — AI Assistant API service
 * منصة محاسبتك — Sprint 9
 *
 * Mock: ردود محلية محاكية
 * Live: POST /api/ai/ask { question, context? }
 */

const AiApi = (() => {
  'use strict';

  const MOCK_RESPONSES = [
    'القيود اليومية تُسجل في دفتر اليومية بترتيب زمني، هل تريد مثالاً عملياً؟',
    'المعادلة المحاسبية الأساسية: الأصول = الخصوم + حقوق الملكية.',
    'يمكنك مراجعة الشرح الكامل في قسم الفيديوهات التعليمية.',
    'هل تقصد مبدأ الاستحقاق؟ يعني الإيراد يُثبَّت لما يُكتَسب مش لما يُقبَض.',
    'جرّب تراجع قسم المصطلحات — فيه تعريفات مفصّلة لكل المفاهيم.',
    'لو مش فاهم حاجة في الامتحان، افتح صفحة الشابتر المقابل وراجع الملاحظات.',
    'الميزانية العمومية تعرض المركز المالي للشركة في لحظة زمنية معينة.',
  ];

  return {
    /**
     * Ask the AI assistant
     * @param {string} question - the student's question
     * @param {string} [context] - optional page context (e.g., "concepts", "exams")
     * @returns {Promise<{answer: string}>}
     */
    ask: async (question, context = '') => {
      if (ApiClient.isMock()) {
        await new Promise(r => setTimeout(r, 700 + Math.random() * 800));
        const answer = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
        return { answer };
      }

      return ApiClient.post('/ai/ask', { question, context });
    },
  };
})();
