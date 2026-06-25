# Security Guidelines

Before ANY commit:
- No hardcoded secrets (API keys, passwords, tokens)
- No secrets in environment variables exposed to client (NEXT_PUBLIC_*, REACT_APP_*, VITE_*)
- All user inputs validated at system boundaries
- SQL injection prevention: always parameterized queries, never string interpolation
- XSS prevention: sanitize all user-generated HTML, never trust raw input
- CSRF protection enabled on all state-changing endpoints
- Authentication and authorization verified on every protected route
- Rate limiting on all public endpoints
- Error messages must NOT leak sensitive data (stack traces, internal paths, PII)

**Secret management:** NEVER hardcode secrets. Use environment variables or a secret manager. Validate required secrets at startup. Rotate any exposed secrets immediately.

**If security issue found:** STOP → use `security-reviewer` agent → fix CRITICAL issues → rotate exposed secrets → review codebase for similar issues.
