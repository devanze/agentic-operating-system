---
name: hexagonal-architecture
description: Hexagonal architecture (ports and adapters) patterns covering domain isolation, ports, adapters, dependency inversion, and testing. Use for maintainable backend architectures.
---

# Hexagonal Architecture (Ports & Adapters)

## Core Concept
```
       ┌──────────────────────┐
       │    Domain (Core)     │
       │  Business Logic      │
       │  No framework deps   │
       └────────┬─┬───────────┘
        Ports   │ │   Ports
      ┌─────────┘ └─────────┐
      ▼                      ▼
  ┌─────────┐          ┌─────────┐
  │ Adapters│          │ Adapters│
  │ Primary │          │Secondary│
  └─────────┘          └─────────┘
  HTTP, CLI,           DB, API,
  Events, MQ           File, Cache
```

## Ports (Interfaces in Domain)
```typescript
interface UserRepository {
  findById(id: string): Promise<User | null>
  save(user: User): Promise<void>
}

interface EmailService {
  sendWelcome(user: User): Promise<void>
}
```

## Adapters (Implement Ports)
```typescript
class PostgresUserRepository implements UserRepository {
  async findById(id: string) { return db.query(...) }
  async save(user: User) { return db.insert(...) }
}

class SendGridEmailService implements EmailService {
  async sendWelcome(user: User) { return sendgrid.send(...) }
}
```

## Benefits
- Domain logic testable without infrastructure
- Swap adapters without touching domain
- Framework-agnostic business logic
- Clear separation of concerns
- Easy to add new adapters (new DB, new API, new queue)

## Testing
```typescript
// Test domain with in-memory adapter
class InMemoryUserRepository implements UserRepository { ... }

test("user registration", async () => {
  const repo = new InMemoryUserRepository()
  const email = new MockEmailService()
  const service = new UserService(repo, email)
  await service.register({ email: "test@test.com" })
  expect(await repo.findById(...)).toBeDefined()
})
```
