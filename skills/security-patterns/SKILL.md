---
name: security-patterns
description: Security best practices, secret management, input validation, injection prevention, and threat model awareness. Use when writing auth, API endpoints, data processing, or any code handling sensitive data.
---

# Security Patterns

## Secret Management

```typescript
// NEVER — hardcoded secrets
const apiKey = "sk-proj-xxxxx"

// ALWAYS — environment variables
const apiKey = process.env.API_KEY
if (!apiKey) throw new Error("API_KEY not configured")
```

- Rotate exposed secrets immediately
- Use a secret manager for production (Vault, AWS Secrets Manager)
- Validate required secrets at application startup
- `.env` files must be in `.gitignore`

## Input Validation

- Validate ALL input at system boundaries
- Use schema validation libraries (Zod, Pydantic, Joi)
- Validate: type, length, format, range, allowed values
- Reject invalid input with clear error messages
- Never trust client-side validation alone

## Injection Prevention

### SQL Injection
```typescript
// BAD — string concatenation
db.query(`SELECT * FROM users WHERE id = ${userId}`)

// GOOD — parameterized queries
db.query("SELECT * FROM users WHERE id = ?", [userId])
```

### XSS Prevention
```typescript
// BAD — innerHTML with user data
element.innerHTML = userInput

// GOOD — textContent or sanitized
element.textContent = userInput
// OR use DOMPurify for HTML
```

### Command Injection
```typescript
// BAD — user input in shell
exec(`git log ${userBranch}`)

// GOOD — validated and sanitized
const branch = /^[a-zA-Z0-9._/-]+$/.test(userBranch) ? userBranch : "main"
exec(`git log ${branch}`)
```

## Authentication & Authorization

- Auth on every protected endpoint
- Use established libraries (OAuth, Passport, NextAuth)
- Session tokens with expiry and rotation
- Role-based access control (RBAC)
- Never expose auth details in URLs or logs

## CORS & Headers

- Restrict CORS to known origins
- Set security headers (CSP, HSTS, X-Content-Type-Options)
- Use HTTPS everywhere

## Rate Limiting

- Apply to all API endpoints
- Rate limit by IP and by user
- Return 429 with Retry-After header
- Higher limits for authenticated users

## Error Messages

- Never leak stack traces to clients
- Never expose database errors
- Generic error messages in production
- Detailed errors only in development

## Dependency Security

- Regular dependency audits (`npm audit`, `pip audit`)
- Pin dependency versions
- Review new dependencies before adding
- Monitor for CVE announcements
