---
name: nextjs-turbopack
description: Next.js patterns covering App Router, Server Components, streaming, caching, route handlers, and Turbopack. Use when building Next.js applications.
---

# Next.js Patterns

## App Router
```
app/
├── layout.tsx        — Shared layout
├── page.tsx          — Route page
├── loading.tsx       — Loading UI (Suspense)
├── error.tsx         — Error boundary
├── not-found.tsx     — 404 page
└── api/              — Route handlers
```

## Server Components (Default)
- Fetch data directly in component
- No client-side state or effects
- Stream with `<Suspense>` boundaries
```tsx
async function Page() {
  const data = await db.query("SELECT ...")
  return <Display data={data} />
}
```

## Client Components ('use client')
- Only when needed: interactivity, hooks, browser APIs
- Push client boundary as deep as possible
- Pass server-fetched data as props

## Data Fetching
- `fetch()` with Next.js caching extensions
- `unstable_cache` for custom cache
- `revalidateTag` for on-demand revalidation
- ISR with `revalidate` option

## Performance
- Turbopack: blazing fast dev builds
- Partial Prerendering for hybrid static + dynamic
- Image optimization with `next/image`
- Font optimization with `next/font`
