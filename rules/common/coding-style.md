# Coding Style (Universal)

## Immutability (CRITICAL)

Always create new objects, never mutate existing ones. Return new copies with changes applied.

```typescript
// BAD — mutation
user.name = "New Name"
array.push(item)
obj.count += 1

// GOOD — new copies
const updated = { ...user, name: "New Name" }
const newArray = [...array, item]
const newObj = { ...obj, count: obj.count + 1 }
```

**Rationale:** Mutation makes code harder to reason about, breaks referential transparency, and causes subtle bugs in React (re-renders), state management, and concurrent scenarios.

## File Organization

- Many small files over few large ones
- 200-400 lines per file typical, 800 lines absolute maximum
- Organize by **feature/domain**, not by type:

```typescript
// BAD — organized by type (scattered concerns)
components/LoginForm.tsx
hooks/useAuth.ts
services/authService.ts
types/auth.ts

// GOOD — organized by feature (co-located)
auth/
├── AuthForm.tsx      // component
├── useAuth.ts        // hook
├── authService.ts    // API calls
├── authTypes.ts      // types
└── auth.test.ts      // tests
```

- One exported component/class per file (with tightly-coupled helpers)

## Functions

- Under 50 lines, single responsibility — "Does one thing and does it well"
- Max 4 parameters — use an options object for more:

```typescript
// BAD — too many positional params
function createUser(name: string, email: string, role: string, age: number, isActive: boolean) {}

// GOOD — options object
function createUser({ name, email, role, age, isActive }: CreateUserInput) {}
```

- No deep nesting (>4 levels) — extract to functions or use early returns:

```typescript
// BAD — nested if-else pyramid
function process(order) {
    if (order) {
        if (order.items.length > 0) {
            if (order.paid) {
                // 3 levels deep...
            }
        }
    }
}

// GOOD — guard clauses
function process(order) {
    if (!order) return;
    if (order.items.length === 0) return;
    if (!order.paid) return;
    // main logic at top level
}
```

## Naming Conventions

| Category | Convention | Examples |
|----------|-----------|----------|
| Variables | Descriptive, pronounceable | `userCount`, not `uc` or `cnt` |
| Booleans | Prefix with `is`, `has`, `should` | `isValid`, `hasPermission`, `shouldUpdate` |
| Functions | Verb + noun | `getUserById`, `calculateTotal`, `sendEmail` |
| Classes/Nouns | PascalCase nouns | `UserService`, `OrderRepository`, `HttpClient` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT` |
| Files/dirs | kebab-case | `user-service.ts`, `auth-middleware.ts` |

**No abbreviations** unless universally known (URL, API, ID, HTTP). A new team member should understand every name without looking up what it means. Avoid single-letter names except for loop counters (`i`, `j`) and generic type params (`T`, `K`, `V`).

## Error Handling

- Handle errors at every level — never silently swallow
- User-friendly messages in UI code, detailed context in logs:

```typescript
// BAD — swallowed error
try {
    await saveUser(data)
} catch (e) {
    // nothing — error is lost
}

// GOOD — log + re-throw or handle
try {
    await saveUser(data)
} catch (e) {
    logger.error("Failed to save user", { error: e, userId: data.id })
    throw new AppError("Unable to save your changes. Please try again.", 500)
}
```

- Fail fast: validate inputs at function boundaries, not deep inside
- Distinguish between _operational_ (expected) and _programmer_ (bug) errors

## Input Validation

- Validate all input at system boundaries (API endpoints, file reads, user input)
- Never trust external data — treat everything from outside as hostile
- Use schema-based validation (Zod, Pydantic, class-validator, Joi)
- Fail fast with clear error messages:

```typescript
// BAD — no validation
function createUser(email: string) {
    db.insert({ email })  // could be invalid, could be SQL injection
}

// GOOD — validate at boundary
function createUser(email: string) {
    const parsed = z.string().email().parse(email)
    db.insert({ email: parsed })  // guaranteed valid
}
```

| Anti-pattern | Fix | Why |
|---|---|---|
| `console.log` left in production | Use structured logger | Logs are noise without severity/context |
| `try { ... } catch { /* empty */ }` | Log + rethrow or return fallback | Silent failures hide critical bugs |
| Two-letter variable names | Full descriptive names | `ct` could mean count, current, or constant |
| Deep file nesting (>4 dirs deep) | Flatten to max 3 levels | Deep trees are hard to navigate |
