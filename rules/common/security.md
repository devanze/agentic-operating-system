# Security (Universal)

## Pre-Commit Checklist

- [ ] No hardcoded secrets (API keys, passwords, tokens, certificates)
- [ ] All user input validated at system boundaries
- [ ] SQL injection prevented (parameterized queries only)
- [ ] XSS prevented (escape all user output, use textContent)
- [ ] CSRF protection enabled on all state-changing endpoints
- [ ] Authentication verified on every protected route
- [ ] Authorization checks (not just auth — do they have permission?)
- [ ] Rate limiting applied to public endpoints
- [ ] Error messages don't leak internals (stack traces, DB schema, PII)

## OWASP Top 10 Mapping

| OWASP Risk | Our Defense |
|------------|------------|
| A01: Broken Access Control | RBAC, route guards, per-action authorization |
| A02: Cryptographic Failures | No custom crypto, use bcrypt/argon2, TLS everywhere |
| A03: Injection | Parameterized queries, schema validation, output encoding |
| A04: Insecure Design | Threat modeling in design phase, security reviews |
| A05: Security Misconfiguration | Hardened defaults, secrets in env vars, no debug in prod |
| A06: Vulnerable Components | `npm audit` / `pip audit` in CI, pin versions |
| A07: Auth Failures | Rate limiting, MFA support, secure session management |
| A08: Data Integrity Failures | CSP headers, SRI for CDN assets, signed JWTs |
| A09: Logging Failures | Structured logging, no secrets in logs, audit trail |
| A10: SSRF | URL allowlist, no user input in fetch targets |

## SQL Injection Prevention

```typescript
// BAD — string concatenation (VULNERABLE)
db.query(`SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`)

// BAD — ORM raw queries with interpolation
User.findByQuery(`SELECT * FROM users WHERE email = '${email}'`)

// GOOD — parameterized query
db.query("SELECT * FROM users WHERE email = $1 AND password_hash = $2", [email, hash])

// GOOD — ORM parameter binding
User.findBy({ email, password_hash: hash })

// GOOD — query builder with parameters
knex("users").where({ email }).first()
```

## XSS Prevention

```typescript
// BAD — innerHTML with user content (VULNERABLE)
element.innerHTML = userInput

// BAD — dangerouslySetInnerHTML in React
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// GOOD — textContent (auto-escaped)
element.textContent = userInput

// GOOD — React JSX (auto-escaped by default)
<p>{userComment}</p>

// GOOD — sanitized HTML (when HTML is required)
import DOMPurify from "dompurify"
element.innerHTML = DOMPurify.sanitize(userInput)
```

## JWT Best Practices

```typescript
// BAD — no expiry, weak secret
const token = jwt.sign({ userId: 123 }, "secret123")  // never expires!

// GOOD — short expiry, strong env-based secret
const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,        // from env, never hardcoded
    { expiresIn: "15m" }             // short-lived
)

// BAD — storing JWT in localStorage (XSS accessible)
localStorage.setItem("token", token)

// GOOD — httpOnly secure cookie (XSS-proof, CSRF with SameSite=Strict)
res.cookie("session", token, {
    httpOnly: true,      // not accessible via JS
    secure: true,        // HTTPS only
    sameSite: "strict",  // CSRF protection
    maxAge: 15 * 60 * 1000  // 15 minutes
})
```

## Secret Management

```bash
# NEVER — hardcoded in source
API_KEY=sk-proj-xxxxx  # Committed to git!

# ALWAYS — environment variables
API_KEY=${API_KEY}  # Must be set at runtime
```

- Validate required secrets at application startup:

```typescript
const required = ["DATABASE_URL", "JWT_SECRET", "API_KEY"]
for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`Missing required env var: ${key}`)
    }
}
```

- Rotate exposed secrets **immediately** — generate new keys and invalidate old ones
- `.env` files in `.gitignore` (but `.env.example` is committed with dummy values)
- Use a secret manager for production: Vault, AWS Secrets Manager, GCP Secret Manager

## Rate Limiting

```typescript
// Apply to all API endpoints
// Rate limit by IP AND by user for authenticated endpoints

// Example: Upstash Redis rate limiter
const { success, remaining } = await rateLimit.limit(identifier)
if (!success) {
    return new Response("Too many requests", {
        status: 429,
        headers: {
            "Retry-After": "60",
            "X-RateLimit-Remaining": String(remaining),
        },
    })
}
```

## Error Messages — Don't Leak Internals

```typescript
// BAD — leaks stack trace and DB schema
res.status(500).json({
    error: "ER_NO_REFERENCED_ROW_2: Cannot add foreign key constraint on 'orders.user_id'"
})

// GOOD — generic user-facing message, detailed server-side log
logger.error("Database constraint violation", { error: err, requestId })
res.status(500).json({
    error: "Something went wrong. Please try again or contact support.",
    requestId: "req-abc123"  // for debugging
})
```

## Dependency Security

```bash
# Regular audits
npm audit    # Node.js
pip audit    # Python
cargo audit  # Rust

# CI integration
npm audit --audit-level=high  # Fail CI on HIGH+ issues
```

- Pin dependency versions (no `^` ranges for critical deps)
- Review new dependencies before adding — check downloads, maintenance, security history
- Monitor for CVEs (GitHub Dependabot, Snyk, or similar)

## If Security Issue Found

1. **STOP** — do not proceed with other work
2. **Assess severity** — CRITICAL (data exposure, auth bypass) or HIGH
3. **Fix CRITICAL issues immediately** — rollback deploy if needed
4. **Rotate any exposed secrets** — generate new keys, invalidate old ones
5. **Review codebase for similar issues** — the same pattern may exist elsewhere
6. **Document the incident** — what happened, fix applied, prevention
