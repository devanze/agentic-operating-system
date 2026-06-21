# Design Patterns (Universal)

## Repository Pattern

Encapsulate data access behind an abstract interface. Business logic depends on the interface, not the storage mechanism.

```typescript
// Interface (contract)
interface UserRepository {
    findById(id: string): Promise<User | null>
    findAll(filters?: UserFilters): Promise<User[]>
    create(data: CreateUserInput): Promise<User>
    update(id: string, data: UpdateUserInput): Promise<User>
    delete(id: string): Promise<void>
}

// Implementation (Postgres)
class PostgresUserRepository implements UserRepository {
    async findById(id: string) {
        return db.query("SELECT * FROM users WHERE id = $1", [id])
    }
}

// Implementation (In-memory for tests)
class InMemoryUserRepository implements UserRepository {
    private users = new Map<string, User>()
    async findById(id: string) { return this.users.get(id) ?? null }
}
```

**When to use:** Data access that may change implementation, or needs to be mocked for testing.

## API Response Envelope

Consistent envelope format for all API responses:

```json
{
    "success": true,
    "data": { "id": 1, "name": "John" },
    "error": null,
    "meta": {
        "page": 1,
        "perPage": 20,
        "total": 150,
        "requestId": "req-abc123"
    }
}
```

```json
{
    "success": false,
    "data": null,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Email is required",
        "details": [{ "field": "email", "message": "Invalid format" }]
    },
    "meta": { "requestId": "req-def456" }
}
```

## Error Types: Operational vs Programmer

```typescript
// Operational errors (expected) — can recover or handle gracefully
// Examples: network timeout, validation failure, not found, rate limited
const operational = [
    "Network timeout, retrying...",
    "Invalid input, please correct",
    "Resource not found, returning 404",
]

// Programmer errors (bugs) — should fail fast in dev
// Examples: null pointer, type error, undefined variable
const programmer = [
    "Cannot read property of null — fix the logic bug",
    "Undefined variable — add proper initialization",
]
```

**Rule:** Handle operational errors with retry/fallback/user messages. Let programmer errors crash loud in development so they're caught before production.

## Dependency Injection (Constructor Injection)

```typescript
// BAD — service locator / global singleton (coupled, hard to test)
class OrderService {
    private db = Database.getInstance()
    private email = EmailService.getInstance()
}

// GOOD — constructor injection (testable, explicit deps)
class OrderService {
    constructor(
        private readonly db: Database,
        private readonly email: EmailService,
        private readonly config: Config
    ) {}
}

// Test with mocks
const mockDb = new InMemoryDatabase()
const mockEmail = new MockEmailService()
const service = new OrderService(mockDb, mockEmail, testConfig)
```

## CQRS (Command Query Responsibility Segregation)

Separate read models from write models when they have different requirements.

```
Client
  │
  ├── Command → Command Handler → Write DB (normalized)
  │     (POST, PUT, DELETE)
  │
  └── Query → Query Handler → Read DB (denormalized, cached)
        (GET)

Write DB: Normalized, transactional, writes optimized
Read DB:  Denormalized, indexed for queries, can be a cache
```

**When to use:** Complex domains where reads and writes have different shapes, rates, or performance requirements.

## Event Sourcing

Store state changes as a sequence of events, not the current state.

```typescript
// Instead of updating the current state...
// Store every event that happened:
events = [
    { type: "AccountCreated", data: { email: "john@example.com" }, timestamp: "2025-01-01" },
    { type: "MoneyDeposited", data: { amount: 100 }, timestamp: "2025-01-02" },
    { type: "MoneyWithdrawn", data: { amount: 50 }, timestamp: "2025-01-03" },
    { type: "AccountFrozen", data: { reason: "suspicious" }, timestamp: "2025-01-04" },
]

// Current state = replay all events
function getCurrentState(events: Event[]): AccountState {
    return events.reduce((state, event) => applyEvent(state, event), initialState)
}
```

**Benefits:** Complete audit trail, time travel debugging, reconstruct past states.

## Hexagonal Architecture (Ports & Adapters)

```
                    ┌──────────────────────┐
                    │    Domain (Core)      │
                    │  Business Logic Only  │
                    │  No external deps     │
                    └──────┬───┬────────────┘
                           │   │
                    Ports  │   │  Ports
                    (Interfaces in domain)
              ┌────────────┘   └────────────┐
              ▼                               ▼
    ┌──────────────────┐          ┌──────────────────┐
    │ Primary Adapters  │          │ Secondary Adapters│
    │ (Drive the app)   │          │ (Driven by app)   │
    ├──────────────────┤          ├──────────────────┤
    │ HTTP controllers  │          │ Database repos    │
    │ CLI commands      │          │ External APIs     │
    │ Event consumers   │          │ Message queues    │
    │ GraphQL handlers  │          │ File storage      │
    └──────────────────┘          └──────────────────┘
```

**Key principle:** Domain layer has ZERO framework dependencies. It defines ports (interfaces) that adapters implement.

## Anti-Patterns

| Pattern | Anti-Pattern | Why |
|---------|-------------|-----|
| DI via constructor | `new` inside business logic | Hard to test, coupled to impl |
| Repository interface | Direct SQL in service | No way to mock or swap DB |
| Single Responsibility | God class (5000-line service) | Impossible to understand or test |
| CQRS for complex domains | CQRS for CRUD-only apps | Unnecessary complexity overhead |
