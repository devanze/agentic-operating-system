# Responsive Design Rules

## Core Principles

### Mobile-First CSS
```css
/* Base styles = mobile (smallest viewport) */
.container { padding: 1rem; }

/* Tablet */
@media (min-width: 768px) {
  .container { padding: 2rem; }
}

/* Desktop */
@media (min-width: 1024px) {
  .container { max-width: 1200px; margin: 0 auto; }
}
```

### Breakpoints — Content-Based, Not Device-Based
| Name | Min Width | Typical Use |
|------|-----------|-------------|
| Mobile | 320px | Base styles (no media query) |
| Tablet | 768px | Two-column layouts, larger nav |
| Desktop | 1024px | Full layouts, sidebars |
| Wide | 1280px | Large screens, multi-column |

## HIGH

### Flexible Layouts
```css
/* BAD — fixed widths */
.sidebar { width: 300px; }

/* GOOD — grid/flex */
.sidebar { flex: 0 0 min(300px, 30vw); }
```

### Fluid Typography
```css
/* BAD — fixed font size */
h1 { font-size: 32px; }

/* GOOD — clamp scales between min and max */
h1 { font-size: clamp(1.5rem, 4vw, 3rem); }
```

### Images
```html
<!-- Responsive images with srcset -->
<img
  src="hero-800.jpg"
  srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1200.jpg 1200w"
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="Hero banner"
/>
```

### Container Queries (Modern)
```css
.card-container { container-type: inline-size; }

@container (min-width: 400px) {
  .card { display: grid; grid-template-columns: 1fr 1fr; }
}
```

## MEDIUM

### Viewport Units
- `dvh` over `vh` for mobile (accounts for browser chrome)
- Test on real devices — simulator doesn't show all issues

### No Horizontal Scroll
- Check every viewport 320px–1440px
- Overflow:hidden on html/body causes accessibility issues

### Touch vs Hover
- `@media (hover: hover)` for hover effects (don't assume hover works on touch devices)
- `@media (pointer: coarse)` for touch-specific styles

## Anti-Patterns
| Anti-Pattern | Fix |
|-------------|-----|
| Desktop-first media queries | Start mobile, scale up |
| Device-specific breakpoints (iPhone, iPad) | Content-based breakpoints |
| Fixed pixel widths on containers | Max-width + percentage |
| `overflow: hidden` on body to prevent scroll | Fix the layout issue instead |
