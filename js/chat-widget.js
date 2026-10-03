/**
 * Creepy Crawly Pest Control - Exact Reference Video AI Chatbot Interface
 * Immersive animated glowing ambient aura, 3D metallic sphere,
 * centered frosted '✕ Close chat' pill, radiant orange user bubble,
 * sleek dark translucent AI bubble with miniature 3D sphere,
 * intelligent context-aware Sydney pest response engine,
 * and floating bottom capsule input bar.
 */

(function () {
  'use strict';

  const QUICK_ACTION_RESPONSES = {
    inspection: {
      userText: "Book a pest inspection",
      botText: "We'd love to help protect your home! Andy's team provides comprehensive thermal imaging and moisture pest inspections across all Sydney suburbs. Would you prefer a standard residential check or a pre-purchase timber pest report? Call Andy directly on <strong>0412 074 484</strong> or use our booking form."
    },
    identify: {
      userText: "Identify a pest",
      botText: "Spotting unwanted pests? Common Sydney invaders include German cockroaches, Funnel-web & Redback spiders, subterranean termites, and black ants. Tell me what you've noticed (size, color, location) or call Andy on <strong>0412 074 484</strong> for rapid identification and safe eradication."
    },
    quote: {
      userText: "Get a treatment quote",
      botText: "Transparent, fixed Sydney rates:<br>• <strong>General Pest Treatment:</strong> From $220<br>• <strong>Termite Thermal Inspection:</strong> From $280<br>• <strong>Combined Pest & Termite Package:</strong> From $395<br>Call <strong>0412 074 484</strong> or submit our form for an exact quote tailored to your property."
    }
  };

  function getSmartPestReply(query) {
    const q = (query || '').toLowerCase().trim();

    if (/spider|funnel|redback|huntsman|black house|white tail|arachnid/.test(q)) {
      return "Sydney is home to several dangerous spiders, particularly Sydney Funnel-webs and Redbacks. Andy uses targeted micro-encapsulated perimeter barrier treatments that eradicate active spiders and prevent new ones from nesting in weep holes, eaves, and subfloors. All treatments are safe for kids and pets once dry. Call Andy on <strong>0412 074 484</strong> for rapid spider protection.";
    }

    if (/termite|white ant|timber|barrier|termidor|bait|borer|subterranean/.test(q)) {
      return "Termites cause severe structural damage across Sydney homes. We use FLIR thermal imaging and Termatrac radar to detect hidden termite activity inside wall cavities without damage. We install Australian Standards-approved chemical soil barriers (Termidor) and baiting stations with up to $1M warranty protection. Call Andy on <strong>0412 074 484</strong> for an urgent inspection.";
    }

    if (/cockroach|roach|german|kitchen|pipes|drain/.test(q)) {
      return "German cockroaches reproduce rapidly in warm kitchens, dishwashers, and pantries. We use professional non-repellent cockroach bait gels, insect growth regulators (IGR), and crack-and-crevice dusting that eliminates the entire breeding colony within days. Call Andy on <strong>0412 074 484</strong> for complete eradication.";
    }

    if (/rat|rats|mouse|mice|rodent|attic|roof void/.test(q)) {
      return "Rodents in roof voids and subfloors pose serious health and wiring fire hazards. Andy conducts roof-cavity inspections, identifies active ingress points, and installs tamper-proof locked bait stations and tracking powders to clear infestations quickly. Call Andy on <strong>0412 074 484</strong>.";
    }

    if (/ant|ants|wasp|wasps|bee|bees|flea|fleas|bed bug|bedbug|silverfish/.test(q)) {
      return "We treat all nuisance household pests including black house ants, coastal brown ants, paper wasps, fleas, and silverfish. Andy applies odorless, eco-conscious treatments with warranty protection. Call Andy on <strong>0412 074 484</strong> to schedule treatment.";
    }

    if (/price|cost|how much|rate|fee|quote|charge|pricing/.test(q)) {
      return "Our pricing is transparent and upfront:<br>• <strong>General Pest Treatment:</strong> From $220 (Spiders, Cockroaches, Ants)<br>• <strong>Thermal Termite Inspection:</strong> From $280<br>• <strong>Combined Pest & Termite Package:</strong> From $395<br>• <strong>Commercial Pest Management:</strong> Custom quote<br>Call Andy directly on <strong>0412 074 484</strong> for an immediate fixed quote for your suburb!";
    }

    if (/book|appointment|schedule|available|today|tomorrow|saturday|sunday|time|urgent/.test(q)) {
      return "Andy offers flexible booking times Monday to Saturday, with emergency same-day callouts available across Greater Sydney. Call Andy directly on <strong>0412 074 484</strong> or tell us your suburb and preferred day to lock in a time slot!";
    }

    if (/area|suburb|where|sydney|western|parramatta|penrith|north|eastern|hills|liverpool|blacktown/.test(q)) {
      return "We service all of Greater Sydney, including Western Sydney, the Hills District, North Shore, Northern Beaches, Eastern Suburbs, Inner West, and Sutherland Shire. With over 40 years of local Sydney experience, Andy is ready to help. Call <strong>0412 074 484</strong>.";
    }

    if (/phone|call|number|contact|andy|talk|speak|tel/.test(q)) {
      return "You can call Andy directly on <strong>0412 074 484</strong> or toll-free on <strong>1800 814 199</strong>. Andy has over 40 years of hands-on pest control expertise across Sydney.";
    }

    if (/hi|hello|hey|gday|g'day|good morning|good afternoon/.test(q)) {
      return "G'day! I'm your Creepy Crawly AI assistant. How can Andy and our Sydney pest control team help you today? You can ask about spider sprays, termite thermal inspections, cockroach eradication, or get an instant quote!";
    }

    return "Thanks for your question! Andy and the Creepy Crawly team provide licensed, insured pest control with warranty protection across Greater Sydney. Call Andy directly on <strong>0412 074 484</strong> for immediate advice, or let us know your suburb and pest issue!";
  }

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
      this.emptyState = document.getElementById('ccChatEmptyState');
      this.stream = document.getElementById('ccMessagesStream');
      this.typingEl = document.getElementById('ccTypingIndicator');

      this.bindEvents();

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
        <button type="button" class="cc-chat-trigger" id="ccChatTrigger" aria-expanded="false" aria-controls="ccChatPanel" aria-label="Ask Andy: open chat">
          <div class="cc-trigger-halo" aria-hidden="true"></div>
          <div class="cc-3d-sphere-launcher" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/></svg>
          </div>
          <span class="cc-trigger-label">Ask Andy</span>
          <span class="cc-trigger-status-dot" aria-hidden="true"></span>
        </button>

        <!-- Immersive Chat Panel (Compact Video Style) -->
        <div class="cc-chat-panel" id="ccChatPanel" role="dialog" aria-modal="false" aria-label="Creepy Crawly AI Assistant">
          <!-- Animated Background Glow with Rich Amber Aura -->
          <div class="cc-ambient-glow" aria-hidden="true">
            <div class="cc-aura-top"></div>
            <div class="cc-aura-center-wave"></div>
            <div class="cc-aura-bottom-dark"></div>
          </div>

          <!-- Top Centered '✕ Close chat' Pill -->
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
              <!-- 3D Glowing Sphere -->
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
            <div class="cc-messages-stream" id="ccMessagesStream">
              <!-- Minimal Typing Indicator (inside stream so it scrolls properly) -->
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
          </div>

          <!-- Bottom Floating Pill Input Bar -->
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
            // Reset to mic icon after sending
            const sendBtn = document.getElementById('ccSendBtn');
            if (sendBtn) {
              sendBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              `;
            }
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
      }, 550);
    }

    sendUserMessage(text) {
      if (!text) return;

      // Render user bubble
      this.appendUserMessage(text);
      this.setTyping(true);

      // Backend integration hook check
      if (typeof this.customBackendHandler === 'function') {
        this.customBackendHandler(text, (replyText) => {
          this.setTyping(false);
          this.appendBotMessage(replyText);
        });
      } else {
        // Intelligent Sydney pest response engine
        setTimeout(() => {
          this.setTyping(false);
          const reply = getSmartPestReply(text);
          this.appendBotMessage(reply);
        }, 650);
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

      if (this.typingEl && this.typingEl.parentNode === stream) {
        stream.insertBefore(row, this.typingEl);
      } else {
        stream.appendChild(row);
      }

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

      if (this.typingEl && this.typingEl.parentNode === stream) {
        stream.insertBefore(row, this.typingEl);
      } else {
        stream.appendChild(row);
      }

      this.scrollToBottom();
    }

    setTyping(isTyping) {
      this.isTyping = isTyping;
      if (this.typingEl) {
        this.typingEl.style.display = isTyping ? 'flex' : 'none';
        if (isTyping) {
          const stream = document.getElementById('ccMessagesStream') || this.body;
          if (stream && this.typingEl.parentNode !== stream) {
            stream.appendChild(this.typingEl);
          }
          this.scrollToBottom();
        }
      }
    }

    scrollToBottom() {
      const container = this.stream || document.getElementById('ccMessagesStream') || this.body;
      if (container) {
        setTimeout(() => {
          container.scrollTop = container.scrollHeight;
        }, 10);
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
