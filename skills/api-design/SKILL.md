---
name: api-design
description: API design patterns covering REST, GraphQL, versioning, pagination, error handling, rate limiting, and OpenAPI documentation. Use when designing or reviewing APIs.
---

# API Design Patterns

## RESTful Design

### URL Structure
```
GET    /api/v1/users              — List users
GET    /api/v1/users/:id          — Get user
POST   /api/v1/users              — Create user
PUT    /api/v1/users/:id          — Replace user
PATCH  /api/v1/users/:id          — Partial update
DELETE /api/v1/users/:id          — Delete user

GET    /api/v1/users/:id/orders   — User's orders (nested)
```

### Query Parameters
```
GET /api/v1/users?page=2&perPage=20&sort=name&order=asc
GET /api/v1/users?search=john&status=active
GET /api/v1/users?fields=id,name,email
```

## Versioning

- Version in URL path: `/api/v1/`, `/api/v2/`
- Or in header: `Accept: application/vnd.api.v2+json`
- Maintain old versions during deprecation period
- Announce breaking changes and sunset dates
- Never break existing clients without notice

## Pagination

### Cursor-based (Recommended)
```json
{
  "data": [...],
  "pagination": {
    "nextCursor": "eyJpZCI6MTIzfQ==",
    "hasMore": true
  }
}
```

### Offset-based
```json
{
  "data": [...],
  "meta": {
    "page": 2,
    "perPage": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

- Always paginate list endpoints
- Have a reasonable default page size (20-50)
- Enforce maximum page size (100-200)

## Error Responses

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "age", "message": "Must be at least 18" }
    ]
  }
}
```

- Consistent error format across all endpoints
- Machine-readable error codes
- Human-readable messages
- Field-level validation details
- Include request ID for debugging

## Rate Limiting

- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- 429 Too Many Requests with `Retry-After` header
- Different limits per endpoint type
- Higher limits for authenticated users

## Documentation (OpenAPI)

```yaml
/api/v1/users:
  get:
    summary: List users
    parameters:
      - name: page
        in: query
        schema: { type: integer, default: 1 }
    responses:
      200:
        description: User list
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserList'
```

- Use OpenAPI 3.x for REST APIs
- Auto-generate from code annotations where possible
- Include request/response examples
- Document error responses too
