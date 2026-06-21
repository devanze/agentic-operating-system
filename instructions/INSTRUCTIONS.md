# Agent System — Consolidated Instructions

## Security (CRITICAL)

Before ANY commit:
- No hardcoded secrets (API keys, passwords, tokens)
- All user inputs validated
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitized HTML)
- CSRF protection enabled
- Authentication/authorization verified
- Rate limiting on all endpoints
- Error messages don't leak sensitive data

Secret management: NEVER hardcode secrets. Use environment variables.

If security issue found: STOP → security-reviewer agent → fix CRITICAL → rotate secrets → review codebase.

## Coding Style

### Immutability
Always create new objects, never mutate:
```typescript
// BAD
user.name = "new"
// GOOD
const updated = { ...user, name: "new" }
```

### File & Function Size
- Files: 200-400 lines typical, 800 max
- Functions: under 50 lines
- No deep nesting (>4 levels)
- Single responsibility per function/module

### Error Handling
- Handle errors at every level
- Never silently swallow
- User-friendly messages in UI, detailed logs server-side
- Fail fast with clear messages

## Testing

Minimum 80% coverage. TDD workflow mandatory:
1. Write test (RED)
2. Write implementation (GREEN)
3. Refactor while green

## Git

Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`

## Agent Usage

Use agents proactively:
- Complex features → planner
- Code written → code-reviewer
- New feature/bug → tdd-guide
- Architecture → architect
- Security code → security-reviewer
- Build error → build-error-resolver
