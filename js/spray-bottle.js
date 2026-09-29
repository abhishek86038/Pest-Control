      (function(){
        function init3DBottle(){
          if(typeof THREE === 'undefined') return;

          const container = document.getElementById('can3dContainer');
          const rig = document.getElementById('sprayRig');
          if(!container || !rig) return;

          const width = container.clientWidth || 360;
          const height = container.clientHeight || 560;

          // Scene, Camera, High-Performance WebGL Renderer
          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
          camera.position.set(0, 0.42, 9.0);

          const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
          renderer.setSize(width, height);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.15;
          container.appendChild(renderer.domElement);

          // Studio Lighting Setup
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.72);
          scene.add(ambientLight);

          // Key Light: Specular highlight down the cylindrical surface
          const keyLight = new THREE.DirectionalLight(0xffffff, 1.35);
          keyLight.position.set(3, 4, 5);
          scene.add(keyLight);

          // Rim Light: Cool blue/cyan edge definition
          const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.95);
          rimLight.position.set(-4, 1.5, -3);
          scene.add(rimLight);

          // Warm Gold Fill Light
          const warmLight = new THREE.PointLight(0xf59e0b, 1.3, 14);
          warmLight.position.set(2, -0.8, 3.5);
          scene.add(warmLight);

          // Ultra-Sharp 3D Cylindrical Label Texture (2048 x 1024)
          function createLabelTexture(){
            const c = document.createElement('canvas');
            c.width = 2048;
            c.height = 1024;
            const ctx = c.getContext('2d');
            const texture = new THREE.CanvasTexture(c);
            texture.generateMipmaps = true;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.offset.x = 0.25; // Centers front crest and PEST DEFENSE to camera

            // Rich metallic midnight navy base
            const bgGrad = ctx.createLinearGradient(0, 0, 2048, 0);
            bgGrad.addColorStop(0, '#09131F');
            bgGrad.addColorStop(0.25, '#132235');
            bgGrad.addColorStop(0.5, '#09131F');
            bgGrad.addColorStop(0.75, '#182C44');
            bgGrad.addColorStop(1, '#09131F');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, 2048, 1024);

            // Subtle vertical carbon micro-texture
            ctx.fillStyle = 'rgba(255,255,255,0.025)';
            for(let y=0; y<1024; y+=4){
              ctx.fillRect(0, y, 2048, 2);
            }

            // Top Metallic Gold Stripes
            const goldGrad = ctx.createLinearGradient(0, 0, 2048, 0);
            goldGrad.addColorStop(0, '#B45309');
            goldGrad.addColorStop(0.25, '#F59E0B');
            goldGrad.addColorStop(0.5, '#D97706');
            goldGrad.addColorStop(0.75, '#FDE68A');
            goldGrad.addColorStop(1, '#B45309');

            ctx.fillStyle = goldGrad;
            ctx.fillRect(0, 110, 2048, 24);
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillRect(0, 140, 2048, 6);

            // Bottom Metallic Gold Stripes
            ctx.fillStyle = goldGrad;
            ctx.fillRect(0, 870, 2048, 20);
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fillRect(0, 855, 2048, 4);

            // --- FRONT FACE OF CYLINDER (Centered at x = 1024) ---
            const cx = 1024;

            // Five Gold Stars
            ctx.fillStyle = '#F59E0B';
            ctx.font = '34px sans-serif';
            ctx.letterSpacing = '10px';
            ctx.textAlign = 'center';
            ctx.fillText('★★★★★', cx, 215);

            // Real Official Logo (PEST CREEPY CRAWLY CONTROL)
            const logoImg = new Image();
            logoImg.src = 'logo.png';
            function drawBottleLogo(){
              const logoW = 560;
              const logoH = 320;
              const logoX = cx - (logoW / 2);
              const logoY = 265;

              ctx.save();
              ctx.shadowColor = 'rgba(245, 158, 11, 0.45)';
              ctx.shadowBlur = 28;
              ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
              ctx.restore();

              texture.needsUpdate = true;
            }

            if(logoImg.complete && logoImg.naturalWidth > 0){
              drawBottleLogo();
            } else {
              logoImg.onload = drawBottleLogo;
            }

            // "PEST DEFENSE"
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '800 66px "Outfit", sans-serif';
            ctx.textAlign = 'center';
            ctx.letterSpacing = '12px';
            ctx.fillText('PEST DEFENSE', cx, 660);

            // "QUEENSLAND & NSW FORMULA"
            ctx.fillStyle = '#F59E0B';
            ctx.font = '700 32px "Outfit", sans-serif';
            ctx.letterSpacing = '6px';
            ctx.fillText('QUEENSLAND & NSW FORMULA', cx, 725);

            // Badge: "COMMERCIAL GRADE · 100% ERADICATION"
            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.font = '600 24px "Inter", sans-serif';
            ctx.letterSpacing = '4px';
            ctx.fillText('COMMERCIAL GRADE · 100% ERADICATION GUARANTEE', cx, 795);

            // --- BACK FACE OF CYLINDER (Centered at x = 0 / 2048) ---
            function drawBackDetails(bx){
              ctx.save();
              ctx.textAlign = 'center';

              // Header
              ctx.fillStyle = '#F59E0B';
              ctx.font = '800 36px "Outfit", sans-serif';
              ctx.letterSpacing = '4px';
              ctx.fillText('PROFESSIONAL PROTOCOL', bx, 260);

              // Directions
              ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
              ctx.font = '500 22px "Inter", sans-serif';
              ctx.fillText('APPLY DIRECTLY TO PEST HARBOURAGES & ENTRY POINTS', bx, 320);
              ctx.fillText('TARGETS TERMITES, SPIDERS, COCKROACHES & ANTS', bx, 355);

              // Specs Box
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
              ctx.lineWidth = 2;
              ctx.strokeRect(bx - 320, 395, 640, 160);

              ctx.fillStyle = '#F59E0B';
              ctx.font = '700 24px "Inter", sans-serif';
              ctx.fillText('ACTIVE CONSTITUENTS: BIFENTHRIN 100g/L', bx, 440);
              ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
              ctx.font = '500 20px "Inter", sans-serif';
              ctx.fillText('QBCC LIC. #655077 · APVMA REG. #88921/11024', bx, 480);
              ctx.fillText('AUSTRALIAN SAFETY STANDARD AS 3660.2 COMPLIANT', bx, 515);

              // Barcode
              const barX = bx - 180;
              const barY = 600;
              const barW = 360;
              const barH = 110;
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(barX, barY, barW, barH);
              ctx.fillStyle = '#000000';
              let curX = barX + 16;
              const barPattern = [3,2,1,4,2,3,1,2,4,1,2,3,3,1,2,4,2,1,3,2,4,1,3,2,1,4,2,3];
              for(let i=0; curX < barX + barW - 20; i++){
                const w = barPattern[i % barPattern.length];
                if(i % 2 === 0){
                  ctx.fillRect(curX, barY + 10, w, 70);
                }
                curX += w + 2;
              }
              ctx.font = '600 18px monospace';
              ctx.fillText('9 312345 678901', bx, barY + 98);

              // Net weight
              ctx.fillStyle = '#F59E0B';
              ctx.font = '700 28px "Outfit", sans-serif';
              ctx.fillText('500g NET · COMMERCIAL GRADE', bx, 765);
              ctx.restore();
            }

            drawBackDetails(0);
            drawBackDetails(2048);

            return texture;
          }

          const labelTexture = createLabelTexture();

          // 3D Assembly Group
          const canGroup = new THREE.Group();
          canGroup.scale.set(0.86, 0.86, 0.86);
          scene.add(canGroup);

          // PBR Materials
          const bodyMaterial = new THREE.MeshStandardMaterial({
            map: labelTexture,
            roughness: 0.32,
            metalness: 0.38
          });

          const chimeMaterial = new THREE.MeshStandardMaterial({
            color: 0x223247,
            roughness: 0.22,
            metalness: 0.88
          });

          const goldMaterial = new THREE.MeshStandardMaterial({
            color: 0xF59E0B,
            roughness: 0.16,
            metalness: 0.92
          });

          const nozzleBodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x141f2e,
            roughness: 0.42,
            metalness: 0.22
          });

          const nozzleTipMaterial = new THREE.MeshStandardMaterial({
            color: 0x0a1017,
            roughness: 0.3,
            metalness: 0.1
          });

          // 1. True Cylindrical Can Body (Radius: 1.0, Height: 2.6, 64 segments)
          const bodyGeo = new THREE.CylinderGeometry(1.0, 1.0, 2.6, 64, 1, false);
          const bodyMesh = new THREE.Mesh(bodyGeo, bodyMaterial);
          bodyMesh.position.y = 0.05;
          canGroup.add(bodyMesh);

          // 2. Bottom Chime / Rim (Crimped metallic base)
          const bottomRimGeo = new THREE.CylinderGeometry(1.02, 0.96, 0.18, 64);
          const bottomRim = new THREE.Mesh(bottomRimGeo, chimeMaterial);
          bottomRim.position.y = -1.26;
          canGroup.add(bottomRim);

          // Bottom Concave Base
          const baseCapGeo = new THREE.CylinderGeometry(0.85, 0.6, 0.12, 48);
          const baseCap = new THREE.Mesh(baseCapGeo, chimeMaterial);
          baseCap.position.y = -1.34;
          canGroup.add(baseCap);

          // 3. Domed Top Shoulder (Cylindrical taper up to valve neck)
          const shoulderGeo = new THREE.CylinderGeometry(0.72, 1.0, 0.42, 64);
          const shoulderMesh = new THREE.Mesh(shoulderGeo, chimeMaterial);
          shoulderMesh.position.y = 1.48;
          canGroup.add(shoulderMesh);

          // 4. Gold Crimped Collar (Valve mounting cup)
          const collarGeo = new THREE.CylinderGeometry(0.50, 0.50, 0.14, 64);
          const collarMesh = new THREE.Mesh(collarGeo, goldMaterial);
          collarMesh.position.y = 1.72;
          canGroup.add(collarMesh);

          // 5. Actuator Spray Cap / Button
          const capGeo = new THREE.CylinderGeometry(0.34, 0.36, 0.44, 48);
          const capMesh = new THREE.Mesh(capGeo, nozzleBodyMaterial);
          capMesh.position.y = 1.98;
          canGroup.add(capMesh);

          // Actuator Gold Collar Accent
          const capRingGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 48);
          const capRing = new THREE.Mesh(capRingGeo, goldMaterial);
          capRing.position.y = 1.83;
          canGroup.add(capRing);

          // 6. Spray Nozzle Orifice pointing leftward (-X in world space) towards the hero text
          const nozzlePieceGeo = new THREE.BoxGeometry(0.18, 0.14, 0.14);
          const nozzlePiece = new THREE.Mesh(nozzlePieceGeo, goldMaterial);
          nozzlePiece.position.set(-0.30, 2.05, 0);
          canGroup.add(nozzlePiece);

          const nozzleHoleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.08, 16);
          nozzleHoleGeo.rotateZ(Math.PI / 2);
          const nozzleHole = new THREE.Mesh(nozzleHoleGeo, nozzleTipMaterial);
          nozzleHole.position.set(-0.38, 2.05, 0);
          canGroup.add(nozzleHole);

          // Dummy marker positioned precisely at nozzle outlet for particle emission
          const nozzleMarker = new THREE.Object3D();
          nozzleMarker.position.set(-0.46, 2.05, 0);
          canGroup.add(nozzleMarker);

          // Initial orientation: front label faces camera directly
          canGroup.rotation.y = 0;

          // Responsive Window Resize
          function onWindowResize(){
            const newW = container.clientWidth || 360;
            const newH = container.clientHeight || 560;
            camera.aspect = newW / newH;
            camera.updateProjectionMatrix();
            renderer.setSize(newW, newH);
          }
          window.addEventListener('resize', onWindowResize);

          // Interactive Mouse Drag & Parallax
          let isDragging = false;
          let prevMouseX = 0;
          let manualRotationVel = 0;
          let mouseNormX = 0;
          let mouseNormY = 0;

          renderer.domElement.addEventListener('mousedown', function(e){
            isDragging = true;
            prevMouseX = e.clientX;
          });
          window.addEventListener('mouseup', function(){ isDragging = false; });
          window.addEventListener('mousemove', function(e){
            const rect = renderer.domElement.getBoundingClientRect();
            mouseNormX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouseNormY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

            if(isDragging){
              const deltaX = e.clientX - prevMouseX;
              manualRotationVel = deltaX * 0.015;
              prevMouseX = e.clientX;
            }
          });

          // Touch Interaction
          renderer.domElement.addEventListener('touchstart', function(e){
            if(e.touches.length === 1){
              isDragging = true;
              prevMouseX = e.touches[0].clientX;
            }
          }, {passive:true});
          window.addEventListener('touchend', function(){ isDragging = false; });
          window.addEventListener('touchmove', function(e){
            if(isDragging && e.touches.length === 1){
              const deltaX = e.touches[0].clientX - prevMouseX;
              manualRotationVel = deltaX * 0.015;
              prevMouseX = e.touches[0].clientX;
            }
          }, {passive:true});

          // 3D to 2D Screen Coordinates Projection for Spray Emitter
          const tempVec = new THREE.Vector3();
          window.getNozzleScreenCoords = function(){
            nozzleMarker.getWorldPosition(tempVec);
            tempVec.project(camera);
            const rect = renderer.domElement.getBoundingClientRect();
            const rigRect = rig.getBoundingClientRect();
            const screenX = (tempVec.x * 0.5 + 0.5) * rect.width + rect.left - rigRect.left;
            const screenY = (-(tempVec.y * 0.5) + 0.5) * rect.height + rect.top - rigRect.top;
            return { x: screenX, y: screenY };
          };

          // High-Performance 60fps Animation Loop with Smart Off-Screen Throttling
          const startTime = performance.now();
          let currentScale = 0.86;
          const targetScale = 0.90; // perfectly proportioned without clipping
          let isHeroVisible = true;
          let isRendering = false;

          function animate(){
            if(!isHeroVisible){
              isRendering = false;
              return;
            }
            requestAnimationFrame(animate);
            const elapsed = performance.now() - startTime;

            // Phase 1: 3D Physical Can Shake (0.28s to 1.36s)
            if(elapsed >= 280 && elapsed < 1380){
              const shakeT = (elapsed - 280) * 0.018;
              canGroup.rotation.z = Math.sin(shakeT * 2.2) * 0.12;
              canGroup.rotation.x = Math.cos(shakeT * 1.8) * 0.05;
              canGroup.position.x = Math.sin(shakeT * 2.2) * 0.04;
            } else if(elapsed < 2350){
              canGroup.rotation.z *= 0.88;
              canGroup.rotation.x *= 0.88;
              canGroup.position.x *= 0.88;
            }

            // Phase 2: Smooth settle (+4%) starting after spray ends (2.35s)
            if(elapsed >= 2350){
              const scaleProgress = Math.min((elapsed - 2350) / 750, 1);
              const ease = 1 - Math.pow(1 - scaleProgress, 3); // Cubic ease-out
              currentScale = 0.86 + (targetScale - 0.86) * ease;
              canGroup.scale.set(currentScale, currentScale, currentScale);
            }

            // Phase 3: Continuous 360-degree rotation starting at 2.7s
            if(elapsed >= 2700){
              if(isDragging){
                canGroup.rotation.y += manualRotationVel;
                manualRotationVel *= 0.92;
              } else {
                // Continuous 360 degree spin (~6.5s full revolution)
                canGroup.rotation.y += 0.011 + manualRotationVel;
                manualRotationVel *= 0.95;
              }

              // Subtle 3D dynamic tilt responding to mouse cursor
              const targetTiltZ = -mouseNormX * 0.06;
              const targetTiltX = mouseNormY * 0.06;
              canGroup.rotation.z += (targetTiltZ - canGroup.rotation.z) * 0.05;
              canGroup.rotation.x += (targetTiltX - canGroup.rotation.x) * 0.05;
            }

            renderer.render(scene, camera);
          }

          function startRenderLoop(){
            if(!isRendering && isHeroVisible){
              isRendering = true;
              requestAnimationFrame(animate);
            }
          }

          // IntersectionObserver to pause Three.js and Video when Hero is off-screen
          const heroEl = document.getElementById('hero') || container;
          if('IntersectionObserver' in window && heroEl){
            const heroObserver = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                isHeroVisible = entry.isIntersecting;
                const vid = document.querySelector('.hero-bg-video');
                if(vid){
                  if(isHeroVisible){
                    vid.play().catch(()=>{});
                  } else {
                    vid.pause();
                  }
                }
                if(isHeroVisible){
                  startRenderLoop();
                }
              });
            }, { threshold: 0.02 });
            heroObserver.observe(heroEl);
          }

          startRenderLoop();
        }

        // Initialize when DOM is ready
        if(document.readyState === 'loading'){
          document.addEventListener('DOMContentLoaded', init3DBottle);
        } else {
          init3DBottle();
        }

        // --- AEROSOL MIST PARTICLES EMITTER ---
        const rig = document.getElementById('sprayRig');
        if(!rig) return;

        function spawnParticle(ratio){
          const p = document.createElement('span');
          p.className = 'fog-p';

          const heroW = rig.offsetWidth || window.innerWidth;
          const heroH = rig.offsetHeight || window.innerHeight;

          // Get exact 3D nozzle position in pixels
          let coords = { x: heroW * 0.78, y: heroH * 0.28 };
          if(typeof window.getNozzleScreenCoords === 'function'){
            try { coords = window.getNozzleScreenCoords(); } catch(e){}
          }

          // Full-screen expanse across the hero width
          const minTravel = heroW * 0.40;
          const maxTravel = heroW * 0.88;
          const distance  = minTravel + Math.random() * (maxTravel - minTravel);
          const distFactor = distance / maxTravel;

          // Vertical spread across full height
          const coneSpread = (heroH * 0.32) + ratio * (heroH * 0.70);
          const spread     = (Math.random() - 0.5) * coneSpread;

          // Volumetric scale
          const startSize = 32 + Math.random() * 24;
          const endScale  = 8 + distFactor * 14;
          const rot       = (Math.random() - 0.5) * 50;

          p.style.width  = startSize + 'px';
          p.style.height = startSize + 'px';
          p.style.left = coords.x + 'px';
          p.style.top  = coords.y + 'px';
          p.style.setProperty('--dx', (-distance) + 'px');
          p.style.setProperty('--dy', spread + 'px');
          p.style.setProperty('--rot', rot + 'deg');
          p.style.setProperty('--scale-end', endScale.toFixed(2));
          p.style.animationDuration = (0.75 + Math.random() * 0.45) + 's';

          rig.appendChild(p);
          setTimeout(() => p.remove(), 1400);
        }

        const sprayStart = 1450;    // start right after shake
        const sprayDuration = 800;  // 800ms emission window
        const tickEvery = 22;       // 36 particles total — 60fps silky smooth

        setTimeout(function(){
          const t0 = performance.now();
          const interval = setInterval(function(){
            const elapsed = performance.now() - t0;
            const ratio = Math.min(elapsed / sprayDuration, 1);
            spawnParticle(ratio);
            if(elapsed >= sprayDuration){ clearInterval(interval); }
          }, tickEvery);
        }, sprayStart);
      })();
