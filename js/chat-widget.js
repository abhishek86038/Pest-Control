/**
 * Creepy Crawly Pest Control - Exact Reference Video AI Chatbot Interface
 * Immersive ambient aura, 3D glowing copper/amber metallic sphere,
 * centered frosted '✕ Close chat' pill, radiant orange user bubble,
 * sleek dark translucent AI bubble with miniature 3D sphere,
 * and floating bottom capsule input bar.
 */

(function () {
  'use strict';

  const QUICK_ACTION_RESPONSES = {
    inspection: {
      userText: "Book a pest inspection",
      botText: "We'd love to help protect your home! Andy's team provides comprehensive thermal and moisture pest inspections across all Sydney suburbs. Would you prefer a standard residential check or a pre-purchase timber pest report? Call Andy directly on <strong>0412 074 484</strong> or use our quick booking form."
    },
    identify: {
      userText: "Identify a pest",
      botText: "Spotting unwanted pests? Common Sydney invaders include German cockroaches, Funnel-web & Redback spiders, subterranean termites, and black ants. Describe the pest (size, color, location) or call Andy on <strong>0412 074 484</strong> for rapid identification and safe treatment."
    },
    quote: {
      userText: "Get a treatment quote",
      botText: "Transparent, fixed Sydney rates: General Pest treatments from $220, Termite Inspections from $280, and combined packages with full warranty. Call <strong>0412 074 484</strong> or submit our form for an exact quote tailored to your home."
    }
  };

  const DEFAULT_FALLBACK_REPLY = "Thanks for your inquiry! Andy and the Creepy Crawly team are currently on site across Sydney. For urgent pest eradication or immediate booking, call Andy directly on <strong>0412 074 484</strong>, or tell us your suburb and pest issue!";

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
      this.stream = document.getElementById('ccMessagesStream');

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
        <!-- Floating Launcher Button with 3D Glowing Sphere -->
        <button type="button" class="cc-chat-trigger" id="ccChatTrigger" aria-expanded="false" aria-controls="ccChatPanel" aria-label="Open AI Pest Assistant chat">
          <div class="cc-trigger-halo" aria-hidden="true"></div>
          <div class="cc-3d-sphere-launcher" aria-hidden="true"></div>
          <span class="cc-trigger-status-dot" aria-hidden="true"></span>
        </button>

        <!-- Immersive Chat Panel (Exact Video Style) -->
        <div class="cc-chat-panel" id="ccChatPanel" role="dialog" aria-modal="false" aria-label="Creepy Crawly AI Assistant">
          <!-- Ambient Glow (Rich Orange/Amber Aura + Dark Core) -->
          <div class="cc-ambient-glow" aria-hidden="true">
            <div class="cc-aura-top"></div>
            <div class="cc-aura-sides"></div>
            <div class="cc-aura-bottom-dark"></div>
          </div>

          <!-- Top Centered '✕ Close chat' Pill (Identical to Video) -->
          <div class="cc-top-bar">
            <button type="button" class="cc-close-pill-top" id="ccChatClose" aria-label="Close chat">
              <span class="cc-close-x" aria-hidden="true">✕</span>
              <span>Close chat</span>
            </button>
          </div>

          <!-- Chat Body -->
          <div class="cc-chat-body" id="ccChatBody">
            <!-- Empty State / Listening Mode (Matches Video Frame 01 & 02) -->
            <div class="cc-chat-empty-state" id="ccChatEmptyState">
              <!-- Large 3D Glowing Sphere -->
              <div class="cc-sphere-container" aria-hidden="true">
                <div class="cc-3d-sphere-large"></div>
              </div>

              <!-- Listening Status -->
              <div class="cc-listening-text">Creepy Crawly AI is listening...</div>

              <!-- Headline (Exact Two-Tone Typography) -->
              <h2 class="cc-hero-headline">
                What are we<br>
                <span class="cc-headline-dim">protecting today?</span>
              </h2>

              <!-- Glass Suggestion Cards with Sparkle -->
              <div class="cc-suggestion-cards" id="ccQuickActions" aria-label="Suggested topics">
                <button type="button" class="cc-glass-card" data-action="inspection">
                  <span class="cc-card-sparkle" aria-hidden="true">✦</span>
                  <span class="cc-card-label">Book a pest inspection</span>
                </button>
                <button type="button" class="cc-glass-card" data-action="identify">
                  <span class="cc-card-sparkle" aria-hidden="true">✦</span>
                  <span class="cc-card-label">Identify a pest</span>
                </button>
                <button type="button" class="cc-glass-card" data-action="quote">
                  <span class="cc-card-sparkle" aria-hidden="true">✦</span>
                  <span class="cc-card-label">Get a treatment quote</span>
                </button>
              </div>
            </div>

            <!-- Messages Stream (Matches Video Frame 8s) -->
            <div class="cc-messages-stream" id="ccMessagesStream"></div>

            <!-- Minimal Typing Indicator -->
            <div class="cc-msg-row cc-msg-bot" id="ccTypingIndicator" aria-hidden="true" style="display: none;">
              <div class="cc-bot-avatar-col">
                <div class="cc-3d-sphere-avatar" aria-hidden="true"></div>
              </div>
              <div class="cc-typing-bubble">
                <span class="cc-typing-dot"></span>
                <span class="cc-typing-dot"></span>
                <span class="cc-typing-dot"></span>
              </div>
            </div>
          </div>

          <!-- Bottom Floating Pill Input Bar (Identical to Video) -->
          <div class="cc-bottom-input-wrap">
            <form class="cc-floating-pill-bar" id="ccChatForm" autocomplete="off">
              <button type="button" class="cc-pill-icon-btn" aria-label="Attach details" title="Attach details">
                <span class="cc-at-icon" aria-hidden="true">@</span>
              </button>
              <input type="text" class="cc-pill-text-input" id="ccChatInput" placeholder="Ask AI a question" maxlength="500" aria-label="Your message">
              <button type="submit" class="cc-pill-mic-btn" id="ccSendBtn" aria-label="Send message" title="Send message">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </button>
            </form>
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

      // Quick action suggestion card clicks
      if (this.body) {
        this.body.addEventListener('click', (e) => {
          const card = e.target.closest('.cc-glass-card');
          if (card) {
            e.preventDefault();
            e.stopPropagation();
            const action = card.dataset.action;
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

      // Dynamic icon: if typing, show send arrow instead of mic
      if (this.input) {
        this.input.addEventListener('input', () => {
          const sendBtn = document.getElementById('ccSendBtn');
          if (!sendBtn) return;
          const hasText = this.input.value.trim().length > 0;
          if (hasText) {
            sendBtn.innerHTML = `
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            `;
            sendBtn.setAttribute('title', 'Send message');
          } else {
            sendBtn.innerHTML = `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            `;
            sendBtn.setAttribute('title', 'Speak or Send');
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

      // 3. Respond after organic delay
      setTimeout(() => {
        this.setTyping(false);
        this.appendBotMessage(config.botText);
      }, 650);
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
         delegate execution to backend API. Otherwise, respond with frontend fallback.
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
        <div class="cc-user-bubble-wrap">
          <div class="cc-bubble-user">
            ${this.escapeHtml(text)}
          </div>
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
        <div class="cc-bot-avatar-col">
          <div class="cc-3d-sphere-avatar" aria-hidden="true"></div>
        </div>
        <div class="cc-bot-bubble-wrap">
          <div class="cc-bubble-bot">
            ${htmlContent}
          </div>
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
