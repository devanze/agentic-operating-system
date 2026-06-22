Run visual UI review using Playwright browser capture. The ui-reviewer agent will open the app in a real browser, capture screenshots at multiple viewports, and cross-reference against source code.

Checks:
- Visual regressions from expected design (Figma/spec)
- Responsive behavior at all breakpoints (mobile/tablet/desktop)
- Color contrast ratios (WCAG AA minimum)
- Spacing, alignment, and layout consistency
- Interactive states (hover, focus, active, disabled, loading)
- Touch target sizes on mobile
- Console errors and network failures
- Font rendering and visual consistency
- Animation/motion correctness
- Design token compliance

Output: Screenshots with annotations, severity-ranked issues list, and remediation suggestions.
