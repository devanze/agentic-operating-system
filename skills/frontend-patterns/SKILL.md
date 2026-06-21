---
name: frontend-patterns
description: Modern frontend patterns for React, component design, state management, performance, accessibility, and responsive layouts. Use when building or reviewing UI components and frontend architecture.
---

# Frontend Patterns

## Component Design

### Composition over Inheritance
```tsx
// GOOD — composition
function Card({ header, body, footer }: CardProps) {
  return (
    <div className="card">
      {header}
      {body}
      {footer}
    </div>
  )
}

// Usage
<Card header={<h2>Title</h2>} body={<p>Content</p>} footer={<Button>OK</Button>} />
```

### Component Hierarchy
- **Pages** — Route-level components, compose features
- **Features** — Business logic containers, specific to a domain
- **Components** — Reusable UI elements, no business logic
- **UI Kit** — Primitives (Button, Input, Modal, etc.)

## State Management

### When to use what
- **useState** — Local component state
- **useReducer** — Complex local state with multiple sub-values
- **Context** — Props passing through many levels
- **Zustand/Jotai** — Global state, simpler than Redux
- **React Query / SWR** — Server state (caching, refetching, mutations)

### State placement
- Keep state as close to where it's used as possible
- Lift state up only when needed
- Separate UI state from server state
- Derived state > stored state (calculate, don't store)

## Performance

- `React.memo` for expensive pure components
- `useMemo` for expensive computations
- `useCallback` for stable callback references
- Lazy load routes: `React.lazy(() => import('./Page'))`
- Virtualize long lists
- Debounce search inputs and scroll handlers
- Optimize images (WebP, srcset, lazy loading)

## Accessibility (a11y)

- Semantic HTML (`<button>`, not `<div onClick>`)
- Alt text for images
- ARIA labels for non-text content
- Keyboard navigation support
- Focus management (modals, route changes)
- Color contrast ratio ≥ 4.5:1
- Screen reader testing

## Responsive Design

- Mobile-first CSS
- Use relative units (rem, em, %, vw/vh)
- Breakpoints for layout changes, not device sizes
- Test on real devices, not just responsive mode

## Forms

- Controlled components with validation
- Show validation errors inline, next to the field
- Disable submit during submission
- Provide loading state during async operations
- Handle server validation errors
- Optimistic updates with rollback on error
