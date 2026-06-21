---
name: backend-patterns
description: Backend architecture patterns covering layered architecture, repository pattern, API design, error handling, logging, and service design. Use when building or reviewing backend services.
---

# Backend Patterns

## Layered Architecture

```
Controller/Handler  — HTTP concerns, request/response parsing
       ↓
Service Layer       — Business logic, orchestration
       ↓
Repository Layer    — Data access, persistence
       ↓
Database/External   — Storage, APIs
```

- Each layer only talks to the layer directly below
- Business logic lives in services, not controllers
- Controllers parse requests and format responses only
- Repositories encapsulate all data access

## Repository Pattern

```typescript
interface UserRepository {
  findById(id: string): Promise<User | null>
  findAll(filters?: UserFilters): Promise<User[]>
  create(data: CreateUserInput): Promise<User>
  update(id: string, data: UpdateUserInput): Promise<User>
  delete(id: string): Promise<void>
}
```

- Define interfaces for repositories
- Implement for each storage (Postgres, Mongo, in-memory)
- Business logic depends on interface, not implementation
- Makes testing easy with mock repositories

## API Design

### RESTful Conventions
- Use nouns for resources: `/users`, `/orders`
- HTTP methods for actions: GET, POST, PUT, PATCH, DELETE
- Plural resource names: `/users/123`, not `/user/123`
- Nest related resources: `/users/123/orders`

### Status Codes
- 200: Success (GET, PUT, PATCH)
- 201: Created (POST)
- 204: No Content (DELETE)
- 400: Bad Request (validation error)
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 422: Unprocessable Entity
- 429: Too Many Requests
- 500: Internal Server Error

### Response Envelope
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": { "page": 1, "perPage": 20, "total": 100 }
}
```

## Error Handling

```typescript
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public isOperational: boolean = true
  ) { super(message) }
}

// Usage
throw new AppError("User not found", 404, "USER_NOT_FOUND")
```

- Operational errors (expected) vs programmer errors (bugs)
- Centralized error handler middleware
- Consistent error response format
- Log all errors with context (request ID, user ID, timestamp)

## Logging

- Structured logging (JSON)
- Levels: ERROR, WARN, INFO, DEBUG
- Include: timestamp, request ID, user ID, action
- Never log: passwords, tokens, PII, credit cards
- Log at service boundaries (API calls, DB queries, external requests)
