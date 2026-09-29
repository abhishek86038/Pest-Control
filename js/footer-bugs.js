/**
 * Creepy Crawly Pest Control — Interactive Footer Bugs Simulation
 * "footer page pe chhota chhota keeda makoda chalte hua dikha do jayada nahi kuch kuch bas jidhar mouse le jaun sab udhar hi aye aaisa"
 * 
 * Features:
 * - 8 realistic, tiny crawling critters (4 ants, 2 beetles, 2 spiders).
 * - Procedural articulated leg walking cycles, antennae wiggle, and shell highlights.
 * - Actively scurries towards mouse cursor anywhere across the footer.
 * - Natural flocking/foraging offsets around the cursor so they don't awkwardly stack.
 * - Startle scatter effect if user clicks inside the footer.
 * - High performance 60fps canvas, zero layout thrashing, pointer-events: none.
 */

(function () {
  'use strict';

  function initFooterBugs() {
    const footer = document.querySelector('footer');
    if (!footer) return;

    // Check if canvas already exists
    let canvas = document.getElementById('footer-bugs-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'footer-bugs-canvas';
      canvas.className = 'footer-bugs-canvas';
      footer.style.position = 'relative';
      footer.style.overflow = 'hidden';
      footer.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    function resizeCanvas() {
      const rect = footer.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;

      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();

    // Mouse Tracking State
    const mouse = {
      x: width * 0.5,
      y: height * 0.5,
      isOver: false,
      lastMoveTime: 0
    };

    function updateMousePosition(clientX, clientY) {
      const rect = footer.getBoundingClientRect();
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        mouse.x = clientX - rect.left;
        mouse.y = clientY - rect.top;
        mouse.isOver = true;
        mouse.lastMoveTime = performance.now();
      } else {
        mouse.isOver = false;
      }
    }

    window.addEventListener('mousemove', (e) => {
      updateMousePosition(e.clientX, e.clientY);
    }, { passive: true });

    footer.addEventListener('mouseenter', (e) => {
      updateMousePosition(e.clientX, e.clientY);
    }, { passive: true });

    footer.addEventListener('mouseleave', () => {
      mouse.isOver = false;
    }, { passive: true });

    // Touch support for mobile devices
    footer.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    footer.addEventListener('touchend', () => {
      mouse.isOver = false;
    }, { passive: true });

    // Click startle scatter interaction
    footer.addEventListener('click', (e) => {
      const rect = footer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      critters.forEach(bug => {
        const dx = bug.x - clickX;
        const dy = bug.y - clickY;
        const d = Math.hypot(dx, dy);
        if (d < 180) {
          bug.speed = bug.maxSpeed * 1.6;
          bug.angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.6;
          bug.scatterTimer = 35;
        }
      });
    }, { passive: true });

    // Species configurations (realistic warm tones against dark footer #141414)
    const SPECIES_CONFIGS = [
      { type: 'ant', scale: 1.05, maxSpeed: 4.2, color: '#C25E00', accent: '#F59E0B' },
      { type: 'ant', scale: 0.95, maxSpeed: 3.9, color: '#9A3412', accent: '#EA580C' },
      { type: 'ant', scale: 1.15, maxSpeed: 4.4, color: '#B45309', accent: '#FBBF24' },
      { type: 'ant', scale: 0.90, maxSpeed: 4.0, color: '#78350F', accent: '#D97706' },
      { type: 'beetle', scale: 1.10, maxSpeed: 3.2, color: '#854D0E', accent: '#FDE047' },
      { type: 'beetle', scale: 1.00, maxSpeed: 3.0, color: '#713F12', accent: '#EAB308' },
      { type: 'spider', scale: 1.05, maxSpeed: 4.6, color: '#451A03', accent: '#F97316' },
      { type: 'spider', scale: 0.95, maxSpeed: 4.8, color: '#3B1D0E', accent: '#FB923C' },
    ];

    class Critter {
      constructor(config, index) {
        this.type = config.type;
        this.scale = config.scale;
        this.maxSpeed = config.maxSpeed;
        this.color = config.color;
        this.accent = config.accent;
        this.index = index;

        // Position & Heading
        this.x = Math.random() * (width || 800);
        this.y = Math.random() * (height || 300);
        this.angle = Math.random() * Math.PI * 2;
        this.targetAngle = this.angle;
        this.speed = 0;
        this.legPhase = Math.random() * 10;
        this.scatterTimer = 0;

        // Spread-out offset around mouse so they form a curious ring rather than clump on 1 pixel
        const ringAngle = (index / SPECIES_CONFIGS.length) * Math.PI * 2 + Math.random() * 0.4;
        const ringDist = 26 + (index % 3) * 16;
        this.offsetX = Math.cos(ringAngle) * ringDist;
        this.offsetY = Math.sin(ringAngle) * ringDist;

        // Autonomous wander timers
        this.wanderTimer = Math.random() * 80;
        this.wanderTargetX = this.x;
        this.wanderTargetY = this.y;
      }

      update() {
        let destX, destY;

        if (this.scatterTimer > 0) {
          this.scatterTimer--;
          // Moving away from startle
          this.x += Math.cos(this.angle) * this.speed;
          this.y += Math.sin(this.angle) * this.speed;
          this.legPhase += this.speed * 0.45;
          return;
        }

        if (mouse.isOver) {
          // Attracted to mouse position with individual offset
          destX = mouse.x + this.offsetX;
          destY = mouse.y + this.offsetY;
        } else {
          // Relaxed wandering inside footer
          this.wanderTimer--;
          if (this.wanderTimer <= 0) {
            this.wanderTimer = 70 + Math.random() * 140;
            const margin = 35;
            this.wanderTargetX = margin + Math.random() * Math.max(100, width - margin * 2);
            this.wanderTargetY = margin + Math.random() * Math.max(80, height - margin * 2);
          }
          destX = this.wanderTargetX;
          destY = this.wanderTargetY;
        }

        const dx = destX - this.x;
        const dy = destY - this.y;
        const dist = Math.hypot(dx, dy);

        // Desired angle towards destination
        this.targetAngle = Math.atan2(dy, dx);

        // Smooth angle rotation (normalize delta to [-PI, PI])
        let diff = this.targetAngle - this.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;

        const turnSpeed = mouse.isOver ? 0.22 : 0.09;
        this.angle += diff * turnSpeed;

        // Speed management
        let targetSpeed = 0;
        if (mouse.isOver) {
          if (dist > 18) {
            // Scurry swiftly to mouse position
            targetSpeed = Math.min(this.maxSpeed, Math.max(1.8, dist * 0.065));
          } else {
            // Reached near cursor: actively forage/mill around
            targetSpeed = 0.7 + Math.sin(performance.now() * 0.006 + this.index) * 0.45;
          }
        } else {
          // Relaxed idle walk
          targetSpeed = dist > 20 ? this.maxSpeed * 0.4 : 0.2;
        }

        // Smooth acceleration
        this.speed += (targetSpeed - this.speed) * 0.18;

        // Advance position
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // Keep strictly inside footer bounds
        const pad = 10;
        if (this.x < pad) { this.x = pad; this.angle = 0; }
        if (this.x > width - pad) { this.x = width - pad; this.angle = Math.PI; }
        if (this.y < pad) { this.y = pad; this.angle = Math.PI / 2; }
        if (this.y > height - pad) { this.y = height - pad; this.angle = -Math.PI / 2; }

        // Animate legs
        this.legPhase += this.speed * 0.42 + 0.06;
      }

      draw(c) {
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.angle);
        c.scale(this.scale, this.scale);

        if (this.type === 'ant') {
          this.drawAnt(c);
        } else if (this.type === 'beetle') {
          this.drawBeetle(c);
        } else if (this.type === 'spider') {
          this.drawSpider(c);
        }

        c.restore();
      }

      // 1. ANT (6 jointed legs alternating tripod gait, 3 body segments, long antennae)
      drawAnt(c) {
        const t = this.legPhase;
        c.strokeStyle = '#271206';
        c.fillStyle = this.color;
        c.lineWidth = 1.25;
        c.lineCap = 'round';
        c.lineJoin = 'round';

        // 6 Legs
        const legOffsets = [-2, 1, 4];
        const anglesL = [
          -0.65 + Math.sin(t) * 0.38,
          -1.55 - Math.sin(t) * 0.38,
          -2.45 + Math.sin(t) * 0.38
        ];
        const anglesR = [
          0.65 - Math.sin(t) * 0.38,
          1.55 + Math.sin(t) * 0.38,
          2.45 - Math.sin(t) * 0.38
        ];

        // Draw Left Legs
        for (let i = 0; i < 3; i++) {
          c.beginPath();
          c.moveTo(legOffsets[i], -1.5);
          const ax = legOffsets[i] + Math.cos(anglesL[i]) * 4.8;
          const ay = -1.5 + Math.sin(anglesL[i]) * 4.8;
          const bx = ax + Math.cos(anglesL[i] - 0.4) * 5.2;
          const by = ay + Math.sin(anglesL[i] - 0.4) * 5.2;
          c.lineTo(ax, ay);
          c.lineTo(bx, by);
          c.stroke();
        }

        // Draw Right Legs
        for (let i = 0; i < 3; i++) {
          c.beginPath();
          c.moveTo(legOffsets[i], 1.5);
          const ax = legOffsets[i] + Math.cos(anglesR[i]) * 4.8;
          const ay = 1.5 + Math.sin(anglesR[i]) * 4.8;
          const bx = ax + Math.cos(anglesR[i] + 0.4) * 5.2;
          const by = ay + Math.sin(anglesR[i] + 0.4) * 5.2;
          c.lineTo(ax, ay);
          c.lineTo(bx, by);
          c.stroke();
        }

        // Long mobile antennae (front)
        const antWiggle = Math.sin(t * 1.5) * 0.2;
        c.strokeStyle = '#4A1D00';
        c.lineWidth = 0.95;
        // Left antenna
        c.beginPath();
        c.moveTo(6.5, -1.2);
        c.lineTo(10, -3.8 + antWiggle * 2.2);
        c.lineTo(14.5, -4.8 + antWiggle * 3.5);
        c.stroke();
        // Right antenna
        c.beginPath();
        c.moveTo(6.5, 1.2);
        c.lineTo(10, 3.8 - antWiggle * 2.2);
        c.lineTo(14.5, 4.8 - antWiggle * 3.5);
        c.stroke();

        // Abdomen (gaster) - rear
        c.beginPath();
        c.ellipse(-5.5, 0, 4.4, 2.9, 0, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();
        c.strokeStyle = '#1A0802';
        c.lineWidth = 0.8;
        c.stroke();

        // Thorax - middle
        c.beginPath();
        c.ellipse(0.5, 0, 2.5, 1.7, 0, 0, Math.PI * 2);
        c.fillStyle = this.accent;
        c.fill();
        c.stroke();

        // Head - front
        c.beginPath();
        c.ellipse(5.5, 0, 2.6, 2.2, 0, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();
        c.stroke();

        // Tiny eye dots
        c.fillStyle = '#000000';
        c.fillRect(5.8, -1.5, 0.9, 0.9);
        c.fillRect(5.8, 0.7, 0.9, 0.9);
      }

      // 2. BEETLE (oval carapace, shell line, glossy gold reflection)
      drawBeetle(c) {
        const t = this.legPhase;
        c.strokeStyle = '#231405';
        c.lineWidth = 1.35;
        c.lineCap = 'round';
        c.lineJoin = 'round';

        // 6 Sturdy scurrying legs
        const anglesL = [
          -0.75 + Math.sin(t) * 0.34,
          -1.6 - Math.sin(t) * 0.34,
          -2.35 + Math.sin(t) * 0.34
        ];
        const anglesR = [
          0.75 - Math.sin(t) * 0.34,
          1.6 + Math.sin(t) * 0.34,
          2.35 - Math.sin(t) * 0.34
        ];
        const offsets = [-1, 2, 5];

        for (let i = 0; i < 3; i++) {
          // Left
          c.beginPath();
          c.moveTo(offsets[i], -3);
          const lx1 = offsets[i] + Math.cos(anglesL[i]) * 4.2;
          const ly1 = -3 + Math.sin(anglesL[i]) * 4.2;
          const lx2 = lx1 + Math.cos(anglesL[i] - 0.5) * 4.8;
          const ly2 = ly1 + Math.sin(anglesL[i] - 0.5) * 4.8;
          c.lineTo(lx1, ly1);
          c.lineTo(lx2, ly2);
          c.stroke();

          // Right
          c.beginPath();
          c.moveTo(offsets[i], 3);
          const rx1 = offsets[i] + Math.cos(anglesR[i]) * 4.2;
          const ry1 = 3 + Math.sin(anglesR[i]) * 4.2;
          const rx2 = rx1 + Math.cos(anglesR[i] + 0.5) * 4.8;
          const ry2 = ry1 + Math.sin(anglesR[i] + 0.5) * 4.8;
          c.lineTo(rx1, ry1);
          c.lineTo(rx2, ry2);
          c.stroke();
        }

        // Tiny antennae
        c.lineWidth = 0.95;
        c.beginPath();
        c.moveTo(6.5, -1);
        c.lineTo(10.5, -3);
        c.moveTo(6.5, 1);
        c.lineTo(10.5, 3);
        c.stroke();

        // Carapace (Hard Elytra Shell)
        c.beginPath();
        c.ellipse(-0.5, 0, 6.0, 4.0, 0, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();
        c.strokeStyle = '#180B02';
        c.lineWidth = 0.95;
        c.stroke();

        // Shell wing division line
        c.beginPath();
        c.moveTo(-6.2, 0);
        c.lineTo(3.5, 0);
        c.strokeStyle = 'rgba(20, 8, 2, 0.75)';
        c.stroke();

        // Shell metallic sheen/highlight
        c.beginPath();
        c.ellipse(0, -1.3, 4.0, 1.3, -0.1, 0, Math.PI * 2);
        c.fillStyle = 'rgba(253, 224, 71, 0.4)';
        c.fill();

        // Pronotum / Head
        c.beginPath();
        c.ellipse(5, 0, 2.3, 2.8, 0, 0, Math.PI * 2);
        c.fillStyle = '#261205';
        c.fill();
        c.stroke();
      }

      // 3. SPIDER (8 spindly jointed legs, rapid darting gait, cephalothorax)
      drawSpider(c) {
        const t = this.legPhase;
        c.strokeStyle = '#1F0C04';
        c.lineWidth = 1.15;
        c.lineCap = 'round';
        c.lineJoin = 'round';

        // 8 articulated legs
        const spiderAnglesL = [
          -0.45 + Math.sin(t) * 0.35,
          -1.0 - Math.sin(t) * 0.35,
          -1.75 + Math.sin(t) * 0.35,
          -2.45 - Math.sin(t) * 0.35
        ];
        const spiderAnglesR = [
          0.45 - Math.sin(t) * 0.35,
          1.0 + Math.sin(t) * 0.35,
          1.75 - Math.sin(t) * 0.35,
          2.45 + Math.sin(t) * 0.35
        ];

        for (let i = 0; i < 4; i++) {
          const ox = 2 - i * 1.4;

          // Left leg (bent knee up then out)
          c.beginPath();
          c.moveTo(ox, -1.5);
          const kxL = ox + Math.cos(spiderAnglesL[i]) * 7.0;
          const kyL = -1.5 + Math.sin(spiderAnglesL[i]) * 7.0;
          const fxL = kxL + Math.cos(spiderAnglesL[i] - 0.42) * 6.5;
          const fyL = kyL + Math.sin(spiderAnglesL[i] - 0.42) * 6.5;
          c.lineTo(kxL, kyL);
          c.lineTo(fxL, fyL);
          c.stroke();

          // Right leg
          c.beginPath();
          c.moveTo(ox, 1.5);
          const kxR = ox + Math.cos(spiderAnglesR[i]) * 7.0;
          const kyR = 1.5 + Math.sin(spiderAnglesR[i]) * 7.0;
          const fxR = kxR + Math.cos(spiderAnglesR[i] + 0.42) * 6.5;
          const fyR = kyR + Math.sin(spiderAnglesR[i] + 0.42) * 6.5;
          c.lineTo(kxR, kyR);
          c.lineTo(fxR, fyR);
          c.stroke();
        }

        // Abdomen (rear)
        c.beginPath();
        c.ellipse(-3.5, 0, 4.0, 3.4, 0, 0, Math.PI * 2);
        c.fillStyle = this.color;
        c.fill();
        c.strokeStyle = '#120501';
        c.lineWidth = 0.95;
        c.stroke();

        // Abdomen warm highlight stripe
        c.beginPath();
        c.ellipse(-3.5, 0, 2.3, 1.3, 0, 0, Math.PI * 2);
        c.fillStyle = this.accent;
        c.fill();

        // Cephalothorax (front)
        c.beginPath();
        c.ellipse(1.5, 0, 2.5, 2.3, 0, 0, Math.PI * 2);
        c.fillStyle = '#260F04';
        c.fill();
        c.stroke();

        // Pedipalps (front mini-feelers)
        c.lineWidth = 0.85;
        c.beginPath();
        c.moveTo(3.2, -0.8);
        c.lineTo(5.5, -2.0);
        c.moveTo(3.2, 0.8);
        c.lineTo(5.5, 2.0);
        c.stroke();
      }
    }

    // Spawn 8 critters
    const critters = SPECIES_CONFIGS.map((cfg, idx) => new Critter(cfg, idx));

    // Animation Loop
    let animId = null;
    function animate() {
      if (width > 0 && height > 0) {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < critters.length; i++) {
          critters[i].update();
          critters[i].draw(ctx);
        }
      }
      animId = requestAnimationFrame(animate);
    }

    // IntersectionObserver to only animate when footer is in view (saves battery/CPU)
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!animId) animate();
          } else {
            if (animId) {
              cancelAnimationFrame(animId);
              animId = null;
            }
          }
        });
      }, { threshold: 0.02 });
      observer.observe(footer);
    } else {
      animate();
    }
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooterBugs);
  } else {
    initFooterBugs();
  }
})();
