/**
 * Creepy Crawly Sydney - Realistic Living Spider Animation Sequence
 * 
 * Timeline:
 *  0.0s - 0.5s: Hero loads, spider hidden above screen.
 *  0.5s - 1.5s: Shimmering silk thread appears, spider enters from above.
 *  1.5s - 2.8s: Spider descends with independent articulated leg climbing motion.
 *  2.8s - 3.5s: Spider reaches position, hangs, probes air with front legs & pedipalps.
 *  3.5s - 4.5s: Spider crawls sideways with authentic alternating tetrapod gait.
 *  4.5s - 5.5s: Realistic aerosol pest-control mist spray triggers; spider recoils & flails.
 *  5.5s - 6.5s: Spider succumbs to treatment; legs curl into death posture.
 *  6.5s - 7.5s: Thread snaps; limp curled spider drops out of frame under gravity; mist dissipates.
 *  7.5s+      : Completely clear.
 */

(function () {
  'use strict';

  function initSpiderAnimation() {
    const canvas = document.getElementById('heroSpiderCanvas');
    if (!canvas) return;

    const heroSection = document.getElementById('hero') || canvas.parentElement;
    if (!heroSection) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    function resize() {
      const rect = heroSection.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
    }

    resize();
    window.addEventListener('resize', resize);

    // Animation Clock
    let startTime = null;
    let animId = null;

    // Aerosol Mist Particle System
    const mistParticles = [];
    const NUM_MIST_PARTICLES = 360;

    class MistParticle {
      constructor(sourceX, sourceY, targetX, targetY) {
        this.reset(sourceX, sourceY, targetX, targetY);
      }

      reset(sourceX, sourceY, targetX, targetY) {
        this.x = sourceX + (Math.random() - 0.5) * 12;
        this.y = sourceY + (Math.random() - 0.5) * 12;

        const angleToTarget = Math.atan2(targetY - sourceY, targetX - sourceX);
        const spread = (Math.random() - 0.5) * 0.42;
        const angle = angleToTarget + spread;
        const speed = 240 + Math.random() * 260;

        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.radius = 3 + Math.random() * 5;
        this.maxRadius = 24 + Math.random() * 32;
        this.alpha = 0.55 + Math.random() * 0.35;
        this.life = 0;
        this.maxLife = 0.85 + Math.random() * 0.75;
        this.active = false;
        this.turbSeed = Math.random() * 100;
      }

      update(dt) {
        if (!this.active) return;
        this.life += dt;
        const progress = this.life / this.maxLife;

        // Turbulence and drag deceleration
        this.vx *= 0.94;
        this.vy *= 0.94;
        this.x += this.vx * dt + Math.sin(this.turbSeed + this.life * 8) * 14 * dt;
        this.y += this.vy * dt + Math.cos(this.turbSeed + this.life * 6) * 10 * dt;

        // Expansion into fine aerosol plume
        this.currentRadius = this.radius + (this.maxRadius - this.radius) * Math.pow(progress, 0.7);
        this.currentAlpha = this.alpha * (1 - Math.pow(progress, 1.4));

        if (this.life >= this.maxLife) {
          this.active = false;
        }
      }

      draw(c) {
        if (!this.active || this.currentAlpha <= 0.01) return;
        c.save();
        const grad = c.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.currentRadius
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${this.currentAlpha * 0.75})`);
        grad.addColorStop(0.35, `rgba(240, 248, 255, ${this.currentAlpha * 0.45})`);
        grad.addColorStop(0.75, `rgba(220, 235, 250, ${this.currentAlpha * 0.15})`);
        grad.addColorStop(1, 'rgba(210, 230, 245, 0)');

        c.fillStyle = grad;
        c.beginPath();
        c.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    // Kinematic Joint Angles for 8 Legs
    // Legs: L1, L2, L3, L4 (left) and R1, R2, R3, R4 (right)
    // Base angles relative to body heading
    const BASE_LEG_CONFIG = [
      { side: -1, index: 0, femurLen: 20, tibiaLen: 24, baseAngle: -0.95 }, // L1
      { side: -1, index: 1, femurLen: 18, tibiaLen: 22, baseAngle: -1.35 }, // L2
      { side: -1, index: 2, femurLen: 16, tibiaLen: 20, baseAngle: -1.85 }, // L3
      { side: -1, index: 3, femurLen: 22, tibiaLen: 28, baseAngle: -2.45 }, // L4
      { side: 1,  index: 0, femurLen: 20, tibiaLen: 24, baseAngle: 0.95 },  // R1
      { side: 1,  index: 1, femurLen: 18, tibiaLen: 22, baseAngle: 1.35 },  // R2
      { side: 1,  index: 2, femurLen: 16, tibiaLen: 20, baseAngle: 1.85 },  // R3
      { side: 1,  index: 3, femurLen: 22, tibiaLen: 28, baseAngle: 2.45 }   // R4
    ];

    // Helper: Draw anatomically accurate jointed leg
    function drawSpiderLeg(c, originX, originY, baseAngle, femurLen, tibiaLen, jointCurl, legProgress) {
      // Joint 1: Coxa to Knee (Femur)
      const kneeX = originX + Math.cos(baseAngle) * femurLen;
      const kneeY = originY + Math.sin(baseAngle) * femurLen;

      // Joint 2: Knee to Tarsus Foot (Tibia + Metatarsus)
      const tibiaAngle = baseAngle + jointCurl;
      const footX = kneeX + Math.cos(tibiaAngle) * tibiaLen;
      const footY = kneeY + Math.sin(tibiaAngle) * tibiaLen;

      // Draw Femur segment (thick, tapered)
      c.beginPath();
      c.moveTo(originX, originY);
      c.lineTo(kneeX, kneeY);
      c.strokeStyle = '#1a120e';
      c.lineWidth = 2.4;
      c.lineCap = 'round';
      c.lineJoin = 'round';
      c.stroke();

      // Highlight on femur segment
      c.beginPath();
      c.moveTo(originX, originY);
      c.lineTo(kneeX, kneeY);
      c.strokeStyle = 'rgba(74, 52, 40, 0.45)';
      c.lineWidth = 1.0;
      c.stroke();

      // Knee joint knuckle
      c.beginPath();
      c.arc(kneeX, kneeY, 1.6, 0, Math.PI * 2);
      c.fillStyle = '#2d1e16';
      c.fill();

      // Draw Tibia & Tarsus (fine spindly lower leg)
      c.beginPath();
      c.moveTo(kneeX, kneeY);
      c.lineTo(footX, footY);
      c.strokeStyle = '#140d0a';
      c.lineWidth = 1.5;
      c.stroke();

      // Tiny claw tip
      const clawAngle = tibiaAngle + 0.3;
      c.beginPath();
      c.moveTo(footX, footY);
      c.lineTo(footX + Math.cos(clawAngle) * 3, footY + Math.sin(clawAngle) * 3);
      c.strokeStyle = '#090503';
      c.lineWidth = 1.0;
      c.stroke();
    }

    // Main Draw Spider Function
    function renderSpider(c, x, y, heading, legPhases, deathCurl, scale = 1.0) {
      c.save();
      c.translate(x, y);
      c.scale(scale, scale);
      c.rotate(heading);

      // Soft physical cast shadow below spider
      c.shadowColor = 'rgba(0, 0, 0, 0.65)';
      c.shadowBlur = 14;
      c.shadowOffsetX = 4;
      c.shadowOffsetY = 8;

      // 1. Draw 8 Articulated Legs
      BASE_LEG_CONFIG.forEach((leg, i) => {
        const sideOffset = leg.side * 4.5;
        const originX = -4 + leg.index * 3.2;
        const originY = sideOffset;

        // Dynamic joint calculation
        let dynamicAngle = leg.baseAngle;
        let dynamicCurl = (leg.side === -1 ? 0.75 : -0.75);

        // Incorporate gait / reach phase
        const phase = legPhases[i] || 0;
        dynamicAngle += phase.angleOffset;
        dynamicCurl += phase.curlOffset;

        // Death curl effect: legs curl tight into center
        if (deathCurl > 0) {
          const curlDirection = leg.side === -1 ? 1.4 : -1.4;
          dynamicAngle = leg.baseAngle * (1 - deathCurl * 0.45) + (leg.side === -1 ? -1.57 : 1.57) * deathCurl * 0.5;
          dynamicCurl = dynamicCurl * (1 - deathCurl) + (curlDirection * deathCurl * 1.8);
        }

        drawSpiderLeg(c, originX, originY, dynamicAngle, leg.femurLen, leg.tibiaLen, dynamicCurl);
      });

      // 2. Draw Spinnerets at rear
      c.fillStyle = '#1c130e';
      c.beginPath();
      c.arc(-18, -1.5, 1.8, 0, Math.PI * 2);
      c.arc(-18, 1.5, 1.8, 0, Math.PI * 2);
      c.fill();

      // 3. Draw Abdomen (Opisthosoma) with 3D anatomical shading
      c.beginPath();
      c.ellipse(-10, 0, 11, 7.5, 0, 0, Math.PI * 2);
      const abGrad = c.createRadialGradient(-10, -2.5, 1.5, -10, 0, 11);
      abGrad.addColorStop(0, '#422a1d');
      abGrad.addColorStop(0.35, '#261710');
      abGrad.addColorStop(0.8, '#140c08');
      abGrad.addColorStop(1, '#090503');
      c.fillStyle = abGrad;
      c.fill();

      // Abdomen subtle chevron stripe markings (House spider anatomy)
      c.strokeStyle = 'rgba(102, 68, 48, 0.4)';
      c.lineWidth = 1.0;
      for (let ch = -15; ch <= -6; ch += 3) {
        c.beginPath();
        c.moveTo(ch, -3.5);
        c.lineTo(ch + 2, 0);
        c.lineTo(ch, 3.5);
        c.stroke();
      }

      // 4. Draw Cephalothorax (Prosoma) with glossy carapace
      c.beginPath();
      c.ellipse(5, 0, 7.5, 6, 0, 0, Math.PI * 2);
      const thGrad = c.createRadialGradient(4, -2, 1, 5, 0, 7.5);
      thGrad.addColorStop(0, '#4a3325');
      thGrad.addColorStop(0.4, '#2c1e16');
      thGrad.addColorStop(1, '#0d0805');
      c.fillStyle = thGrad;
      c.fill();

      // Cephalothorax fovea indentation
      c.beginPath();
      c.arc(4, 0, 1.5, 0, Math.PI * 2);
      c.fillStyle = 'rgba(0, 0, 0, 0.6)';
      c.fill();

      // 5. Ocular Eye Cluster (8 Reflective Specular Dots)
      c.fillStyle = '#050302';
      c.beginPath();
      c.arc(10.5, -1.8, 1.0, 0, Math.PI * 2);
      c.arc(10.5, 1.8, 1.0, 0, Math.PI * 2);
      c.arc(11.2, -0.7, 0.9, 0, Math.PI * 2);
      c.arc(11.2, 0.7, 0.9, 0, Math.PI * 2);
      c.arc(9.6, -2.6, 0.7, 0, Math.PI * 2);
      c.arc(9.6, 2.6, 0.7, 0, Math.PI * 2);
      c.fill();

      // Specular eye reflections
      c.fillStyle = 'rgba(255, 255, 255, 0.85)';
      c.beginPath();
      c.arc(10.8, -0.9, 0.4, 0, Math.PI * 2);
      c.arc(10.8, 0.9, 0.4, 0, Math.PI * 2);
      c.fill();

      // 6. Pedipalps (Front Feelers)
      const palpL = Math.sin(Date.now() * 0.008) * 0.15;
      const palpR = Math.cos(Date.now() * 0.008) * 0.15;

      c.beginPath();
      c.moveTo(11, -2);
      c.lineTo(14 + palpL * 2, -4);
      c.lineTo(16 + palpL * 3, -3);
      c.moveTo(11, 2);
      c.lineTo(14 + palpR * 2, 4);
      c.lineTo(16 + palpR * 3, 3);
      c.strokeStyle = '#22150e';
      c.lineWidth = 1.3;
      c.stroke();

      c.restore();
    }

    // Helper: Draw Physics Spider Silk Web Thread
    function drawSilkThread(c, anchorX, anchorY, spiderX, spiderY, sagAmount, opacity) {
      if (opacity <= 0.01) return;

      c.save();
      c.beginPath();
      c.moveTo(anchorX, anchorY);

      // Quadratic / cubic curve showing natural catenary weight & sway
      const midX = (anchorX + spiderX) / 2 + sagAmount;
      const midY = (anchorY + spiderY) / 2;

      c.quadraticCurveTo(midX, midY, spiderX, spiderY);

      c.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.55})`;
      c.lineWidth = 1.2;
      c.stroke();

      // Specular thread shimmer
      c.strokeStyle = `rgba(255, 240, 220, ${opacity * 0.25})`;
      c.lineWidth = 2.2;
      c.stroke();

      c.restore();
    }

    // Animation Loop
    function frame(now) {
      if (!startTime) startTime = now;
      const elapsed = (now - startTime) / 1000; // in seconds

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Responsive positioning targets in upper-right hero area
      const isMobile = width < 768;
      const anchorX = Math.round(width * (isMobile ? 0.72 : 0.78));
      const anchorY = 0;
      const targetHangY = isMobile ? 105 : 135;
      const spiderScale = isMobile ? 0.78 : 0.95;

      // Timeline Variable States
      let spiderX = anchorX;
      let spiderY = -120;
      let spiderHeading = Math.PI / 2; // facing down
      let webOpacity = 0;
      let webSag = 0;
      let deathCurl = 0;
      const legPhases = [];

      // ---------------------------------------------------------------
      // PHASE 0: 0.0s – 0.5s (Hidden)
      // ---------------------------------------------------------------
      if (elapsed < 0.5) {
        // Nothing rendered
      }

      // ---------------------------------------------------------------
      // PHASE 1: 0.5s – 2.8s (Web Appears & Spider Descends)
      // ---------------------------------------------------------------
      else if (elapsed >= 0.5 && elapsed < 2.8) {
        const descProgress = (elapsed - 0.5) / 2.3; // 0 to 1
        // Smooth cubic ease-out descent
        const ease = 1 - Math.pow(1 - descProgress, 2.5);

        spiderX = anchorX + Math.sin(descProgress * Math.PI * 3) * 6;
        spiderY = -90 + (targetHangY - (-90)) * ease;

        webOpacity = Math.min(1, (elapsed - 0.5) / 0.4);
        webSag = Math.sin(elapsed * 4.5) * 8 * (1 - descProgress * 0.5);

        // Body pendulum rotation
        spiderHeading = Math.PI / 2 + Math.sin(elapsed * 5) * 0.08;

        // Climbing leg movement rhythm (reaching and rappelling)
        for (let i = 0; i < 8; i++) {
          const legSide = i < 4 ? -1 : 1;
          const legIdx = i % 4;
          const cycleSpeed = 7.5;
          const phaseOffset = (legIdx * 0.75) + (legSide === 1 ? Math.PI : 0);

          const reach = Math.sin(elapsed * cycleSpeed + phaseOffset);
          legPhases.push({
            angleOffset: reach * 0.28,
            curlOffset: -Math.abs(reach) * 0.35
          });
        }
      }

      // ---------------------------------------------------------------
      // PHASE 2: 2.8s – 3.5s (Hanging, Probing Air)
      // ---------------------------------------------------------------
      else if (elapsed >= 2.8 && elapsed < 3.5) {
        const hangTime = elapsed - 2.8;
        // Elastic rebound settle
        const bounce = Math.sin(hangTime * 12) * 5 * Math.exp(-hangTime * 3.5);

        spiderX = anchorX;
        spiderY = targetHangY + bounce;
        webOpacity = 1;
        webSag = Math.sin(elapsed * 3) * 3;
        spiderHeading = Math.PI / 2 + Math.sin(elapsed * 2.5) * 0.04;

        // Front legs gently reach and test the air
        for (let i = 0; i < 8; i++) {
          const legIdx = i % 4;
          const probe = (legIdx === 0 || legIdx === 1) ? Math.sin(elapsed * 4 + i) * 0.22 : Math.sin(elapsed * 2 + i) * 0.08;
          legPhases.push({
            angleOffset: probe,
            curlOffset: -Math.abs(probe) * 0.2
          });
        }
      }

      // ---------------------------------------------------------------
      // PHASE 3: 3.5s – 4.5s (Crawling Sideways)
      // ---------------------------------------------------------------
      else if (elapsed >= 3.5 && elapsed < 4.5) {
        const crawlProgress = (elapsed - 3.5) / 1.0; // 0 to 1
        // Smooth sinusoidal crawl progression
        const crawlDist = isMobile ? 38 : 55;
        const crawlLift = isMobile ? -10 : -14;

        // Bobbing vertical motion per step
        const stepBob = Math.sin(crawlProgress * Math.PI * 6) * 2.2;

        spiderX = anchorX + crawlDist * Math.sin(crawlProgress * (Math.PI / 2));
        spiderY = targetHangY + crawlLift * crawlProgress + stepBob;
        webOpacity = 1;
        webSag = (anchorX - spiderX) * 0.35 + Math.sin(elapsed * 4) * 2;

        // Heading tilts into direction of crawl
        spiderHeading = Math.PI / 2 - 0.45 + Math.sin(crawlProgress * Math.PI * 6) * 0.08;

        // True alternating tetrapod gait
        for (let i = 0; i < 8; i++) {
          const side = i < 4 ? 0 : 1;
          const legIdx = i % 4;
          // Group A: L1, R2, L3, R4 | Group B: R1, L2, R3, L4
          const isGroupA = (side === 0 && (legIdx === 0 || legIdx === 2)) || (side === 1 && (legIdx === 1 || legIdx === 3));
          const stepCycle = isGroupA ? Math.sin(elapsed * 18) : Math.sin(elapsed * 18 + Math.PI);

          legPhases.push({
            angleOffset: stepCycle * 0.35,
            curlOffset: -stepCycle * 0.42
          });
        }
      }

      // ---------------------------------------------------------------
      // PHASE 4: 4.5s – 5.5s (Pest Control Aerosol Mist Triggered & Recoil)
      // ---------------------------------------------------------------
      else if (elapsed >= 4.5 && elapsed < 5.5) {
        const sprayTime = elapsed - 4.5;
        const sprayOriginX = anchorX + (isMobile ? 120 : 160);
        const sprayOriginY = targetHangY - 45;

        // Seed mist particles dynamically during spray
        if (sprayTime < 0.65) {
          const toEmit = 8;
          for (let k = 0; k < toEmit; k++) {
            if (mistParticles.length < NUM_MIST_PARTICLES) {
              const p = new MistParticle(sprayOriginX, sprayOriginY, anchorX + 45, targetHangY - 10);
              p.active = true;
              mistParticles.push(p);
            } else {
              // Recycle inactive
              const inactive = mistParticles.find(p => !p.active);
              if (inactive) {
                inactive.reset(sprayOriginX, sprayOriginY, anchorX + 45, targetHangY - 10);
                inactive.active = true;
              }
            }
          }
        }

        // Spider recoils from the spray blast
        const tremor = Math.sin(sprayTime * 45) * 2.5;
        const blastPush = Math.min(12, sprayTime * 24);

        spiderX = anchorX + (isMobile ? 38 : 55) - blastPush + tremor;
        spiderY = targetHangY - (isMobile ? 10 : 14) + tremor;
        webOpacity = Math.max(0.2, 1 - sprayTime * 0.7);
        webSag = 12 + Math.sin(sprayTime * 20) * 8;
        spiderHeading = Math.PI / 2 - 0.45 + Math.sin(sprayTime * 35) * 0.25;

        // Frantic scrambling / flailing reaction to aerosol
        for (let i = 0; i < 8; i++) {
          const spasm = Math.sin(sprayTime * 28 + i * 1.5) * 0.45;
          legPhases.push({
            angleOffset: spasm,
            curlOffset: Math.sin(sprayTime * 32 + i) * 0.5
          });
        }
      }

      // ---------------------------------------------------------------
      // PHASE 5: 5.5s – 6.5s (Knockdown / Biological Death Curl)
      // ---------------------------------------------------------------
      else if (elapsed >= 5.5 && elapsed < 6.5) {
        const downTime = elapsed - 5.5; // 0 to 1
        deathCurl = Math.min(1, downTime * 1.25);

        // Agonized twitching slowing down
        const twitchFreq = Math.max(2, 25 * (1 - downTime));
        const twitch = Math.sin(downTime * twitchFreq) * (1 - downTime) * 1.5;

        spiderX = anchorX + (isMobile ? 26 : 43) + twitch;
        spiderY = targetHangY - (isMobile ? 10 : 14) + downTime * 8;
        webOpacity = Math.max(0, 0.4 * (1 - downTime));
        webSag = 15;
        spiderHeading = Math.PI / 2 - 0.45 + downTime * 0.35;

        for (let i = 0; i < 8; i++) {
          legPhases.push({
            angleOffset: 0,
            curlOffset: 0
          });
        }
      }

      // ---------------------------------------------------------------
      // PHASE 6: 6.5s – 7.5s (Thread Snaps, Limp Spider Drops Under Gravity)
      // ---------------------------------------------------------------
      else if (elapsed >= 6.5 && elapsed < 7.5) {
        const fallTime = elapsed - 6.5;
        deathCurl = 1.0; // fully curled

        // Real freefall acceleration g = 1200 px/s^2
        const dropDist = 0.5 * 1250 * Math.pow(fallTime, 2);

        spiderX = anchorX + (isMobile ? 26 : 43);
        spiderY = (targetHangY - 2) + dropDist;
        webOpacity = 0; // thread snapped
        spiderHeading = Math.PI / 2 + 0.35 + fallTime * 1.2; // tumbling limp

        for (let i = 0; i < 8; i++) {
          legPhases.push({ angleOffset: 0, curlOffset: 0 });
        }
      }

      // ---------------------------------------------------------------
      // PHASE 7: 7.5s+ (Complete Disappearance)
      // ---------------------------------------------------------------
      else {
        // Stop animation loop cleanly
        ctx.restore();
        cancelAnimationFrame(animId);
        return;
      }

      // 1. Draw Web Thread
      if (webOpacity > 0.01 && spiderY > -50) {
        drawSilkThread(ctx, anchorX, anchorY, spiderX - 4, spiderY - 12 * spiderScale, webSag, webOpacity);
      }

      // 2. Draw Living Spider (if on-screen)
      if (spiderY > -60 && spiderY < height + 80) {
        renderSpider(ctx, spiderX, spiderY, spiderHeading, legPhases, deathCurl, spiderScale);
      }

      // 3. Update & Draw Aerosol Mist Particles
      const dt = 1 / 60;
      mistParticles.forEach(p => {
        p.update(dt);
        p.draw(ctx);
      });

      ctx.restore();
      animId = requestAnimationFrame(frame);
    }

    animId = requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpiderAnimation);
  } else {
    initSpiderAnimation();
  }
})();
