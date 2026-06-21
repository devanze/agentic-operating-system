---
name: error-handling
description: Error handling patterns covering error types, exception design, recovery strategies, logging, user-friendly messages, and defensive programming. Use when writing or reviewing error handling code.
---

# Error Handling Patterns

## Error Types

### Operational Errors (Expected)
- Network failure, timeout
- Database connection error
- Validation failure
- File not found
- Rate limit exceeded

These should be caught, logged, and handled gracefully.

### Programmer Errors (Bugs)
- Undefined variable
- Type error
- Null pointer
- Logic error

These should fail fast with clear error messages during development.

## Error Handling Rules

1. Never silently swallow errors — at minimum log them
2. Handle errors at the right level — don't catch if you can't handle
3. Provide context when re-throwing
4. Fail fast — validate inputs at boundaries
5. Distinguish between expected and unexpected errors

## Pattern: Result Type

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

function divide(a: number, b: number): Result<number> {
  if (b === 0) return { success: false, error: new Error("Division by zero") }
  return { success: true, data: a / b }
}
```

- Makes error handling explicit
- Caller must handle both cases
- No try/catch needed for expected errors

## Pattern: Custom Error Classes

```typescript
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR",
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 404, "NOT_FOUND")
  }
}

class ValidationError extends AppError {
  constructor(public details: FieldError[]) {
    super("Validation failed", 400, "VALIDATION_ERROR")
  }
}
```

## Recovery Strategies

- **Retry** — Transient failures (network, rate limits) with exponential backoff
- **Fallback** — Degrade gracefully to cached/default data
- **Circuit breaker** — Stop calling failing service temporarily
- **Timeout** — Set limits on all external calls
- **Bulkhead** — Isolate failures to prevent cascading

## User-Facing Errors

```typescript
// BAD — exposes internals
res.status(500).json({ error: "ENOENT: no such file or directory, open '/etc/config.json'" })

// GOOD — user-friendly
res.status(500).json({ error: "Something went wrong. Please try again or contact support." })
```

- Never expose stack traces to users
- Never expose database/internal errors
- Use generic messages for unexpected errors
- Provide next steps (retry, contact support)
- Include error reference ID for debugging

## Logging Errors

```json
{
  "level": "error",
  "message": "Failed to fetch user",
  "error": "ECONNREFUSED 127.0.0.1:5432",
  "userId": "abc-123",
  "requestId": "req-xyz",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

- Structured logging (JSON)
- Include: timestamp, request ID, user ID, error details
- Never log: passwords, tokens, credit cards, PII
- Log at the right level: ERROR for failures, WARN for recoverable, INFO for state changes
