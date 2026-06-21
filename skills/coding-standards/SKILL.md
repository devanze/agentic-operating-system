---
name: coding-standards
description: Universal coding standards covering immutability, file organization, function design, naming conventions, and code quality. Use when writing or reviewing any code to ensure consistency and maintainability.
---

# Coding Standards

## Immutability (CRITICAL)

Always create new objects, never mutate existing ones:

```typescript
// BAD — mutation
user.name = "New Name"
array.push(item)

// GOOD — new copies
const updated = { ...user, name: "New Name" }
const newArray = [...array, item]
```

## File Organization

- Many small files over few large ones
- 200-400 lines per file typical, 800 lines absolute maximum
- Organize by feature/domain, not by type (e.g., `auth/login.ts` not `components/LoginForm.ts`)
- High cohesion, low coupling within modules
- One exported component/class per file (with helpers)

## Function Design

- Functions under 50 lines
- Single responsibility — does one thing well
- Descriptive names that say what the function does
- Maximum 4 parameters — use options object for more
- No deep nesting (>4 levels) — extract to functions or use early returns

## Naming

- Variables: descriptive, pronounceable, searchable
- Boolean: `isValid`, `hasPermission`, `shouldUpdate`
- Functions: verb + noun (`getUserById`, `calculateTotal`)
- Classes: noun (`UserService`, `OrderRepository`)
- No abbreviations unless universally known (URL, API, ID)
- Avoid single-letter names except loop counters

## Error Handling

- Handle errors at every level — never silently swallow
- User-friendly messages in UI code
- Detailed logging server-side
- Fail fast with clear messages
- Provide recovery paths where possible

## Input Validation

- Validate all input at system boundaries
- Use schema-based validation (Zod, Pydantic, Joi)
- Never trust external data
- Sanitize before use in queries, HTML, or commands

## Code Quality Checklist

- [ ] Functions small (<50 lines) and focused
- [ ] Files focused (<400 lines ideal, <800 max)
- [ ] No deep nesting (>4 levels)
- [ ] Proper error handling on all paths
- [ ] No hardcoded values — use constants or config
- [ ] Clear, descriptive naming
- [ ] No commented-out code
- [ ] No console.log left in production paths
