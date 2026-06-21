---
name: testing-patterns
description: Comprehensive testing patterns covering unit, integration, E2E tests, test structure, mocking, coverage targets, and TDD workflow. Use when writing or reviewing tests.
---

# Testing Patterns

## Test Pyramid

```
     /\ E2E Tests        — Critical user flows (few)
    /  \ Integration      — API endpoints, DB, services
   /    \ Unit Tests       — Functions, utilities, components (many)
  ────────────
```

- Many unit tests (fast, isolated)
- Moderate integration tests (API, DB, services working together)
- Few E2E tests (slow, brittle, covering critical paths)

## Test Structure (AAA)

```typescript
test("calculateTotal applies discount to items over $100", () => {
  // Arrange — set up test data
  const items = [
    { name: "Widget", price: 60 },
    { name: "Gadget", price: 50 }
  ]
  const discount = 0.1

  // Act — execute the function
  const result = calculateTotal(items, discount)

  // Assert — verify the result
  expect(result).toBe(99) // (60 + 50) * 0.9
})
```

## What to Test

### Unit Tests
- Pure functions (input → output)
- Business logic and calculations
- Validation functions
- Utility functions
- State transitions

### Integration Tests
- API endpoint responses
- Database queries and mutations
- Authentication flow
- File operations
- Email sending

### E2E Tests
- Login/logout flow
- Core business workflow (checkout, onboarding)
- Critical form submissions
- Error recovery paths

## What NOT to Test

- Framework/library internals
- Configuration files
- Simple getters/setters
- Third-party integration (mock it)
- Trivial code with no logic

## Mocking

```typescript
// Mock external dependencies
const mockUserRepo = {
  findById: vi.fn().mockResolvedValue({ id: "1", name: "John" }),
  create: vi.fn().mockResolvedValue({ id: "2", name: "Jane" })
}

// Mock HTTP calls
vi.mock("axios")
mockAxios.get.mockResolvedValue({ data: { results: [] } })

// Mock time
vi.useFakeTimers()
vi.setSystemTime(new Date("2025-01-15"))
```

- Mock at module boundaries, not internal functions
- Mock external APIs and databases
- Use test doubles: stub, spy, mock, fake
- Don't mock what you don't own — wrap in an interface

## Coverage Targets

- 80%+ line coverage
- 80%+ branch coverage
- Focus on critical paths, not arbitrary numbers
- Use coverage to find untested code, not as a game

## Test Names

```typescript
// BAD
test("test1")
test("works")
test("should work correctly")

// GOOD — describe behavior
test("returns 404 when user is not found")
test("throws ValidationError for invalid email format")
test("creates order with correct status and total")
```

- Describe the expected behavior
- Naming pattern: `[method] [behavior] when [condition]`
- Use `describe` blocks to group related tests
