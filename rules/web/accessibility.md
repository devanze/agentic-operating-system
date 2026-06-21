# Web Accessibility (a11y) Rules

## CRITICAL

### Semantic HTML First
```html
<!-- BAD -->
<div class="button" onclick="submit()">Submit</div>
<div class="heading">Page Title</div>

<!-- GOOD -->
<button type="submit">Submit</button>
<h1>Page Title</h1>
```

### Keyboard Navigation
- Every interactive element must be focusable and operable via keyboard
- Tab order must follow visual order
- Focus trapping in modals and dialogs
- Skip-to-content link as first focusable element

### Form Labels
```html
<!-- BAD -->
<input type="email" placeholder="Email" />

<!-- GOOD -->
<label for="email">Email</label>
<input id="email" type="email" />
```

## HIGH

### Color Contrast
- Normal text: minimum 4.5:1 contrast ratio (WCAG AA)
- Large text (18px+ bold or 24px+): minimum 3:1
- Never use color alone to convey information (add icon or text)

### Images
```html
<!-- Content image: descriptive alt text -->
<img src="chart.png" alt="Q4 revenue growth: 23% increase over Q3" />

<!-- Decorative image: empty alt -->
<img src="decorative-border.png" alt="" />
```

### ARIA (Use Only When HTML Isn't Enough)
```html
<!-- Custom tab list — needs ARIA -->
<div role="tablist" aria-label="Product info">
  <button role="tab" aria-selected="true" aria-controls="panel-1">Details</button>
  <button role="tab" aria-selected="false" aria-controls="panel-2">Reviews</button>
</div>
<div role="tabpanel" id="panel-1">Product details...</div>
```

### Live Regions
```html
<!-- Announce dynamic content changes to screen readers -->
<div aria-live="polite" aria-atomic="true">
  Cart updated: 3 items
</div>
```

## MEDIUM

### Headings
- One `<h1>` per page
- No heading level skips (`<h1>` → `<h3>`)
- Headings form a logical document outline

### Touch Targets
- Minimum 44×44px for interactive elements on mobile (WCAG 2.5.5)
- Adequate spacing between touch targets (minimum 8px gap)

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

## Testing
- Run axe-core or Lighthouse accessibility audit
- Test with keyboard only (Tab, Enter, Escape, Arrow keys)
- Test with screen reader (VoiceOver on Mac, NVDA on Windows)
- Check color contrast with devtools or contrast checker
