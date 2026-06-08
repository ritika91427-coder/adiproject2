(function () {
  'use strict';

  let conversationHistory = [];

  async function getAIReply(userMessage) {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, history: conversationHistory })
    });

    if (!response.ok) throw new Error('API error');
    const data = await response.json();

    conversationHistory.push({ role: 'user', content: userMessage });
    conversationHistory.push({ role: 'assistant', content: data.reply });
    if (conversationHistory.length > 20) conversationHistory = conversationHistory.slice(-20);

    return data.reply;
  }

  function createMsg(text, from) {
    const wrap = document.createElement('div');
    wrap.className = 'chatbot__msg chatbot__msg--' + from;
    const bubble = document.createElement('div');
    bubble.className = 'chatbot__bubble';
    bubble.textContent = text;
    wrap.appendChild(bubble);
    return wrap;
  }

  function appendMsg(container, text, from) {
    const el = createMsg(text, from);
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
    return el;
  }

  function showTyping(container) {
    const wrap = document.createElement('div');
    wrap.className = 'chatbot__msg chatbot__msg--bot chatbot__msg--typing';
    wrap.innerHTML = '<div class="chatbot__bubble"><span class="chatbot__dot"></span><span class="chatbot__dot"></span><span class="chatbot__dot"></span></div>';
    container.appendChild(wrap);
    container.scrollTop = container.scrollHeight;
    return wrap;
  }

  function init() {
    const toggle   = document.getElementById('chatbotToggle');
    const window_  = document.getElementById('chatbotWindow');
    const closeBtn = document.getElementById('chatbotClose');
    const messages = document.getElementById('chatbotMessages');
    const form     = document.getElementById('chatbotForm');
    const input    = document.getElementById('chatbotInput');
    const badge    = document.getElementById('chatbotBadge');
    const chips    = document.getElementById('chatbotChips');
    let opened = false;

    function openChat() {
      window_.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      toggle.querySelector('.chatbot__toggle-icon--open').hidden = true;
      toggle.querySelector('.chatbot__toggle-icon--close').hidden = false;
      badge.hidden = true;
      if (!opened) {
        opened = true;
        setTimeout(() => {
          appendMsg(messages, "Namaste! 🙏 I'm the Wangduk Health virtual assistant. How can I help you today? You can ask me about appointments, services, doctors, timings, or anything else.", 'bot');
        }, 300);
      }
      setTimeout(() => input.focus(), 100);
    }

    function closeChat() {
      window_.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelector('.chatbot__toggle-icon--open').hidden = false;
      toggle.querySelector('.chatbot__toggle-icon--close').hidden = true;
    }

    toggle.addEventListener('click', () => window_.hidden ? openChat() : closeChat());
    closeBtn.addEventListener('click', closeChat);

    chips.addEventListener('click', e => {
      const chip = e.target.closest('.chatbot__chip');
      if (!chip) return;
      sendMsg(chip.dataset.msg);
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      sendMsg(text);
      input.value = '';
    });

    function sendMsg(text) {
      appendMsg(messages, text, 'user');
      const typing = showTyping(messages);

      getAIReply(text)
        .then(reply => {
          typing.remove();
          appendMsg(messages, reply, 'bot');
        })
        .catch(() => {
          typing.remove();
          appendMsg(messages, "Sorry, I'm having trouble connecting right now. Please call us directly at 9263403905.", 'bot');
        });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
