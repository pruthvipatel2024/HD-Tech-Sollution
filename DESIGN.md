---
name: Crystalline Tech
colors:
  surface: '#101415'
  surface-dim: '#101415'
  surface-bright: '#363a3b'
  surface-container-lowest: '#0b0f10'
  surface-container-low: '#191c1e'
  surface-container: '#1d2022'
  surface-container-high: '#272a2c'
  surface-container-highest: '#323537'
  on-surface: '#e0e3e5'
  on-surface-variant: '#c4c6cf'
  inverse-surface: '#e0e3e5'
  inverse-on-surface: '#2d3133'
  outline: '#8e9099'
  outline-variant: '#44474e'
  surface-tint: '#b1c7f2'
  primary: '#b1c7f2'
  on-primary: '#193053'
  primary-container: '#001b3d'
  on-primary-container: '#6f84ac'
  inverse-primary: '#495f84'
  secondary: '#bdf4ff'
  on-secondary: '#00363d'
  secondary-container: '#00e3fd'
  on-secondary-container: '#00616d'
  tertiary: '#adc6ff'
  on-tertiary: '#002e69'
  tertiary-container: '#001a41'
  on-tertiary-container: '#2380ff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#b1c7f2'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#31476b'
  secondary-fixed: '#9cf0ff'
  secondary-fixed-dim: '#00daf3'
  on-secondary-fixed: '#001f24'
  on-secondary-fixed-variant: '#004f58'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a41'
  on-tertiary-fixed-variant: '#004493'
  background: '#101415'
  on-background: '#e0e3e5'
  surface-variant: '#323537'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 64px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

This design system embodies a **Tech Premium** aesthetic, blending the precision of high-end enterprise hardware with the fluidity of modern software interfaces. The brand personality is authoritative yet innovative, catering to a sophisticated B2B and consumer audience that values reliability and cutting-edge performance.

The visual style is a hybrid of **Minimalism** and **Glassmorphism**. It utilizes expansive negative space, hyper-refined typography, and translucent material layers that create a sense of depth and clarity. The interface should feel like "digital glass" suspended over a deep, infinite space, evoking an emotional response of trust, speed, and premium craftsmanship.

## Colors

The palette is anchored in a **Deep Navy** foundation, moving away from pure black to provide a more expensive, cinematic feel. 

- **Primary:** A deep, obsidian navy used for core backgrounds.
- **Accent (Secondary):** A high-vibrancy Electric Cyan, reserved for critical calls to action and interactive states to represent energy and "active" tech.
- **Tertiary:** A classic "Apple-esque" blue for secondary links and system messaging.
- **Surface Strategy:** We use "Glassy" containers—semi-transparent white or blue overlays with high-saturation background blurs (30px+)—to create hierarchy without relying on solid borders.

## Typography

The typography system relies on a hierarchy of three distinct sans-serifs to establish a modern, technical tone:

1.  **Manrope (Headlines):** Chosen for its geometric precision and balanced proportions. It scales beautifully from massive display text to structural headers.
2.  **Inter (Body):** Used for maximum legibility in paragraphs and descriptions. Its tall x-height ensures readability against dark, translucent backgrounds.
3.  **Geist (Labels/Utility):** A monospaced-influenced sans used for small metadata, labels, and technical specs, reinforcing the "Tech" DNA of the system.

For mobile, headlines scale down aggressively to prevent awkward line breaks, while body text remains consistent for accessibility.

## Layout & Spacing

This design system utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile. The layout philosophy is "Generous Breathing Room," meaning margins and vertical stacks are intentionally large to highlight the premium nature of the content.

- **Desktop:** 64px outer margins with 24px gutters. Content is centered with a max-width of 1280px to prevent excessive line lengths on ultra-wide monitors.
- **Mobile:** 20px outer margins. Elements transition to a vertical stack.
- **Spacing Rhythm:** All spacing must be a multiple of 8px (the "unit"). Use `stack-lg` for section breaks and `stack-sm` for related grouping (e.g., a header and its sub-label).

## Elevation & Depth

Depth is the primary driver of hierarchy in this system. Instead of traditional flat shadows, we use:

1.  **Backdrop Blurs:** Every surface container must have a `backdrop-filter: blur(20px)` and a subtle 1px inner border (stroke) of `white / 10% opacity` to simulate the edge of a glass pane.
2.  **Layered Shadows:** Use "Ambient Shadows"—large, extremely soft (40px+ blur), low-opacity (15%) shadows with a slight tint of the Primary Navy color. This prevents "dirty" grey shadows and makes elements feel like they are floating in an illuminated space.
3.  **Z-Axis Hierarchy:**
    - **Level 0:** Deep Navy background.
    - **Level 1:** Glass cards for primary content.
    - **Level 2:** Solid interactive elements (buttons, inputs) with soft glows.

## Shapes

The shape language is "Sophisticated Rounded." We avoid sharp corners to maintain a friendly, approachable tech feel, but avoid full "pill" shapes for standard containers to keep a professional architectural structure.

- **Cards/Containers:** 1rem (16px) radius.
- **Buttons:** 0.5rem (8px) radius or full pill for specialized tags.
- **Inputs:** 0.5rem (8px) radius.

Icons should follow a "Light" weight (1.5px or 2px stroke) with slightly rounded terminals to match the typography.

## Components

### Buttons
- **Primary:** Solid Cyan background with dark navy text. No shadow, but a subtle outer glow (Cyan / 30%) on hover.
- **Secondary:** Glass background (10% white) with white text and a 1px white border.
- **Ghost:** No background, cyan text, underlined only on hover.

### Cards
Cards are the hallmark of this system. They must feature a glass effect, 1px top-left highlight border, and the standard `rounded-lg` (1rem) radius. Information inside should be vertically aligned with generous padding (32px).

### Input Fields
Inputs are dark-themed: `rgba(0, 0, 0, 0.2)` background, subtle 1px border. On focus, the border transitions to a Cyan glow and the label floats upward using the **Geist** font.

### Chips & Tags
Small, pill-shaped elements used for categories. Use a low-opacity Cyan background (`rgba(0, 229, 255, 0.1)`) with high-contrast Cyan text to make them appear "lit from within."

### Lists
Lists should avoid dividers where possible. Use vertical spacing (`stack-sm`) and "hover states" that apply a subtle glass highlight to the entire row to indicate interactivity.