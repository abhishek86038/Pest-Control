---
name: spline-3d
description: >-
  Comprehensive skill for creating, integrating, controlling, and optimizing Spline 3D scenes and interactive 3D web experiences. Use this skill when embedding Spline animations, 3D landing hero scenes, interactive 3D elements, or controlling 3D objects with React, Next.js, Vanilla JS, or WebGL runtimes.
---

# Spline 3D Design & Integration Skill

This skill provides complete workflows, integration methods, interactive event controls, and performance optimization techniques for incorporating **Spline 3D** scenes into modern web applications.

---

## 1. Integration Methods

### A. React & Next.js (`@splinetool/react-spline`)
```bash
npm install @splinetool/react-spline @splinetool/runtime
```

#### React Component Implementation:
```tsx
import React, { useRef, useState } from 'react';
import Spline from '@splinetool/react-spline';
import type { Application } from '@splinetool/runtime';

export default function SplineHero() {
  const splineRef = useRef<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  function onLoad(splineApp: Application) {
    splineRef.current = splineApp;
    setIsLoading(false);
  }

  function handleTriggerAnimation() {
    if (splineRef.current) {
      // Trigger a named event or change variables in Spline
      splineRef.current.emitEvent('mouseHover', 'Cube');
      splineRef.current.setVariable('Score', 100);
    }
  }

  return (
    <div className="relative w-full h-[600px] overflow-hidden rounded-2xl bg-neutral-950">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-white/60">
          Loading 3D Experience...
        </div>
      )}
      <Spline
        scene="https://prod.spline.design/YOUR_SCENE_ID/scene.splinecode"
        onLoad={onLoad}
      />
    </div>
  );
}
```

> [!TIP]
> In **Next.js App Router (SSR)**, always use dynamic imports with `{ ssr: false }` or mark the component with `'use client';` to prevent server-side evaluation errors.

```tsx
'use client';
import dynamic from 'next/dynamic';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-900 animate-pulse" />
});
```

---

### B. Vanilla HTML & JavaScript (`<spline-viewer>`)

```html
<!-- Include the Web Component Script -->
<script type="module" src="https://unpkg.com/@splinetool/viewer@latest/build/spline-viewer.js"></script>

<!-- Embed the 3D Viewer -->
<div class="spline-container">
  <spline-viewer 
    url="https://prod.spline.design/YOUR_SCENE_ID/scene.splinecode"
    events-target="global"
    loading-anim-type="spinner-small-dark">
  </spline-viewer>
</div>

<style>
  .spline-container {
    width: 100%;
    height: 100vh;
    position: relative;
  }
  spline-viewer {
    width: 100%;
    height: 100%;
  }
</style>
```

---

## 2. Programmatic Control & Interactivity

Access scene objects and trigger interactive behaviors dynamically via the `@splinetool/runtime` `Application` instance:

### Finding & Modifying Objects:
```js
// Find object by Name or UUID
const obj = spline.findObjectByName('MainCharacter');

if (obj) {
  // Rotate object on mouse move or scroll
  obj.rotation.y += 0.01;
  
  // Reposition
  obj.position.x = 10;
  obj.position.y = 5;
  
  // Scale
  obj.scale.set(1.2, 1.2, 1.2);
}
```

### Listening to Spline Events:
```js
// Listen to 3D object interactions
spline.addEventListener('mouseDown', (e) => {
  if (e.target.name === 'CTA_Button') {
    console.log('3D CTA button clicked in Spline scene!');
    // Trigger web UI state or navigation
  }
});

spline.addEventListener('mouseHover', (e) => {
  document.body.style.cursor = 'pointer';
});
```

### Setting Variables:
```js
// Update variables defined in Spline Design panel
spline.setVariable('ThemeDark', true);
spline.setVariable('UserSpeed', 2.5);
```

---

## 3. UI/UX & Layout Best Practices for 3D

1. **Overlay Content & Layering**:
   - Keep interactive HTML buttons (`z-index: 10`) above the canvas.
   - Set `pointer-events: none` on overlay headings so 3D mouse rotation still works underneath.
2. **Background Blending**:
   - Match the Spline canvas background color with the website's background color (e.g., `#0a0a0c`) or use a transparent canvas background.
3. **Scroll-Driven 3D Animations**:
   - Tie page scroll offsets to object rotation or camera zoom using `window.addEventListener('scroll', ...)` or GSAP `ScrollTrigger`.

---

## 4. Performance & Mobile Optimization

- **Lazy Loading with IntersectionObserver**: Only initialize/load the `.splinecode` when the canvas enters the viewport.
- **DPI / Pixel Ratio Scaling**: Prevent lagging on 4K/retina displays by clamping `devicePixelRatio` to `Math.min(window.devicePixelRatio, 1.5)`.
- **Mobile Fallback**: Provide a fallback lightweight image or disabled 3D physics on small screens (`< 768px`) to conserve mobile battery and memory.
- **Asset Optimization in Spline**:
  - Keep polygon count under 50k triangles for fast load times.
  - Compress textures (WebP format).
  - Limit real-time shadow maps and directional lights.
