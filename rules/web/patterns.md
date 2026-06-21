# Web/Frontend Patterns

## Layout: Grid vs Flexbox

```css
/* GRID — 2D layouts (rows and columns simultaneously) */
.dashboard {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

/* FLEXBOX — 1D layouts (row OR column) */
.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap; /* responsive wrapping */
}
```

## Container Queries (Modern Alternative to Media Queries)

```css
/* BAD — media query depends on viewport, not component context */
@media (max-width: 600px) {
    .card { flex-direction: column; }
}

/* GOOD — container query responds to parent container's width */
.card-container {
    container-type: inline-size;
}

@container (max-width: 400px) {
    .card { flex-direction: column; }
}
```

- Container queries make components truly reusable across contexts
- Supported in all modern browsers (2024+)

## CSS Custom Properties for Theming

```css
:root {
    /* Design tokens */
    --color-primary: #2563eb;
    --color-primary-hover: #1d4ed8;
    --color-text: #111827;
    --color-bg: #ffffff;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 2rem;
    --radius: 0.5rem;
}

/* Dark theme override */
[data-theme="dark"] {
    --color-text: #f3f4f6;
    --color-bg: #111827;
}

/* Usage — dynamic theming without selector override chains */
.card {
    background: var(--color-bg);
    color: var(--color-text);
    padding: var(--space-md);
    border-radius: var(--radius);
}
```

## Progressive Enhancement

```html
<!-- Core functionality works without JavaScript -->
<form action="/api/subscribe" method="POST">
    <input type="email" name="email" required />
    <button type="submit">Subscribe</button>
</form>

<script type="module">
    // JavaScript enhances (not replaces) base functionality
    const form = document.querySelector("form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        // Ajax submit with better UX
    });
</script>
```

## Performance: Bundle Splitting

```typescript
// Route-based code splitting
const Dashboard = lazy(() => import("./Dashboard"));
const Settings = lazy(() => import("./Settings"));

function App() {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </Suspense>
    );
}
```

## Accessibility First (WCAG 2.1 AA)

```html
<!-- Focus management for modals -->
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <h2 id="modal-title">Confirm action</h2>
    <button autofocus>Confirm</button>
    <button>Cancel</button>
</div>

<!-- Skip navigation link -->
<a href="#main-content" class="skip-link">Skip to content</a>
```

## Anti-Patterns

| Bad | Good | Reason |
|-----|------|--------|
| `display: none` to hide visually | `clip` or `aria-hidden` for screen readers | display:none hides from all users |
| `@media` queries for component layout | Container queries (`@container`) | Media queries tie component to viewport |
| JS-only carousel/slider | Works with CSS scroll snap + JS enhancement | JS-only breaks without JavaScript |
| Font-size in viewport units only | `clamp()` with rem fallback | Users can't zoom text with vw-only sizing |
