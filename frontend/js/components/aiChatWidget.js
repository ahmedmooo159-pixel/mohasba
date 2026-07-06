/**
 * aiChatWidget.js
 * منصة محاسبتك - Sprint 8
 *
 * Injects a floating AI chat widget into the page.
 */

const AiChatWidget = (() => {
  'use strict';

  let isOpen = false;

  // Mock responses for Sprint 8
  const MOCK_RESPONSES = [
    "مرحباً! كيف يمكنني مساعدتك في دراستك اليوم؟",
    "القيود اليومية تُسجل في دفتر اليومية بترتيب زمني، هل تريد مثالاً على ذلك؟",
    "المعادلة المحاسبية الأساسية هي: الأصول = الخصوم + حقوق الملكية.",
    "لدينا شرح مفصل في قسم الفيديوهات بخصوص هذه النقطة.",
    "إذا كنت تواجه صعوبة، أنصحك بمراجعة المصطلحات في قسم 'المصطلحات والتعريفات'."
  ];

  function init() {
    // Inject HTML
    const widgetHTML = `
      <!-- Floating Button -->
      <button class="ai-widget-btn" id="aiWidgetBtn" aria-label="مساعد الذكاء الاصطناعي">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      <!-- Chat Box -->
      <div class="ai-chat-box" id="aiChatBox">
        <div class="ai-chat-header">
          <div class="ai-chat-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            المساعد الذكي (AI)
          </div>
          <button class="ai-close-btn" id="aiCloseBtn" aria-label="إغلاق">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="ai-chat-messages" id="aiChatMessages">
          <div class="ai-msg bot">مرحباً يا بطل! أنا المساعد الذكي لمنصة محاسبتك. اسألني أي سؤال في المنهج.</div>
        </div>

        <div class="ai-chat-input-area">
          <input type="text" id="aiInput" class="ai-input" placeholder="اكتب سؤالك هنا..." autocomplete="off">
          <button class="ai-send-btn" id="aiSendBtn" aria-label="إرسال">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    // Bind Elements
    const btnOpen = document.getElementById('aiWidgetBtn');
    const btnClose = document.getElementById('aiCloseBtn');
    const chatBox = document.getElementById('aiChatBox');
    const inputField = document.getElementById('aiInput');
    const btnSend = document.getElementById('aiSendBtn');
    const messagesContainer = document.getElementById('aiChatMessages');

    // Toggle logic
    btnOpen.addEventListener('click', () => {
      isOpen = !isOpen;
      if (isOpen) {
        chatBox.classList.add('open');
        inputField.focus();
      } else {
        chatBox.classList.remove('open');
      }
    });

    btnClose.addEventListener('click', () => {
      isOpen = false;
      chatBox.classList.remove('open');
    });

    // Send logic
    function sendMessage() {
      const text = inputField.value.trim();
      if (!text) return;

      // Add user message
      addMessage(text, 'user');
      inputField.value = '';

      // Show typing indicator
      const typingId = showTyping();

      // Use AiApi if available, fallback to built-in mock
      const askFn = (typeof AiApi !== 'undefined')
        ? AiApi.ask
        : async (q) => {
            await new Promise(r => setTimeout(r, 800 + Math.random() * 700));
            return { answer: MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)] };
          };

      askFn(text).then(res => {
        removeTyping(typingId);
        addMessage(res.answer, 'bot');
      }).catch(() => {
        removeTyping(typingId);
        addMessage('عذراً، حدث خطأ في الاتصال. حاول مرة أخرى.', 'bot');
      });
    }

    btnSend.addEventListener('click', sendMessage);
    inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });

    function addMessage(text, sender) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `ai-msg ${sender}`;
      msgDiv.textContent = text;
      messagesContainer.appendChild(msgDiv);
      scrollToBottom();
    }

    function showTyping() {
      const id = 'typing-' + Date.now();
      const typingDiv = document.createElement('div');
      typingDiv.className = 'ai-msg bot';
      typingDiv.id = id;
      typingDiv.innerHTML = `
        <div class="ai-typing">
          <span></span><span></span><span></span>
        </div>
      `;
      messagesContainer.appendChild(typingDiv);
      scrollToBottom();
      return id;
    }

    function removeTyping(id) {
      const el = document.getElementById(id);
      if (el) el.remove();
    }

    function scrollToBottom() {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
