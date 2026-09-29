    // 1. Reveal Animations on Scroll
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // 2. Sticky to Floating Fixed Navbar (Pops out when hero scrolls past)
    const navEl = document.getElementById('nav');
    const heroEl = document.getElementById('hero') || document.querySelector('.hero');

    let wasScrolled = false;
    function updateNavbarScrolled() {
      if (!navEl) return;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const isScrolled = scrollY > 15;
      if (isScrolled !== wasScrolled) {
        wasScrolled = isScrolled;
        navEl.classList.toggle('scrolled', isScrolled);
      }
    }

    // High performance scroll listener using passive event
    window.addEventListener('scroll', updateNavbarScrolled, { passive: true });

    // IntersectionObserver on Hero boundary for zero-overhead floating navbar detection
    if (heroEl && 'IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const isPastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
          navEl.classList.toggle('nav-floating', isPastHero);
        });
      }, {
        threshold: [0],
        rootMargin: "-70px 0px 0px 0px"
      });
      heroObserver.observe(heroEl);
    }

    // Initial state calculation on page load
    updateNavbarScrolled();

    // 3. Interactive Suburb & Postcode Dispatch Checker
    const dispatchData = {
      '4350': { name: 'Toowoomba & Darling Downs', units: 3, nextSlot: 'Tomorrow 8:30 AM', emergency: true },
      '4000': { name: 'Brisbane Metro & Northside', units: 5, nextSlot: 'Today 2:00 PM', emergency: true },
      '4217': { name: 'Gold Coast & Surfers Paradise', units: 2, nextSlot: 'Tomorrow 9:00 AM', emergency: true },
      '4551': { name: 'Sunshine Coast & Caloundra', units: 3, nextSlot: 'Tomorrow 10:30 AM', emergency: true },
      '4700': { name: 'Rockhampton & Gracemere', units: 2, nextSlot: 'Thursday 8:00 AM', emergency: true },
      '2150': { name: 'Sydney Western Suburbs & Parramatta', units: 4, nextSlot: 'Tomorrow 9:30 AM', emergency: true }
    };

    function updateDispatch(inputVal) {
      const clean = inputVal.trim().toLowerCase();
      let match = null;
      for (const [code, info] of Object.entries(dispatchData)) {
        if (clean.includes(code) || clean.includes(info.name.toLowerCase().split(' ')[0])) {
          match = { code, ...info };
          break;
        }
      }

      const badgeEl = document.getElementById('dispatch-badge');
      const detailsEl = document.getElementById('dispatch-details');
      const boxEl = document.getElementById('dispatch-result-box');

      if (match) {
        boxEl.className = 'dispatch-status-box active-dispatch';
        badgeEl.textContent = `🟢 ${match.units} Units Active in ${match.name.split('&')[0].trim()} Today`;
        detailsEl.innerHTML = `Next available inspection slot: <b>${match.nextSlot}</b>.<br>Same-day emergency response guaranteed across <b>${match.code}</b> and surrounding areas.`;
      } else {
        boxEl.className = 'dispatch-status-box active-dispatch';
        badgeEl.textContent = `🟢 Technicians Dispatched Across QLD & NSW`;
        detailsEl.innerHTML = `Priority dispatch confirmed for <b>${inputVal}</b>.<br>Next available service window: <b>Within 24 Hours</b>. Call <b>1800 814 199</b> for immediate allocation.`;
      }
    }

    document.getElementById('check-dispatch-btn').addEventListener('click', () => {
      const val = document.getElementById('postcode-input').value;
      if (val) updateDispatch(val);
    });

    document.getElementById('postcode-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        updateDispatch(e.target.value);
      }
    });

    document.querySelectorAll('.quick-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const code = chip.dataset.code;
        document.getElementById('postcode-input').value = code;
        updateDispatch(code);
      });
    });

    // 4. Interactive Pest Diagnostic Tabs
    const pestInfo = {
      termites: {
        threat: '🚨 Severe Structural Threat · $10K+ Damage Risk',
        threatClass: 'threat-badge threat-severe',
        title: 'Subterranean Termites (White Ants)',
        desc: 'Coptotermes and Schedorhinotermes colonies penetrate structural slabs and timber frames silently. Often unnoticed until catastrophic hollow damage occurs.',
        signs: [
          'Mud tracking conduits along brick weep holes or foundation perimeter',
          'Hollow or papery sound when tapping skirting boards and door jambs',
          'Tight or sticking doors and windows caused by moisture buildup'
        ],
        protocolTitle: 'AS 3660.2 Thermal Scan & Chemical Zone',
        warranty: 'Up to 8 Years Protection'
      },
      cockroaches: {
        threat: '⚠️ High Contamination & Food Safety Risk',
        threatClass: 'threat-badge threat-high',
        title: 'German & American Cockroaches',
        desc: 'Breed aggressively in warm kitchen crevices, sub-floors, and grease traps. Carry Salmonella and trigger severe asthma in children.',
        signs: [
          'Small black pepper-like droppings in pantry corners and behind drawers',
          'Egg capsules (oothecae) hidden behind refrigerators and dishwashers',
          'Unpleasant musty odor lingering in unventilated kitchen cabinets'
        ],
        protocolTitle: 'Micro-Encapsulated Gel Baiting & Void Dusting',
        warranty: '12 Months Free Callback'
      },
      spiders: {
        threat: '⚠️ Venomous Bite & Family Safety Threat',
        threatClass: 'threat-badge threat-high',
        title: 'Redbacks, Funnel-Webs & Huntsmans',
        desc: 'Queensland heat drives dangerous spiders into roof voids, weep holes, children’s play sets, and outdoor furniture.',
        signs: [
          'Dense tangled funnel webs around downpipes and brick weep holes',
          'Silk egg sacs suspended in corners of sheds and garage door tracks',
          'Sightings of nocturnal ground hunters near entry doorways'
        ],
        protocolTitle: 'Perimeter Pyrethroid Shield & Roof Cavity Fogging',
        warranty: '12 Months Free Callback'
      },
      rodents: {
        threat: '⚠️ Wiring Hazard & Disease Transmission',
        threatClass: 'threat-badge threat-high',
        title: 'Rats & Mice (Rodent Invasions)',
        desc: 'Gnaw through electrical wiring causing house fire risks, while fouling roof insulation and wall cavities.',
        signs: [
          'Loud scratching, scampering, or squeaking noises in ceilings at night',
          'Dark capsule-shaped droppings (6–12mm) along baseboards and pantries',
          'Gnaw marks on plastic plumbing pipes and timber framework'
        ],
        protocolTitle: 'Tamper-Proof Rodent Stations & Harbor Sealing',
        warranty: '100% Colony Elimination'
      },
      fleas: {
        threat: 'ℹ️ Pet Discomfort & End-of-Lease Compliance',
        threatClass: 'threat-badge threat-medium',
        title: 'Fleas, Ticks & Bed Bugs',
        desc: 'Parasites inhabiting carpets, pet bedding, and mattress seams. Mandatory eradication for tenant end-of-lease bond returns.',
        signs: [
          'Persistent itching, scratching, or flea dirt in pet fur and carpets',
          'Small itchy red bites on ankles, legs, or clustered along waistlines',
          'Tiny reddish-brown stains or shedding skins along mattress seams'
        ],
        protocolTitle: 'Insect Growth Regulator (IGR) Carpet & Bedding Shield',
        warranty: 'Bond Refund Guarantee'
      }
    };

    document.querySelectorAll('.diag-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.diag-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const key = tab.dataset.pest;
        const data = pestInfo[key];
        if (data) {
          const threatEl = document.getElementById('diag-threat');
          threatEl.className = data.threatClass;
          threatEl.textContent = data.threat;

          document.getElementById('diag-title').textContent = data.title;
          document.getElementById('diag-desc').textContent = data.desc;
          document.getElementById('diag-sign-1').textContent = data.signs[0];
          document.getElementById('diag-sign-2').textContent = data.signs[1];
          document.getElementById('diag-sign-3').textContent = data.signs[2];
          document.getElementById('diag-protocol-title').textContent = data.protocolTitle;
          document.getElementById('diag-warranty').textContent = data.warranty;
        }
      });
    });

    // Quick Pest Selector Cards - Trigger Diagnostic Hub
    document.querySelectorAll('.pest-item-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const pest = card.dataset.pest;
        if (pest) {
          const targetTab = document.querySelector(`.diag-tab[data-pest="${pest}"]`);
          if (targetTab) {
            targetTab.click();
          }
        }
      });
    });

    // 5. 3-Step Instant Quote Calculator
    let calcMultiplier = 1.0;
    let calcBase = 240;
    let selectedSizeLabel = 'Townhouse / Unit';
    let selectedServiceLabel = 'General Pest Defense';

    function recalculatePrice() {
      const gross = Math.round(calcBase * calcMultiplier);
      const finalPrice = Math.max(140, gross - 50); // $50 voucher applied

      document.getElementById('calc-summary-service').textContent = `${selectedServiceLabel} (${selectedSizeLabel.split(' ')[0]})`;
      document.getElementById('calc-base-val').textContent = `$${gross}`;
      document.getElementById('calc-total-val').textContent = `$${finalPrice}`;
    }

    document.querySelectorAll('.calc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const step = btn.dataset.step;
        document.querySelectorAll(`.calc-btn[data-step="${step}"]`).forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        if (step === 'size') {
          calcMultiplier = parseFloat(btn.dataset.multiplier);
          selectedSizeLabel = btn.dataset.label;
        } else if (step === 'service') {
          calcBase = parseFloat(btn.dataset.base);
          selectedServiceLabel = btn.dataset.label;
        }
        recalculatePrice();
      });
    });

    document.getElementById('calc-submit-btn').addEventListener('click', () => {
      const phone = document.getElementById('calc-phone-input').value.trim();
      if (!phone || phone.length < 8) {
        alert('Please enter a valid mobile number (e.g. 0400 123 456) to receive your instant quote and lock in your $50 voucher.');
        document.getElementById('calc-phone-input').focus();
        return;
      }
      alert(`Thank you! Your $50 voucher has been locked in for ${phone}. A senior technician will send your customized estimate and booking options shortly.`);
    });

    // 6. Interactive FAQ Accordion
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

    // 7. Interactive Orbital Logo & Radial Menu
    const orbitalContainer = document.getElementById('orbital-container');
    const orbitalLogoBtn = document.getElementById('orbital-logo-btn');
    const orbitalBackdrop = document.getElementById('orbital-backdrop');

    if (orbitalContainer && orbitalLogoBtn) {
      function toggleOrbitalMenu(open) {
        const shouldOpen = open !== undefined ? open : !orbitalContainer.classList.contains('active');
        if (shouldOpen) {
          orbitalContainer.classList.add('active');
          orbitalLogoBtn.setAttribute('aria-expanded', 'true');
          if (orbitalBackdrop) orbitalBackdrop.classList.add('active');
        } else {
          orbitalContainer.classList.remove('active');
          orbitalLogoBtn.setAttribute('aria-expanded', 'false');
          if (orbitalBackdrop) orbitalBackdrop.classList.remove('active');
        }
      }

      orbitalLogoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleOrbitalMenu();
      });

      if (orbitalBackdrop) {
        orbitalBackdrop.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleOrbitalMenu(false);
        });
      }

      document.querySelectorAll('.orbital-item').forEach(item => {
        item.addEventListener('click', (e) => {
          const href = item.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            e.stopPropagation();
            toggleOrbitalMenu(false);
            if (href === '#nav' || href === '#top' || href === '#') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              const targetEl = document.querySelector(href);
              if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }
          } else if (href) {
            e.preventDefault();
            e.stopPropagation();
            toggleOrbitalMenu(false);
            window.open(href, '_blank', 'noopener,noreferrer');
          }
        });
      });

      document.addEventListener('click', (e) => {
        if (orbitalContainer.classList.contains('active')) {
          if (!orbitalContainer.contains(e.target)) {
            toggleOrbitalMenu(false);
          }
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && orbitalContainer.classList.contains('active')) {
          toggleOrbitalMenu(false);
        }
      });
    }

    // 6. Cinematic Hero Spider Animation Auto-Trigger on Every Page Load/Refresh
    const spiderHeroRig = document.getElementById('spiderHeroRig');
    if (spiderHeroRig) {
      function triggerSpiderSequence() {
        // Clear any previous state and trigger fresh sequence
        spiderHeroRig.classList.remove('active', 'settled');
        void spiderHeroRig.offsetWidth; // Force reflow
        setTimeout(() => {
          spiderHeroRig.classList.add('active');
        }, 200);
        // After descent and treatment fog, settle into permanent lifelike idle on screen
        setTimeout(() => {
          spiderHeroRig.classList.add('settled');
        }, 3200);
      }

      if (document.readyState === 'complete') {
        triggerSpiderSequence();
      } else {
        window.addEventListener('load', triggerSpiderSequence, { once: true });
        // Fallback safety trigger in case load is delayed by slow background video
        setTimeout(() => {
          if (!spiderHeroRig.classList.contains('active')) {
            triggerSpiderSequence();
          }
        }, 1200);
      }
    }

    // 7. Interactive Cockroach Swarm Scurry on Scroll (What Pest Is Invading Section)
    const pestSection = document.getElementById('pest-selector');
    const cockroachLayer = document.getElementById('cockroachSwarmLayer');

    if (pestSection && cockroachLayer) {
      let hasScurried = false;
      let clearTimer = null;
      let startleTimer = null;

      function triggerRoachScurry() {
        if (hasScurried) return;
        hasScurried = true;

        cockroachLayer.classList.remove('cleared');

        // Natural reaction delay (220ms): user clearly spots the roaches crawling before they frantically scatter!
        startleTimer = setTimeout(() => {
          cockroachLayer.classList.add('scurrying');

          // Allow the 1.6s - 1.85s slow scurry animation to fully play out before hiding layer
          clearTimer = setTimeout(() => {
            cockroachLayer.classList.add('cleared');
          }, 2250);
        }, 220);
      }

      function resetRoaches() {
        if (!hasScurried) return;
        hasScurried = false;
        if (startleTimer) clearTimeout(startleTimer);
        if (clearTimer) clearTimeout(clearTimer);
        cockroachLayer.classList.remove('scurrying', 'cleared');
      }

      // IntersectionObserver triggers frantic scurry when section is in clear view
      if ('IntersectionObserver' in window) {
        const roachObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
              triggerRoachScurry();
            } else if (entry.boundingClientRect.top > (window.innerHeight || document.documentElement.clientHeight)) {
              resetRoaches();
            }
          });
        }, {
          threshold: [0.1, 0.2, 0.35],
          rootMargin: '0px 0px -20px 0px'
        });

        roachObserver.observe(pestSection);
      }
    }



