# Testing (Universal)

## Coverage Target

Minimum **80% line + branch coverage** for all code. Higher for critical paths (auth, payments, data validation).

```bash
# Example thresholds in vitest config
coverage: {
    provider: "v8",
    thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
    },
}
```

## TDD Workflow (Mandatory)

1. **RED** — Write a failing test that describes the desired behavior
2. **GREEN** — Write the minimal implementation to make the test pass
3. **REFACTOR** — Clean up while keeping all tests green

```typescript
// Step 1: RED — test fails because calculateTotal doesn't exist
test("calculateTotal applies 10% discount for orders over $100", () => {
    const result = calculateTotal(150)  // doesn't exist yet
    expect(result).toBe(135)  // 150 - 15 = 135
})

// Step 2: GREEN — minimal implementation
function calculateTotal(amount: number): number {
    if (amount > 100) return amount * 0.9
    return amount
}

// Step 3: REFACTOR — improve structure, add edge cases, keep tests green
```

## Test Types (All Required)

| Type | Scope | Speed | Purpose |
|------|-------|-------|---------|
| **Unit** | Single function/component | Fast (ms) | Test business logic, edge cases |
| **Integration** | API + DB + Services | Moderate (s) | Test system interactions |
| **E2E** | Full user flow | Slow (m) | Test critical business paths |

**Ratio guideline:** Many units, moderate integrations, few E2E.

## Test Structure (AAA Pattern)

```typescript
describe("UserService", () => {
    describe("findById", () => {
        it("returns user when found", async () => {
            // ARRANGE — set up test data and mocks
            const user = new User({ id: "1", email: "test@test.com" })
            const repo = new InMemoryUserRepository([user])
            const service = new UserService(repo)

            // ACT — execute the code under test
            const result = await service.findById("1")

            // ASSERT — verify the result
            expect(result).toEqual(user)
            expect(result?.email).toBe("test@test.com")
        })

        it("returns null when not found", async () => {
            const repo = new InMemoryUserRepository([])
            const service = new UserService(repo)
            const result = await service.findById("nonexistent")
            expect(result).toBeNull()
        })
    })
})
```

## Test Naming Convention

Pattern: `[method] [behavior] when [condition]`

```typescript
// GOOD — describes behavior clearly
it("returns 404 when user is not found")
it("throws ValidationError for invalid email format")
it("creates order with correct status and total")
it("sends welcome email after registration")
it("rejects duplicate email on signup")
```

## Test Doubles (Mocking Patterns)

| Type | What it is | When to use |
|------|-----------|-------------|
| **Dummy** | Passed but never used | Filling parameter lists |
| **Fake** | Working impl, not prod-ready | In-memory DB, fake email service |
| **Stub** | Returns canned answers | API responses, config values |
| **Spy** | Records what was called | Verify side effects (email sent, event emitted) |
| **Mock** | Pre-programmed expectations | Verify complex interactions |

```typescript
// FAKE — lightweight working implementation
class FakeEmailService implements EmailService {
    readonly sent: Email[] = []
    async send(email: Email) { this.sent.push(email) }
}

// MOCK — verify interactions
const mockRepo = {
    save: vi.fn().mockResolvedValue({ id: "1" }),
    findById: vi.fn().mockResolvedValue(null),
}

// SPY — track calls
const sendSpy = vi.spyOn(emailService, "send")
```

## Coverage Strategy

| Metric | Minimum | Focus |
|--------|---------|-------|
| Lines | 80% | Every line executes |
| Branches | 80% | All if/else, switch cases tested |
| Functions | 80% | All public functions called |
| Paths | Manual review | Critical paths tested end-to-end |

**Don't game coverage** — 100% coverage with shallow tests is worse than 80% with meaningful tests. Focus on:
- All error paths tested (not just happy path)
- Edge cases (empty, null, invalid input, boundary values)
- Business-critical logic (pricing, auth, permissions)

## What NOT to Test

- Framework/library internals (React, Express, Django — they test themselves)
- Configuration files (unless logic is conditional on config)
- Simple getters/setters (no logic to test)
- Third-party integrations (mock them — test YOUR code, not their API)
- Trivial code with zero branches or conditionals

## Integration Testing Pattern

```typescript
describe("POST /api/users", () => {
    it("creates user and returns 201", async () => {
        const response = await request(app)
            .post("/api/users")
            .send({ email: "test@test.com", name: "John" })
            .expect(201)

        expect(response.body.data.email).toBe("test@test.com")

        // Verify side effect in DB
        const user = await db.query("SELECT * FROM users WHERE email = $1", ["test@test.com"])
        expect(user.rows[0].name).toBe("John")
    })
})
```

## Anti-Patterns

| Bad | Good | Reason |
|-----|------|--------|
| `it("should work")` | `it("returns 404 when user not found")` | Vague names help no one |
| Testing implementation details | Testing behavior/output | Impl changes break tests unnecessarily |
| Shared mutable fixtures | Factory functions (`buildUser()`) | Shared state causes flaky tests |
| `it.skip` or `xdescribe` | Fix or remove the test | Skipped tests rot and are forgotten |
| Over-mocking (mocking everything) | Integration tests with real deps | Mock-verified code may fail in real env |
