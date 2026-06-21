---
name: react-performance
description: React performance optimization covering memoization, code splitting, virtualization, image optimization, bundle analysis, and profiling. Use when optimizing React apps.
---

# React Performance

## Memoization
```jsx
// Prevent unnecessary re-renders
const MemoizedComponent = React.memo(MyComponent)

// Stable callbacks
const handleClick = useCallback(() => { ... }, [deps])

// Expensive computations
const computed = useMemo(() => expensive(data), [data])
```

## Code Splitting
```jsx
// Route-level splitting
const Dashboard = React.lazy(() => import('./Dashboard'))

// With Suspense boundary
<Suspense fallback={<Spinner />}>
  <Dashboard />
</Suspense>
```

## Virtualization
- `react-window` for fixed-size lists
- `react-virtuoso` for variable-size content
- Virtualize lists >100 items

## Images
- Next.js `<Image>` with lazy loading
- WebP/AVIF format with fallback
- Proper sizes and srcSet
- Lazy load below-fold images

## Avoid Anti-Patterns
- No inline objects/arrays in JSX props
- No anonymous functions as props without memo
- No state in parent that only child needs
- No Context for high-frequency updates
