/**
 * Creepy Crawly Sydney - Premium Immersive AI Chatbot Widget
 * 
 * Features:
 * - Immersive dark navy / golden ambient glow interface
 * - Floating rounded message bubbles & glowing AI avatar orb
 * - Pill-shaped floating input bar with attachment & send controls
 * - Interactive empty state with suggested action cards
 * - 100% preserved backend hook: `CreepyCrawlyChat.onSendMessage(message, callback)`
 * - Zero external dependencies, pure vanilla JS
 */

(function () {
  'use strict';

  if (window.CreepyCrawlyChat) return;

  // Chat Responses & Quick Action Content
  const QUICK_ACTION_RESPONSES = {
    inspection: {
      userText: 'Book a pest inspection',
      botText: 'I can certainly help you arrange an inspection with Andy! You can fill out our quick <a href="contact.html" class="cc-link">Inspection Booking Form</a> or tell us your Sydney suburb and preferred day.'
    },
    identify: {
      userText: 'Identify a pest',
      botText: 'Seen an unfamiliar pest around your home? Tell us what it looks like (color, size, location) or explore our <a href="services.html" class="cc-link">Sydney Pest Identification Guide</a> for termites, spiders, cockroaches, and rodents.'
    },
    quote: {
      userText: 'Get a treatment quote',
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

  const DEFAULT_FALLBACK_REPLY = 'Thanks for reaching out! Our local Sydney technicians have received your message. For immediate bookings or urgent questions, please feel free to call <a href="tel:1800814199" class="cc-link"><strong>1800 814 199</strong></a> or <a href="contact.html" class="cc-link">request a free quote online</a>.';

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
      this.emptyState = document.getElementById('ccChatEmptyState');

      this.bindEvents();

      // Check session storage to restore open state if user previously opened it
      try {
        if (sessionStorage.getItem('cc_chat_open') === 'true') {
          this.open(false);
        }
      } catch (e) {}
    }

    createWidgetMarkup() {
      const wrapper = document.createElement('div');
      wrapper.className = 'cc-chat-widget';
      wrapper.id = 'ccChatWidget';
      wrapper.setAttribute('aria-label', 'Customer Support Chat');

      wrapper.innerHTML = `
        <!-- Circular Floating Launcher Button -->
        <button type="button" class="cc-chat-trigger" id="ccChatTrigger" aria-expanded="false" aria-controls="ccChatPanel" aria-label="Open AI Pest Assistant chat">
          <div class="cc-trigger-orb-halo" aria-hidden="true"></div>
          <div class="cc-trigger-core" aria-hidden="true">
            <svg class="cc-trigger-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            <span class="cc-trigger-sparkle" aria-hidden="true">✦</span>
          </div>
        </button>

        <!-- Immersive Floating Chat Panel -->
        <div class="cc-chat-panel" id="ccChatPanel" role="dialog" aria-modal="false" aria-label="Creepy Crawly AI Assistant" hidden>
          <!-- Ambient Background Glow -->
          <div class="cc-ambient-glow" aria-hidden="true"></div>

          <!-- Minimal Header -->
          <div class="cc-chat-header">
            <div class="cc-chat-brand">
              <div class="cc-orb-avatar" aria-hidden="true">
                <div class="cc-orb-inner"></div>
                <div class="cc-orb-pulse"></div>
              </div>
              <div class="cc-chat-meta">
                <span class="cc-chat-title">Creepy Crawly AI</span>
                <span class="cc-status-row">
                  <span class="cc-status-dot"></span>
                  <span class="cc-status-text">Ready to help</span>
                </span>
              </div>
            </div>
            <button type="button" class="cc-chat-close-pill" id="ccChatClose" aria-label="Close chat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              <span>Close chat</span>
            </button>
          </div>

          <!-- Panel Body / Message Feed -->
          <div class="cc-chat-body" id="ccChatBody">
            <!-- Atmospheric Empty State -->
            <div class="cc-chat-empty-state" id="ccChatEmptyState">
              <div class="cc-empty-orb-wrap" aria-hidden="true">
                <div class="cc-empty-orb">
                  <div class="cc-empty-orb-core"></div>
                  <div class="cc-empty-orb-ring"></div>
                </div>
              </div>
              <h2 class="cc-empty-title">How can we help protect your home?</h2>
              <p class="cc-empty-sub">Ask anything about pest inspections, treatments, or Sydney quote estimates.</p>
              
              <div class="cc-empty-suggestions" id="ccQuickActions" aria-label="Suggested topics">
                <button type="button" class="cc-suggestion-pill" data-action="inspection">
                  <span class="cc-sugg-icon" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </span>
                  <span>Book a pest inspection</span>
                </button>
                <button type="button" class="cc-suggestion-pill" data-action="identify">
                  <span class="cc-sugg-icon" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                  </span>
                  <span>Identify a pest</span>
                </button>
                <button type="button" class="cc-suggestion-pill" data-action="quote">
                  <span class="cc-sugg-icon" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  </span>
                  <span>Get a treatment quote</span>
                </button>
              </div>
            </div>

            <!-- Messages Stream -->
            <div class="cc-messages-stream" id="ccMessagesStream"></div>

            <!-- Minimal Typing Indicator -->
            <div class="cc-typing-row" id="ccTypingIndicator" aria-hidden="true" style="display: none;">
              <div class="cc-msg-orb-avatar">
                <div class="cc-orb-inner"></div>
              </div>
              <div class="cc-bubble-typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>

          <!-- Floating Pill-Shaped Input Area -->
          <div class="cc-chat-input-wrapper">
            <form class="cc-floating-input-bar" id="ccChatForm" autocomplete="off">
              <button type="button" class="cc-input-attach-btn" aria-label="Attach details" title="Attach details">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
              </button>
              <input type="text" class="cc-pill-input" id="ccChatInput" placeholder="Ask about pest control..." maxlength="500" aria-label="Your message">
              <button type="submit" class="cc-pill-send-btn" id="ccSendBtn" aria-label="Send message">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </form>
          </div>
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

      // Quick action suggestion pill clicks
      this.body.addEventListener('click', (e) => {
        const pill = e.target.closest('.cc-suggestion-pill');
        if (pill) {
          e.preventDefault();
          const action = pill.dataset.action;
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
      // Force reflow for silky animation
      void this.panel.offsetWidth;
      this.panel.classList.add('is-open');
      this.triggerBtn.setAttribute('aria-expanded', 'true');
      this.triggerBtn.classList.add('is-active');

      try {
        sessionStorage.setItem('cc_chat_open', 'true');
      } catch (e) {}

      this.scrollToBottom();

      if (focusInput && window.innerWidth > 600) {
        setTimeout(() => this.input && this.input.focus(), 200);
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
      }, 300);

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
      }, 600);
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
        }, 750);
      }
    }

    appendUserMessage(text) {
      if (this.emptyState) {
        this.emptyState.style.display = 'none';
      }

      const stream = document.getElementById('ccMessagesStream') || this.body;
      const msg = document.createElement('div');
      msg.className = 'cc-msg cc-msg-user';
      msg.innerHTML = `
        <div class="cc-bubble cc-bubble-user">
          <p>${this.escapeHtml(text)}</p>
        </div>
      `;

      stream.appendChild(msg);
      this.scrollToBottom();
    }

    appendBotMessage(htmlContent) {
      if (this.emptyState) {
        this.emptyState.style.display = 'none';
      }

      const stream = document.getElementById('ccMessagesStream') || this.body;
      const msg = document.createElement('div');
      msg.className = 'cc-msg cc-msg-bot';
      msg.innerHTML = `
        <div class="cc-msg-orb-avatar" aria-hidden="true">
          <div class="cc-orb-inner"></div>
        </div>
        <div class="cc-bubble cc-bubble-bot">
          <p>${htmlContent}</p>
        </div>
      `;

      stream.appendChild(msg);
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
