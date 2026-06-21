# Next.js Patterns

## Core Patterns

### App Router File Conventions
```
app/
├── layout.tsx          — Shared layout across routes
├── page.tsx            — Route page content
├── loading.tsx         — Suspense fallback UI
├── error.tsx           — Error boundary (must be client component)
├── not-found.tsx       — 404 page
├── global-error.tsx    — Root error boundary
└── api/                — Route handlers (API endpoints)
```

### ISR (Incremental Static Regeneration)
```tsx
// app/posts/[id]/page.tsx
export const revalidate = 3600; // revalidate every hour

async function getPost(id: string) {
  const res = await fetch(`https://api.example.com/posts/${id}`, {
    next: { tags: [`post-${id}`] },
  });
  return res.json();
}

// On-demand revalidation via API route
// app/api/revalidate/route.ts
export async function POST(req: Request) {
  const { tag } = await req.json();
  await revalidateTag(tag);
  return Response.json({ revalidated: true });
}
```

### Server Actions for Mutations
```tsx
// app/posts/[id]/actions.ts
'use server';
export async function updatePost(id: string, formData: FormData) {
  const title = formData.get('title');
  // Validate + mutate
  revalidatePath(`/posts/${id}`);
  return { success: true };
}
```

## Architecture
- Route groups `(marketing)` vs `(app)` for layout separation
- Parallel routes with `@slot` for dashboards
- Intercepting routes `(..)shop` for modal navigation
- Middleware at root `middleware.ts` for auth, redirects

## Common Idioms
- `useTransition` for pending states on server actions
- `next/image` with `sizes` attribute for responsive images
- `next/dynamic` with `ssr: false` for client-only components
- Route handlers with `NextRequest` and `NextResponse`

## Anti-Patterns
- Server Components importing client-only libraries
- Overusing `'use client'` — push state down, keep server boundaries
- Fetching the same data in layout AND page — use `preload()` pattern
- Catching errors in `error.tsx` without proper `reset()` flow
