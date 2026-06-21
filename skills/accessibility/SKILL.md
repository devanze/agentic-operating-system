---
name: accessibility
description: Web accessibility (a11y) patterns covering WCAG compliance, semantic HTML, ARIA, keyboard navigation, screen readers, and testing. Use when building accessible web interfaces.
---

# Accessibility (a11y)

## Semantic HTML (First Priority)
```html
<!-- BAD -->
<div onclick="submit()">Submit</div>

<!-- GOOD -->
<button type="submit">Submit</button>

<!-- BAD -->
<div class="heading">Title</div>

<!-- GOOD -->
<h1>Title</h1>
```

## ARIA (When HTML isn't enough)
```html
<!-- Tab list -->
<div role="tablist" aria-label="Product tabs">
  <button role="tab" aria-selected="true" aria-controls="panel-1">Details</button>
  <button role="tab" aria-selected="false" aria-controls="panel-2">Reviews</button>
</div>
<div role="tabpanel" id="panel-1">...</div>

<!-- Live regions for dynamic content -->
<div aria-live="polite" aria-atomic="true">
  Item added to cart
</div>
```

## Keyboard Navigation
- Tab order is logical
- Focus trapping in modals
- Skip-to-content link
- Custom keyboard handlers for complex widgets

## Color & Contrast
- Text: minimum 4.5:1 contrast ratio
- Large text (18px+): 3:1 minimum
- Don't use color alone to convey information
- Support high contrast mode

## Testing
- Keyboard-only navigation test
- Screen reader test (VoiceOver, NVDA)
- Automated: axe-core, Lighthouse
- Manual: zoom to 200%, reduced motion
