    // Hero playlist: V2 indoors then outdoors, followed by the remaining outdoor film.
    // Keep the outgoing frame visible until the next preloaded clip is playing.
    const heroVideos = [...document.querySelectorAll('.hero-bg-video')];
    if (heroVideos.length > 1) {
      let currentVideo = 0;
      const failedVideos = new Set();
      const playNextHeroVideo = () => {
        for (let step = 1; step <= heroVideos.length; step++) {
          const nextIndex = (currentVideo + step) % heroVideos.length;
          if (failedVideos.has(nextIndex)) continue;
          const next = heroVideos[nextIndex];
          next.currentTime = 0;
          // Preserve the previous frame if the browser declines playback.
          next.play().catch(() => {});
          return;
        }
      };

      heroVideos.forEach((video, index) => {
        video.muted = true;
        video.addEventListener('playing', () => {
          currentVideo = index;
          heroVideos.forEach((clip, clipIndex) => {
            clip.classList.toggle('is-active', clipIndex === index);
            if (clipIndex !== index) clip.pause();
          });
        });
        video.addEventListener('ended', playNextHeroVideo);
        video.addEventListener('error', () => {
          failedVideos.add(index);
          if (index === currentVideo || heroVideos[currentVideo].ended || heroVideos[currentVideo].error) {
            playNextHeroVideo();
          }
        }, true);
      });
    }

    // 1. Reveal Animations on Scroll
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 60px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // Immediate and load fallback: Reveal any element already in or near view
    function revealInView() {
      document.querySelectorAll('.reveal:not(.in)').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < (window.innerHeight || document.documentElement.clientHeight) + 120) {
          el.classList.add('in');
          if (io) io.unobserve(el);
        }
      });
    }
    revealInView();
    window.addEventListener('load', revealInView, { once: true });
    setTimeout(revealInView, 350);

    const navEl = document.getElementById('nav');
    const siteHeaderEl = document.getElementById('siteHeader');
    const heroEl = document.getElementById('hero') || document.querySelector('.hero') || document.querySelector('.page-hero');

    function updateNavbarScrolled() {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      if (navEl) navEl.classList.toggle('scrolled', scrollY > 15);
      if (siteHeaderEl) siteHeaderEl.classList.toggle('scrolled-header', scrollY > 25);

      // Determine if past hero section
      let isPastHero = false;
      if (heroEl) {
        const heroBottom = heroEl.offsetTop + heroEl.offsetHeight;
        isPastHero = scrollY > (heroBottom - 120);
      } else {
        isPastHero = scrollY > 300;
      }
      if (navEl) navEl.classList.toggle('nav-floating', isPastHero);
      if (siteHeaderEl) siteHeaderEl.classList.toggle('has-floating-nav', isPastHero);
    }

    // High performance scroll listener using passive event
    window.addEventListener('scroll', updateNavbarScrolled, { passive: true });
    window.addEventListener('resize', updateNavbarScrolled, { passive: true });

    // IntersectionObserver on Hero boundary for zero-overhead floating navbar detection
    if (heroEl && 'IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const isPastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
          if (navEl) navEl.classList.toggle('nav-floating', isPastHero);
          if (siteHeaderEl) siteHeaderEl.classList.toggle('has-floating-nav', isPastHero);
        });
      }, {
        threshold: [0],
        rootMargin: "-80px 0px 0px 0px"
      });
      heroObserver.observe(heroEl);
    }

    // Initial state calculation on page load
    updateNavbarScrolled();

    // 1b. Premium Yellow/Orange Mouse-Following Navigation Spotlight Effect
    const navLinksEl = document.getElementById('nav-links') || document.querySelector('.navlinks');
    if (navLinksEl && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      let spotlight = navLinksEl.querySelector('.nav-cursor-spotlight');
      if (!spotlight) {
        spotlight = document.createElement('div');
        spotlight.className = 'nav-cursor-spotlight';
        spotlight.setAttribute('aria-hidden', 'true');
        navLinksEl.prepend(spotlight);
      }

      let currentX = 0;
      let currentY = 0;
      let targetX = 0;
      let targetY = 0;
      let isInside = false;
      let rafId = null;
      const spotW = 100;
      const spotH = 38;

      function renderSpotlight() {
        // High-precision smooth easing (lerp)
        currentX += (targetX - currentX) * 0.18;
        currentY += (targetY - currentY) * 0.18;

        spotlight.style.transform = `translate3d(${Math.round(currentX - spotW / 2)}px, ${Math.round(currentY - spotH / 2)}px, 0)`;

        if (isInside || Math.abs(targetX - currentX) > 0.25 || Math.abs(targetY - currentY) > 0.25) {
          rafId = requestAnimationFrame(renderSpotlight);
        } else {
          rafId = null;
        }
      }

      navLinksEl.addEventListener('mouseenter', (e) => {
        const rect = navLinksEl.getBoundingClientRect();
        targetX = e.clientX - rect.left;
        targetY = e.clientY - rect.top;
        currentX = targetX;
        currentY = targetY;
        spotlight.style.transform = `translate3d(${Math.round(currentX - spotW / 2)}px, ${Math.round(currentY - spotH / 2)}px, 0)`;
        spotlight.style.opacity = '1';
        isInside = true;
        if (!rafId) rafId = requestAnimationFrame(renderSpotlight);
      });

      navLinksEl.addEventListener('mousemove', (e) => {
        const rect = navLinksEl.getBoundingClientRect();
        targetX = e.clientX - rect.left;
        targetY = e.clientY - rect.top;
        isInside = true;
        if (!rafId) rafId = requestAnimationFrame(renderSpotlight);
      });

      navLinksEl.addEventListener('mouseleave', () => {
        isInside = false;
        spotlight.style.opacity = '0';
      });
    }

        // Hero Spider Animation Auto-Trigger on Right Side
    const spiderHeroRig = document.getElementById('spiderHeroRig');
    if (spiderHeroRig) {
      function triggerSpiderSequence() {
        spiderHeroRig.classList.remove('active', 'settled');
        void spiderHeroRig.offsetWidth; // Force reflow
        setTimeout(() => {
          spiderHeroRig.classList.add('active');
        }, 300);
        setTimeout(() => {
          spiderHeroRig.classList.add('settled');
        }, 3800);
      }

      if (document.readyState === 'complete') {
        triggerSpiderSequence();
      } else {
        window.addEventListener('load', triggerSpiderSequence, { once: true });
        setTimeout(() => {
          if (!spiderHeroRig.classList.contains('active')) {
            triggerSpiderSequence();
          }
        }, 1200);
      }

      // Interactive click / touch on spider: quick startled jump
      const heroSpider = document.getElementById('heroSpider');
      if (heroSpider) {
        heroSpider.addEventListener('click', () => {
          spiderHeroRig.classList.remove('settled');
          heroSpider.style.animation = 'none';
          void heroSpider.offsetWidth;
          heroSpider.style.animation = 'spiderStartleJump 0.85s cubic-bezier(0.16, 1, 0.3, 1)';
          setTimeout(() => {
            heroSpider.style.animation = '';
            spiderHeroRig.classList.add('settled');
          }, 850);
        });
      }
    }

    // 2. Pest Guide Tabs (services.html)
    const pestInfo = {
      termites: {
        image: 'images/pests/termites.jpg',
        alt: 'Subterranean termites',
        title: 'Termites',
        desc: 'Subterranean termites eat through timber framing unseen, often for years before any damage shows.',
        signs: [
          'Mud tubes along brickwork, weep holes or foundations',
          'Hollow-sounding skirting boards and door frames',
          'Doors and windows that suddenly stick'
        ],
        treatment: 'A thorough inspection to AS 3660.2, then a chemical soil barrier or baiting system to protect the whole home.'
      },
      cockroaches: {
        image: 'images/pests/cockroaches.jpg',
        alt: 'American cockroach',
        title: 'Cockroaches & Ants',
        desc: 'Cockroaches spread bacteria around kitchens and pantries, and ant trails can quickly take over a home.',
        signs: [
          'Droppings like ground pepper in pantry corners',
          'Egg cases behind fridges and dishwashers',
          'Ant trails along skirting boards and benches'
        ],
        treatment: 'Targeted gel baits and non-repellent treatments that wipe out the colony, not just the pests you can see.'
      },
      spiders: {
        image: 'images/pests/spiders.jpg',
        alt: 'Black widow spider, a close relative of the redback',
        title: 'Spiders',
        desc: 'Redbacks, funnel-webs and white-tails shelter around eaves, gardens, sheds and outdoor furniture.',
        signs: [
          'Funnel webs around downpipes and weep holes',
          'Egg sacs in shed corners and garage door tracks',
          'Spiders near doorways at night'
        ],
        treatment: 'A perimeter treatment around the home, plus eaves, roof void and garden areas where spiders shelter.'
      },
      rodents: {
        position: '60% 50%', // keep the head in frame
        image: 'images/pests/rodents.jpg',
        alt: 'House rat',
        title: 'Rats & Mice',
        desc: 'Rodents chew through wiring and contaminate roof insulation and stored food.',
        signs: [
          'Scratching in the ceiling at night',
          'Droppings along skirting boards and in the pantry',
          'Gnaw marks on pipes, cables and timber'
        ],
        treatment: 'Secure, tamper-resistant bait stations, plus advice on sealing the gaps they use to get in.'
      },
      fleas: {
        position: '75% 50%', // keep the head in frame
        image: 'images/pests/fleas.jpg',
        alt: 'Adult bed bug',
        title: 'Fleas & Bed Bugs',
        desc: 'Fleas and bed bugs hide in carpets, pet bedding and mattress seams.',
        signs: [
          'Pets scratching more than usual',
          'Small itchy bites on ankles and legs',
          'Tiny dark stains along mattress seams'
        ],
        treatment: 'Carpet, bedding and pet-area treatments with an insect growth regulator to break the breeding cycle.'
      }
    };

    // Preload the pest photos so switching tabs is instant
    if (document.getElementById('diag-image')) {
      Object.values(pestInfo).forEach(p => { new Image().src = p.image; });
    }

    document.querySelectorAll('.diag-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const data = pestInfo[tab.dataset.pest];
        if (!data) return;
        document.querySelectorAll('.diag-tab').forEach(t => t.classList.toggle('active', t === tab));
        const img = document.getElementById('diag-image');
        if (img) {
          img.src = data.image;
          img.alt = data.alt;
          img.style.objectPosition = data.position || '50% 50%';
        }
        document.getElementById('diag-title').textContent = data.title;
        document.getElementById('diag-desc').textContent = data.desc;
        data.signs.forEach((sign, i) => {
          document.getElementById(`diag-sign-${i + 1}`).textContent = sign;
        });
        document.getElementById('diag-treatment').textContent = data.treatment;
      });
    });

    // 3. FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(header => {
      header.addEventListener('click', () => {
        const parent = header.parentElement;
        const isOpen = parent.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('open'));
        if (!isOpen) {
          parent.classList.add('open');
        }
      });
    });



    // 5. Mobile Navigation Drawer
    const mobileToggle = document.getElementById('navMobileToggle');
    const mobileDrawer = document.getElementById('mobileNavDrawer');
    const mobileBackdrop = document.getElementById('mobileNavBackdrop');
    const mobileClose = document.getElementById('mobileDrawerClose');

    function openMobileDrawer() {
      if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'true');
      if (mobileDrawer) mobileDrawer.classList.add('active');
      if (mobileBackdrop) mobileBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileDrawer() {
      if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
      if (mobileDrawer) mobileDrawer.classList.remove('active');
      if (mobileBackdrop) mobileBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (mobileToggle) mobileToggle.addEventListener('click', openMobileDrawer);
    if (mobileClose) mobileClose.addEventListener('click', closeMobileDrawer);
    if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileDrawer);

    // Close drawer when any mobile link is clicked
    document.querySelectorAll('.mobile-nav-links a').forEach(a => {
      a.addEventListener('click', closeMobileDrawer);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileDrawer();
    });

    // 6. Quote Request Form (contact.html)
    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
      const statusEl = document.getElementById('quoteFormStatus');
      const submitBtn = quoteForm.querySelector('button[type="submit"]');
      const setStatus = (msg, type) => {
        statusEl.textContent = msg;
        statusEl.className = 'form-status' + (type ? ' is-' + type : '');
      };

      quoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!quoteForm.checkValidity()) {
          quoteForm.reportValidity();
          return;
        }
        const data = new FormData(quoteForm);
        if (data.get('botcheck')) return;

        const key = data.get('access_key');
        if (!key || key === 'YOUR_WEB3FORMS_ACCESS_KEY') {
          // No form service configured yet: hand the enquiry to the visitor's email app rather than lose it.
          const lines = [['Name', 'name'], ['Phone', 'phone'], ['Email', 'email'], ['Suburb', 'suburb'],
            ['Property type', 'property_type'], ['Service', 'service'], ['Message', 'message']]
            .map(([label, field]) => `${label}: ${data.get(field) || '-'}`);
          window.location.href = 'mailto:info@creepycrawly.com.au,creepysw@gmail.com?subject=' + encodeURIComponent('Quote request') +
            '&body=' + encodeURIComponent(lines.join('\n'));
          setStatus('Your email app should open with your details filled in. Prefer to talk? Call 1800 814 199.', 'success');
          return;
        }

        submitBtn.disabled = true;
        setStatus('Sending\u2026');
        try {
          const res = await fetch(quoteForm.action, { method: 'POST', headers: { Accept: 'application/json' }, body: data });
          const json = await res.json();
          if (!res.ok || !json.success) throw new Error(json.message || 'Request failed');
          quoteForm.reset();
          setStatus("Thanks! We've received your request and will be in touch shortly.", 'success');
        } catch (err) {
          setStatus('Sorry, something went wrong sending your request. Please call us on 1800 814 199.', 'error');
        } finally {
          submitBtn.disabled = false;
        }
      });
    }

    // 7. Reviews carousel (homepage): slides one card at a time, pauses on hover/focus
    const reviewTrack = document.getElementById('reviewTrack');
    const reviewDots = document.getElementById('reviewDots');
    if (reviewTrack && reviewDots) {
      const cards = Array.from(reviewTrack.children);
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let pages = 1;
      let current = 0;
      let timer = null;

      const step = () => cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : reviewTrack.clientWidth;
      const perView = () => Math.max(1, Math.round(reviewTrack.clientWidth / step()));

      function markDot() {
        Array.from(reviewDots.children).forEach((dot, i) => dot.setAttribute('aria-current', i === current ? 'true' : 'false'));
      }

      function goTo(i) {
        current = (i + pages) % pages;
        reviewTrack.scrollTo({ left: current * step() });
        markDot();
      }

      function restart() {
        clearInterval(timer);
        if (!reduceMotion && pages > 1) timer = setInterval(() => goTo(current + 1), 5000);
      }

      function buildDots() {
        pages = Math.max(1, cards.length - perView() + 1);
        current = Math.min(current, pages - 1);
        reviewDots.innerHTML = '';
        for (let i = 0; i < pages; i++) {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.setAttribute('aria-label', `Show reviews from ${i + 1}`);
          dot.addEventListener('click', () => { goTo(i); restart(); });
          reviewDots.appendChild(dot);
        }
        markDot();
      }

      reviewTrack.addEventListener('scroll', () => {
        const i = Math.min(pages - 1, Math.round(reviewTrack.scrollLeft / step()));
        if (i !== current) {
          current = i;
          markDot();
        }
      }, { passive: true });

      const prevBtn = document.getElementById('reviewPrev');
      const nextBtn = document.getElementById('reviewNext');
      if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); restart(); });
      if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); restart(); });

      const carousel = reviewTrack.parentElement;
      carousel.addEventListener('mouseenter', () => clearInterval(timer));
      carousel.addEventListener('mouseleave', restart);
      carousel.addEventListener('focusin', () => clearInterval(timer));
      carousel.addEventListener('focusout', restart);
      window.addEventListener('resize', () => { buildDots(); restart(); }, { passive: true });

      buildDots();
      restart();
    }

    // 7. Fixed "Chat With Us" Widget Auto-Initializer
    if (!window.CreepyCrawlyChat && !document.querySelector('script[src*="chat-widget.js"]')) {
      const chatScript = document.createElement('script');
      chatScript.src = 'js/chat-widget.js?v=1';
      chatScript.defer = true;
      document.body.appendChild(chatScript);
    }
