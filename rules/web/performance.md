# Web Performance Rules

## CRITICAL — Core Web Vitals

### LCP (Largest Contentful Paint) < 2.5s
- Preload hero image: `<link rel="preload" as="image" href="hero.webp" />`
- Inline critical CSS, defer non-critical styles
- Use `fetchpriority="high"` on LCP element

### INP (Interaction to Next Paint) < 200ms
- Avoid long tasks (>50ms) on the main thread
- Debounce scroll/resize handlers
- Use `requestIdleCallback` for non-critical work

### CLS (Cumulative Layout Shift) < 0.1
- Set explicit width/height on images and embeds
- Reserve space for dynamic content (skeleton loaders)
- Avoid inserting content above existing content
- Use `font-display: swap` with size-adjust fallback

## HIGH

### Image Optimization
```html
<!-- BAD -->
<img src="photo.jpg" />

<!-- GOOD -->
<img
  src="photo-800.webp"
  srcset="photo-400.webp 400w, photo-800.webp 800w"
  sizes="(max-width: 768px) 100vw, 50vw"
  loading="lazy"
  width="800"
  height="600"
  alt="Description"
  decoding="async"
/>
```

### Font Optimization
```html
<!-- Preload critical fonts -->
<link rel="preload" href="/fonts/inter.woff2" as="font" crossorigin />
```
```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap; /* Text visible during font load */
}
```

### Code Splitting
```tsx
// Lazy load heavy components
const Chart = React.lazy(() => import('./Chart'))
const Dashboard = React.lazy(() => import('./Dashboard'))

// Route-level splitting
const routes = [
  { path: '/dashboard', component: lazy(() => import('./Dashboard')) }
]
```

### Caching
```
Cache-Control: public, max-age=31536000, immutable  // Static assets
Cache-Control: no-cache                               // HTML
```

## MEDIUM

### Bundle Size
- Keep initial bundle under 200KB (compressed)
- Analyze with `webpack-bundle-analyzer` or `next build --analyze`
- Tree-shake unused dependencies

### Resource Hints
```html
<link rel="preconnect" href="https://api.example.com" />
<link rel="dns-prefetch" href="https://cdn.example.com" />
<link rel="prefetch" href="/next-page.js" />
```

### CSS Performance
- Avoid expensive selectors (`*`, deep nesting)
- Use `content-visibility: auto` for off-screen content
- Avoid `@import` in CSS (blocks rendering)

## Anti-Patterns
| Anti-Pattern | Fix |
|-------------|-----|
| Loading all JS in one bundle | Code-split by route |
| Unoptimized images (PNG for photos) | WebP/AVIF format |
| No height on images | Set aspect ratio to prevent CLS |
| Synchronous third-party scripts | Use `async` or `defer` |
| Huge CSS framework (full Tailwind/Bootstrap) | Purge unused CSS |
