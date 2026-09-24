---
name: ui-ux-design
description: >-
  Expert UI/UX and web/app design skill. Use this skill when designing or building modern, aesthetic, responsive, and intuitive user interfaces, websites, dashboards, landing pages, design systems, and components.
---

# UI/UX & Product Design Skill

This skill provides comprehensive guidelines, modern design patterns, and best practices for creating stunning, high-converting, and user-friendly interfaces.

---

## Core Design Principles

### 1. Visual Hierarchy & Scannability
- **F-Pattern & Z-Pattern**: Structure layouts following natural eye movements.
- **Scale & Contrast**: Highlight primary actions with strong contrast, vibrant accents, and distinct sizing.
- **Whitespace (Negative Space)**: Use ample breathing room (8pt/16pt grid system) to reduce cognitive load.

### 2. Color Palette & Theming
- **60-30-10 Rule**:
  - 60% Dominant neutral (backgrounds, surfaces: dark `#0B0F19`, `#111827` or clean light `#F8FAFC`, `#FFFFFF`).
  - 30% Secondary structure (cards, borders, text `#94A3B8`, `#E2E8F0`).
  - 10% Accent color (vibrant CTA: `#6366F1` Indigo, `#8B5CF6` Violet, `#06B6D4` Cyan, `#10B981` Emerald, `#FFB800` Amber).
- **Glassmorphism & Gradients**: Use subtle backdrop blur (`backdrop-filter: blur(12px)`), soft radial glows, and linear gradients for depth.

### 3. Typography
- **Modern Sans-Serif Fonts**: Inter, Plus Jakarta Sans, Outfit, Geist, Roboto.
- **Hierarchy Scale**:
  - Display / Hero: 48px - 64px (Bold / ExtraBold)
  - H1 / Section Title: 32px - 40px (SemiBold / Bold)
  - H2 / Subtitle: 24px - 28px (Medium / SemiBold)
  - Body Text: 15px - 16px (Regular, line-height: 1.6)
  - Small / Badges: 12px - 13px (Medium)

### 4. Spacing & Layout Grid
- Standard 8px grid system (4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px).
- Fully responsive breakpoints:
  - Mobile: `< 640px`
  - Tablet: `640px - 1024px`
  - Desktop: `> 1024px`
  - Wide Desktop: `> 1280px`

### 5. Micro-Interactions & Animations
- Subtle hover transforms (`transform: translateY(-2px)`).
- Smooth transitions (`transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`).
- Glowing interactive borders, active state feedback, and ripple/fade animations.

---

## Component Standards

### Buttons
- **Primary**: Bold accent color, subtle gradient or glow, crisp contrast text.
- **Secondary / Outline**: Translucent background, subtle border (`1px solid rgba(255,255,255,0.1)` or `#E2E8F0`).
- **States**: Clear hover, active, disabled, and loading spinner states.

### Cards & Surfaces
- Rounded corners (`border-radius: 12px` to `20px`).
- Subtle multi-layered drop shadows (`box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)`).
- Border highlights (`border: 1px solid rgba(255,255,255,0.08)`).

### Forms & Inputs
- Clear labels, placeholder text with lower opacity, distinct focus ring (`ring-2 ring-primary-500`).
- Accessible inline validation messages with helpful icon indicators.

---

## Implementation Checklist
- [ ] Responsive across mobile, tablet, and desktop viewports.
- [ ] High contrast text meeting WCAG AA accessibility standards.
- [ ] Consistent padding, margins, and typography scale.
- [ ] Interactive states (hover, focus, active, loading) implemented on all clickable elements.
- [ ] Modern, polished aesthetic without generic/default styling.
