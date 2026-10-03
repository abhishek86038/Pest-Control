/**
 * Creepy Crawly Pest Control - Premium AI Chatbot Widget
 * Immersive AI Assistant UI inspired by dark ambient glow aesthetics.
 * Preserves all existing functionality, API hooks, and event handlers.
 */

(function () {
  'use strict';

  // Fallback responses for suggested topics & common questions
  const QUICK_ACTION_RESPONSES = {
    inspection: {
      userText: "Book a pest inspection",
      botText: "We'd love to help! Andy's team provides comprehensive pest inspections across Greater Sydney with thermal imaging and moisture meters. Would you prefer a residential home inspection or a pre-purchase timber pest report? Call Andy directly on <strong>0412 074 484</strong> or use our booking form."
    },
    identify: {
      userText: "Identify a pest",
      botText: "Spotting unwanted visitors? Common Sydney invaders include German cockroaches, Funnel-web & Redback spiders, subterranean termites, and black house ants. Describe the pest (size, color, location) or call Andy on <strong>0412 074 484</strong> for rapid identification and safe treatment."
    },
    quote: {
      userText: "Get a treatment quote",
      botText: "Our treatments start with fixed, transparent pricing: General Pest treatments from $220, Termite Inspections from $280, and combined packages with warranty protection. Call <strong>0412 074 484</strong> or fill out our online quote form for a custom price in minutes."
    }
  };

  const DEFAULT_FALLBACK_REPLY = "Thanks for your inquiry! Andy and the Creepy Crawly team are currently on site across Sydney. For urgent pest eradication or immediate booking, call Andy directly on <strong>0412 074 484</strong>, or let us know your suburb and pest issue!";

  class CreepyChatbot {
    constructor() {
      this.isOpen = false;
      this.isTyping = false;
      this.customBackendHandler = null;

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
            <span class="cc-trigger-status-dot" aria-hidden="true"></span>
          </div>
        </button>

        <!-- Immersive Floating Chat Panel -->
        <div class="cc-chat-panel" id="ccChatPanel" role="dialog" aria-modal="false" aria-label="Creepy Crawly AI Assistant">
          <!-- Ambient Background Glow -->
          <div class="cc-ambient-glow" aria-hidden="true">
            <div class="cc-glow-amber-top"></div>
            <div class="cc-glow-navy-bottom"></div>
          </div>

          <!-- Minimal Header -->
          <div class="cc-chat-header">
            <div class="cc-header-left">
              <div class="cc-orb-avatar" aria-hidden="true">
                <div class="cc-orb-glow-ring"></div>
                <div class="cc-orb-core"></div>
              </div>
              <div class="cc-header-meta">
                <span class="cc-assistant-name">Creepy Crawly AI</span>
                <span class="cc-assistant-status">
                  <span class="cc-status-pulse" aria-hidden="true"></span>
                  Ready to help
                </span>
              </div>
            </div>
            <div class="cc-header-actions">
              <button type="button" class="cc-chat-close-pill" id="ccChatClose" aria-label="Close chat" title="Close chat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Panel Body / Message Feed -->
          <div class="cc-chat-body" id="ccChatBody">
            <!-- Atmospheric Empty State -->
            <div class="cc-chat-empty-state" id="ccChatEmptyState">
              <div class="cc-empty-orb" aria-hidden="true">
                <div class="cc-empty-orb-halo"></div>
                <div class="cc-empty-orb-core"></div>
              </div>
              <h2 class="cc-empty-title">How can we help protect your home?</h2>
              <p class="cc-empty-subtitle">Ask anything about pest inspections, treatments, or Sydney quote estimates.</p>
              
              <div class="cc-empty-suggestions" id="ccQuickActions" aria-label="Suggested topics">
                <button type="button" class="cc-suggestion-pill" data-action="inspection">
                  <span>Book a pest inspection</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                <button type="button" class="cc-suggestion-pill" data-action="identify">
                  <span>Identify a pest</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                <button type="button" class="cc-suggestion-pill" data-action="quote">
                  <span>Get a treatment quote</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>

            <!-- Messages Stream -->
            <div class="cc-messages-stream" id="ccMessagesStream"></div>

            <!-- Minimal Typing Indicator -->
            <div class="cc-msg-row cc-msg-bot" id="ccTypingIndicator" aria-hidden="true" style="display: none;">
              <div class="cc-msg-avatar">
                <div class="cc-orb-avatar cc-orb-avatar-sm" aria-hidden="true">
                  <div class="cc-orb-core"></div>
                </div>
              </div>
              <div class="cc-typing-bubble">
                <span class="cc-typing-dot"></span>
                <span class="cc-typing-dot"></span>
                <span class="cc-typing-dot"></span>
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
              <button type="submit" class="cc-pill-send-btn" id="ccSendBtn" aria-label="Send message" title="Send message">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </form>
            <div class="cc-input-caption">Creepy Crawly AI • Rapid Sydney Pest Advice</div>
          </div>
        </div>
      `;

      return wrapper;
    }

    bindEvents() {
      if (!this.triggerBtn) return;

      // Toggle button click
      this.triggerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggle();
      });

      // Close button click
      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.close();
        });
      }

      // Quick action suggestion pill clicks
      if (this.body) {
        this.body.addEventListener('click', (e) => {
          const pill = e.target.closest('.cc-suggestion-pill');
          if (pill) {
            e.preventDefault();
            e.stopPropagation();
            const action = pill.dataset.action;
            this.handleQuickAction(action);
          }
        });
      }

      // Form submission
      if (this.form) {
        this.form.addEventListener('submit', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const text = this.input ? this.input.value.trim() : '';
          if (text) {
            this.sendUserMessage(text);
            this.input.value = '';
          }
        });
      }

      // Keyboard Esc to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }

    open(focusInput = true) {
      this.isOpen = true;
      if (!this.panel) return;

      // Ensure classes applied to panel, widget, and trigger
      this.panel.classList.add('active', 'is-open');
      if (this.widget) this.widget.classList.add('active', 'is-open');
      if (this.triggerBtn) {
        this.triggerBtn.setAttribute('aria-expanded', 'true');
        this.triggerBtn.classList.add('active', 'is-active');
      }

      try {
        sessionStorage.setItem('cc_chat_open', 'true');
      } catch (e) {}

      this.scrollToBottom();

      if (focusInput && window.innerWidth > 600) {
        setTimeout(() => this.input && this.input.focus(), 250);
      }
    }

    close() {
      this.isOpen = false;
      if (!this.panel) return;

      this.panel.classList.remove('active', 'is-open');
      if (this.widget) this.widget.classList.remove('active', 'is-open');
      if (this.triggerBtn) {
        this.triggerBtn.setAttribute('aria-expanded', 'false');
        this.triggerBtn.classList.remove('active', 'is-active');
      }

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
      const row = document.createElement('div');
      row.className = 'cc-msg-row cc-msg-user';
      row.innerHTML = `
        <div class="cc-msg-content-wrap">
          <div class="cc-msg-bubble cc-bubble-user">
            ${this.escapeHtml(text)}
          </div>
          <span class="cc-msg-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      `;

      stream.appendChild(row);
      this.scrollToBottom();
    }

    appendBotMessage(htmlContent) {
      if (this.emptyState) {
        this.emptyState.style.display = 'none';
      }

      const stream = document.getElementById('ccMessagesStream') || this.body;
      const row = document.createElement('div');
      row.className = 'cc-msg-row cc-msg-bot';
      row.innerHTML = `
        <div class="cc-msg-avatar">
          <div class="cc-orb-avatar cc-orb-avatar-sm" aria-hidden="true">
            <div class="cc-orb-core"></div>
          </div>
        </div>
        <div class="cc-msg-content-wrap">
          <div class="cc-msg-bubble cc-bubble-bot">
            ${htmlContent}
          </div>
          <span class="cc-msg-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      `;

      stream.appendChild(row);
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
