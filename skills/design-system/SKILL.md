---
name: design-system
description: Design system patterns covering component libraries, tokens, theming, responsive design, and design tokens. Use when building UI design systems.
---

# Design System Patterns

## Design Tokens
```css
:root {
  /* Colors */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-text: #111827;
  --color-text-muted: #6b7280;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}
```

## Component Architecture
- Atoms: Button, Input, Label, Icon
- Molecules: FormField, SearchBar, Card
- Organisms: Header, Sidebar, DataTable
- Templates: Page layouts
- Pages: Full page compositions

## Theming
- CSS custom properties for theming
- Dark/light mode via `prefers-color-scheme`
- Component variants: primary, secondary, outline, ghost
- Sizes: sm, md, lg

## Responsive
- Mobile-first breakpoints
- Fluid typography with `clamp()`
- Container queries for component-level responsive
- Grid and flexbox for layout

## Accessibility
- WCAG 2.1 AA minimum
- Keyboard navigation
- Focus indicators
- Screen reader support
- Color contrast ≥ 4.5:1
