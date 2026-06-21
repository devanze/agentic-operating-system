# React Security Rules

## CRITICAL — Never Deploy With These

### XSS via dangerouslySetInnerHTML
```tsx
// BAD — user input in dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// GOOD — sanitized with DOMPurify
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userComment) }} />
```

### XSS via href/src
```tsx
// BAD — user-controlled URL
<a href={userInput}>Click</a>
<img src={userInput} />

// GOOD — validated URL scheme
const safe = url.startsWith('https://') || url.startsWith('/') ? url : '#'
<a href={safe}>Click</a>
```

### Secret in Client Bundle
```tsx
// BAD — NEXT_PUBLIC_ or VITE_ or REACT_APP_ prefix exposes to client
NEXT_PUBLIC_API_SECRET=sk-xxxxx

// GOOD — server-side only env
API_SECRET=sk-xxxxx  // accessed via getServerSideProps or Server Component
```

### localStorage for Tokens
```tsx
// BAD — XSS can read localStorage
localStorage.setItem('token', jwt)

// GOOD — httpOnly cookies set by server
// Cookie is inaccessible to JavaScript
```

## HIGH

### Server Action Input Validation
```tsx
// BAD — no validation
'use server'
async function updateUser(formData: FormData) {
  const name = formData.get('name')
  await db.users.update({ name }) // injection risk
}

// GOOD — Zod validation
'use server'
import { z } from 'zod'
const schema = z.object({ name: z.string().min(1).max(100) })
async function updateUser(formData: FormData) {
  const { name } = schema.parse(Object.fromEntries(formData))
  await db.users.update({ where: { id: session.userId }, data: { name } })
}
```

### Server Component Data Leak
```tsx
// BAD — passes full user object (including hashed password) to Client Component
<UserProfile user={dbUser} />

// GOOD — only pass needed fields
<UserProfile name={dbUser.name} avatar={dbUser.avatar} />
```

## MEDIUM

### target="_blank" without rel
```tsx
// BAD
<a href="https://external.com" target="_blank">Link</a>

// GOOD
<a href="https://external.com" target="_blank" rel="noopener noreferrer">Link</a>
```

### CSV/JSON Injection
- Never pass user-controlled data directly to CSV export without sanitization
- Validate file types in upload handlers

## Checklist Before Merge
- [ ] No `dangerouslySetInnerHTML` without DOMPurify
- [ ] No `NEXT_PUBLIC_*`/`VITE_*`/`REACT_APP_*` secrets
- [ ] All Server Actions have Zod/Valibot validation
- [ ] No localStorage/sessionStorage for auth tokens
- [ ] All `target="_blank"` have `rel="noopener noreferrer"`
- [ ] No full user objects passed to Client Components
