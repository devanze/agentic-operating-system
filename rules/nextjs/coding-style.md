# Next.js Coding Style

## Naming
- Pages: `kebab-case` files in `app/` directory (e.g., `user-settings/page.tsx`)
- Components: `PascalCase` files (e.g., `UserCard.tsx`, `NavBar.tsx`)
- Utilities: `camelCase` files (e.g., `formatDate.ts`, `apiClient.ts`)
- Hooks: `camelCase` prefixed with `use` (e.g., `useAuth`, `useDebounce`)

## Formatting
- 2-space indentation
- Semicolons in TypeScript files (no semicolons in `.jsx` per Prettier defaults)
- Double quotes for JSX attributes, single quotes for TypeScript strings
- Max 100 characters per line

## Language-Specific Rules
- Default to Server Components — only add `'use client'` when needed:
```tsx
// app/page.tsx — Server Component by default
async function Page() {
  const data = await fetch('https://api.example.com/data');
  const posts = await data.json();
  return <PostList posts={posts} />;
}
```
- Use `fetch()` with Next.js caching extensions:
```tsx
const data = await fetch(url, { next: { revalidate: 3600 } });
const users = await fetch(url, { cache: 'force-cache' }); // default
const fresh = await fetch(url, { cache: 'no-store' });
```
- Use `generateMetadata` for SEO on every page:
```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.id);
  return { title: post.title, description: post.excerpt };
}
```

## Anti-Patterns
- Using `useEffect` for data fetching when `async component` works
- Exposing secrets in client components via `NEXT_PUBLIC_*` prefix
- Missing `loading.tsx` and `error.tsx` boundaries
- Large server actions without proper validation

## Tooling
- Linter: ESLint with `eslint-config-next`
- Formatter: Prettier with `@trivago/prettier-plugin-sort-imports`
- Type checker: TypeScript strict mode
