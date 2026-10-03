/**
 * Creepy Crawly Sydney - Production-Ready Frontend Chatbot Widget
 * 
 * Architecture:
 * - Fixed bottom-right viewport positioning
 * - Modular state and UI separation
 * - Pre-configured backend hook: `CreepyCrawlyChat.onSendMessage(message, callback)`
 * - Full responsive mobile support & accessible ARIA controls
 * - Zero external dependencies, pure vanilla JS
 */

(function () {
  'use strict';

  if (window.CreepyCrawlyChat) return;

  // Chat Responses & Quick Action Content
  const QUICK_ACTION_RESPONSES = {
    inspection: {
      userText: 'Book a Pest Inspection',
      botText: 'I can certainly help you book an inspection with Andy! You can fill out our quick <a href="contact.html" class="cc-link">Inspection Booking Form</a> or tell us your Sydney suburb and preferred day.'
    },
    quote: {
      userText: 'Get a Free Quote',
      botText: 'We provide 100% free, zero-obligation quotes across Greater Sydney. Head over to our <a href="contact.html" class="cc-link">Quote Request Page</a> or let us know what pests you are dealing with.'
    },
    pest: {
      userText: 'Pest Control',
      botText: 'Our general pest treatment protects against cockroaches, spiders, ants, silverfish, and rodents using family- and pet-safe products. Would you like to check availability for your property?'
    },
    termite: {
      userText: 'Termite Control',
      botText: 'Creepy Crawly specializes in complete termite inspections, chemical barriers, and reticulation systems backed by 40+ years experience. Need an urgent inspection or routine barrier check?'
    },
    team: {
      userText: 'Talk to our team',
      botText: 'You can talk directly with our team! Call our toll-free line on <a href="tel:1800814199" class="cc-link"><strong>1800 814 199</strong></a> or call owner Andy Kraus directly on <a href="tel:0412074484" class="cc-link"><strong>0412 074 484</strong></a>.'
    }
  };

  const DEFAULT_FALLBACK_REPLY = 'Thanks for reaching out! Our local Sydney technicians have received your message. For immediate bookings or urgent questions, please feel free to call <a href="tel:1800814199" class="cc-link">1800 814 199</a> or <a href="contact.html" class="cc-link">request a free quote online</a>.';

  class CreepyChatbot {
    constructor() {
      this.isOpen = false;
      this.isTyping = false;
      this.customBackendHandler = null;
      this.init();
    }

    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.mount());
      } else {
        this.mount();
      }
    }

    mount() {
      // Check if widget DOM exists; if not, create and inject it
      let widgetEl = document.getElementById('ccChatWidget');
      if (!widgetEl) {
        widgetEl = this.createWidgetMarkup();
        document.body.appendChild(widgetEl);
      }

      this.widget = widgetEl;
      this.triggerBtn = document.getElementById('ccChatTrigger');
      this.panel = document.getElementById('ccChatPanel');
      this.closeBtn = document.getElementById('ccChatClose');
      this.body = document.getElementById('ccChatBody');
      this.form = document.getElementById('ccChatForm');
      this.input = document.getElementById('ccChatInput');
      this.typingEl = document.getElementById('ccTypingIndicator');
      this.quickActions = document.getElementById('ccQuickActions');

      this.bindEvents();

      // Check session storage to restore open state if user previously opened it
      try {
        if (sessionStorage.getItem('cc_chat_open') === 'true') {
          this.open(false);
        }
      } catch (e) {
        // Ignore session storage errors
      }
    }

    createWidgetMarkup() {
      const wrapper = document.createElement('div');
      wrapper.className = 'cc-chat-widget';
      wrapper.id = 'ccChatWidget';
      wrapper.setAttribute('aria-label', 'Customer Support Chat');

      wrapper.innerHTML = `
        <!-- Floating Pill Button (Initial State) -->
        <button type="button" class="cc-chat-trigger" id="ccChatTrigger" aria-expanded="false" aria-controls="ccChatPanel" aria-label="Open chat with us">
          <span class="cc-trigger-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <line x1="8" y1="10" x2="16" y2="10"/>
              <line x1="8" y1="14" x2="12" y2="14"/>
            </svg>
          </span>
          <span class="cc-trigger-text">Chat with us</span>
        </button>

        <!-- Chat Panel (Open State) -->
        <div class="cc-chat-panel" id="ccChatPanel" role="dialog" aria-modal="false" aria-label="Chat with Creepy Crawly Sydney" hidden>
          <!-- Panel Header -->
          <div class="cc-chat-header">
            <div class="cc-chat-brand">
              <div class="cc-chat-avatar" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div class="cc-chat-meta">
                <div class="cc-chat-title-row">
                  <span class="cc-chat-title">Chat with us</span>
                  <span class="cc-status-indicator" title="Online now">
                    <span class="cc-status-dot"></span>
                    <span class="cc-status-text">Online</span>
                  </span>
                </div>
                <span class="cc-chat-subtext">We're here to help.</span>
              </div>
            </div>
            <button type="button" class="cc-chat-close" id="ccChatClose" aria-label="Close chat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Panel Body / Message Feed -->
          <div class="cc-chat-body" id="ccChatBody">
            <div class="cc-chat-time" aria-hidden="true">Today</div>

            <!-- Welcome Message Bubble -->
            <div class="cc-msg cc-msg-bot">
              <div class="cc-msg-avatar" aria-hidden="true">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div class="cc-msg-content">
                <div class="cc-bubble">
                  <p>Hi! 👋 How can we help you today?</p>
                </div>
              </div>
            </div>

            <!-- Quick Action Options -->
            <div class="cc-quick-actions" id="ccQuickActions" aria-label="Suggested quick actions">
              <button type="button" class="cc-quick-chip" data-action="inspection">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Book a Pest Inspection
              </button>
              <button type="button" class="cc-quick-chip" data-action="quote">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                Get a Free Quote
              </button>
              <button type="button" class="cc-quick-chip" data-action="pest">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect width="8" height="14" x="8" y="6" rx="4"/>
                  <path d="m19 7-3 2M5 7l3 2M19 19l-3-2M5 19l3-2M20 13h-4M4 13h4"/>
                </svg>
                Pest Control
              </button>
              <button type="button" class="cc-quick-chip" data-action="termite">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <circle cx="12" cy="11" r="3"/>
                </svg>
                Termite Control
              </button>
              <button type="button" class="cc-quick-chip" data-action="team">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Talk to our team
              </button>
            </div>

            <!-- Typing Indicator (hidden by default) -->
            <div class="cc-msg cc-msg-bot cc-typing-indicator" id="ccTypingIndicator" aria-hidden="true" style="display: none;">
              <div class="cc-msg-avatar">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div class="cc-bubble cc-bubble-typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>

          <!-- Panel Footer / Input Area -->
          <form class="cc-chat-footer" id="ccChatForm" autocomplete="off">
            <div class="cc-input-row">
              <input type="text" class="cc-chat-input" id="ccChatInput" placeholder="Type a message..." maxlength="500" aria-label="Your message">
              <button type="submit" class="cc-send-btn" id="ccSendBtn" aria-label="Send message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <div class="cc-footer-note">Usually replies in a few minutes</div>
          </form>
        </div>
      `;

      return wrapper;
    }

    bindEvents() {
      // Toggle button click
      this.triggerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggle();
      });

      // Close button click
      this.closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.close();
      });

      // Quick action chip clicks
      this.body.addEventListener('click', (e) => {
        const chip = e.target.closest('.cc-quick-chip');
        if (chip) {
          e.preventDefault();
          const action = chip.dataset.action;
          this.handleQuickAction(action);
        }
      });

      // Form submission
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = this.input.value.trim();
        if (text) {
          this.sendUserMessage(text);
          this.input.value = '';
        }
      });

      // Keyboard Esc to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }

    open(focusInput = true) {
      this.isOpen = true;
      this.panel.removeAttribute('hidden');
      this.panel.classList.add('is-open');
      this.triggerBtn.setAttribute('aria-expanded', 'true');
      this.triggerBtn.classList.add('is-active');

      try {
        sessionStorage.setItem('cc_chat_open', 'true');
      } catch (e) {}

      this.scrollToBottom();

      if (focusInput && window.innerWidth > 600) {
        setTimeout(() => this.input && this.input.focus(), 150);
      }
    }

    close() {
      this.isOpen = false;
      this.panel.classList.remove('is-open');
      this.triggerBtn.setAttribute('aria-expanded', 'false');
      this.triggerBtn.classList.remove('is-active');

      setTimeout(() => {
        if (!this.isOpen) {
          this.panel.setAttribute('hidden', '');
        }
      }, 250);

      try {
        sessionStorage.setItem('cc_chat_open', 'false');
      } catch (e) {}
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    handleQuickAction(actionKey) {
      const config = QUICK_ACTION_RESPONSES[actionKey];
      if (!config) return;

      // 1. Render user message bubble
      this.appendUserMessage(config.userText);

      // 2. Show typing indicator
      this.setTyping(true);

      // 3. Respond after subtle organic delay
      setTimeout(() => {
        this.setTyping(false);
        this.appendBotMessage(config.botText);
      }, 550);
    }

    sendUserMessage(text) {
      if (!text) return;

      // Render user bubble
      this.appendUserMessage(text);
      this.setTyping(true);

      /* =========================================================================
         BACKEND INTEGRATION HOOK
         -------------------------------------------------------------------------
         If a backend handler is provided via `CreepyCrawlyChat.onSendMessage()`,
         delegate execution to the backend API. Otherwise, respond with frontend fallback.
         ========================================================================= */
      if (typeof this.customBackendHandler === 'function') {
        this.customBackendHandler(text, (replyText) => {
          this.setTyping(false);
          this.appendBotMessage(replyText);
        });
      } else {
        // Frontend placeholder simulation
        setTimeout(() => {
          this.setTyping(false);
          this.appendBotMessage(DEFAULT_FALLBACK_REPLY);
        }, 700);
      }
    }

    appendUserMessage(text) {
      const msg = document.createElement('div');
      msg.className = 'cc-msg cc-msg-user';
      msg.innerHTML = `
        <div class="cc-msg-content">
          <div class="cc-bubble">
            <p>${this.escapeHtml(text)}</p>
          </div>
        </div>
      `;

      // Insert before typing indicator
      this.body.insertBefore(msg, this.typingEl);
      this.scrollToBottom();
    }

    appendBotMessage(htmlContent) {
      const msg = document.createElement('div');
      msg.className = 'cc-msg cc-msg-bot';
      msg.innerHTML = `
        <div class="cc-msg-avatar" aria-hidden="true">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div class="cc-msg-content">
          <div class="cc-bubble">
            <p>${htmlContent}</p>
          </div>
        </div>
      `;

      this.body.insertBefore(msg, this.typingEl);
      this.scrollToBottom();
    }

    setTyping(isTyping) {
      this.isTyping = isTyping;
      if (this.typingEl) {
        this.typingEl.style.display = isTyping ? 'flex' : 'none';
        if (isTyping) {
          this.scrollToBottom();
        }
      }
    }

    scrollToBottom() {
      if (this.body) {
        this.body.scrollTop = this.body.scrollHeight;
      }
    }

    escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    // Public API Hook for Backend Integration
    onSendMessage(callback) {
      if (typeof callback === 'function') {
        this.customBackendHandler = callback;
      }
    }
  }

  // Instantiate and expose globally
  const chatInstance = new CreepyChatbot();
  window.CreepyCrawlyChat = chatInstance;

})();
