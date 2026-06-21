# Web/Frontend Coding Style

## Semantic HTML (First Priority)

```html
<!-- BAD — div soup -->
<div class="header">
    <div class="nav-item" onclick="navigate()">Home</div>
</div>

<!-- GOOD — semantic markup -->
<header>
    <nav>
        <button onclick="navigate()">Home</button>
    </nav>
</header>
```

- `<button>` over `<div onClick>` — keyboard accessible by default
- `<nav>`, `<main>`, `<article>`, `<aside>` — aids screen readers and SEO
- `<h1>-<h6>` in correct hierarchy — never skip levels

## CSS Specificity Management

```css
/* BAD — deep nesting creates high specificity */
header nav ul li a { color: blue; }
/* To override, you need even more: */
header nav ul li a.special { color: red; }

/* GOOD — flat, predictable specificity */
.nav-link { color: blue; }
.nav-link--active { color: red; }
```

- Aim for specificity of 0-1-0 (one class) or 0-2-0 (two classes)
- Avoid `#id` selectors for styling (only for JS hooks)
- Never use `!important` — it's a debugging nightmare

## Naming Conventions

### BEM (Block Element Modifier)

```css
/* Block — standalone component */
.card { }

/* Element — part of the block (double underscore) */
.card__title { }
.card__body { }

/* Modifier — variant (double dash) */
.card--featured { }
.card__title--large { }
```

### Alternative: CSS Modules

```css
/* Component.module.css — auto-scoped, no naming conflicts */
.title { }
.body { }
```

## Responsive Units

```css
/* BAD — px for everything */
.title { font-size: 24px; padding: 16px; width: 960px; }

/* GOOD — fluid, accessible units */
.title {
    font-size: clamp(1.25rem, 2vw + 1rem, 2rem);  /* fluid type */
    padding: 1rem;                                   /* relative spacing */
    width: min(90vw, 1200px);                        /* responsive width */
}
```

- `rem` for typography (respects user font-size preferences)
- `em` for padding/margin relative to current font
- `%` / `vw` / `vh` for layout
- `ch` for max line widths (`max-width: 65ch`)

## CSS Grid + Flexbox for Layout

```css
/* Use Grid for 2D layouts, Flexbox for 1D */

/* Grid: page-level layout */
.page-layout {
    display: grid;
    grid-template-areas:
        "header header"
        "sidebar main"
        "footer footer";
    grid-template-columns: 250px 1fr;
}

/* Flexbox: alignment within components */
.toolbar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
```

## Lazy Loading Images

```html
<!-- GOOD — native lazy loading -->
<img src="photo.webp" alt="Description" loading="lazy" decoding="async" />

<!-- GOOD — responsive images -->
<img
    src="photo-800w.webp"
    srcset="photo-400w.webp 400w, photo-800w.webp 800w, photo-1200w.webp 1200w"
    sizes="(max-width: 600px) 400px, 800px"
    alt="Description"
/>
```

## Anti-Patterns

| Bad | Good | Reason |
|-----|------|--------|
| `!important` to override | Refactor specificity | !important defeats cascade, hard to override later |
| `px` for font sizes | `rem` | px ignores user font-size settings |
| `width: 100%` on flex children | `flex: 1` or `align-self` | Width breaks flex behavior |
| `<div>` for clickable areas | `<button>` or `<a>` | Divs lack keyboard/accessibility support |
