# TypeScript Testing

## Vitest (Preferred) vs Jest

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        coverage: { provider: "v8", thresholds: { lines: 80 } },
    },
});
```

- Use Vitest for new projects (faster, ESM-native, TS-first)
- Jest is stable but slower and needs more config

## Test File Naming

```
*.test.ts       — unit tests (co-located with source)
*.spec.ts       — integration tests
__tests__/      — optional grouping directory
```

## MSW for API Mocking

```typescript
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const handlers = [
    http.get("/api/users/:id", ({ params }) => {
        return HttpResponse.json({ id: params.id, name: "John" });
    }),
    http.post("/api/users", async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json(body, { status: 201 });
    }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Test Fixtures

```typescript
// factories/user.ts — reusable test data
import { faker } from "@faker-js/faker";

export function buildUser(overrides: Partial<User> = {}): User {
    return {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        role: "user",
        createdAt: faker.date.past(),
        ...overrides,
    };
}
```

## Snapshot Strategy

```typescript
it("renders user card consistently", () => {
    const user = buildUser({ name: "Alice" });
    const { container } = render(<UserCard user={user} />);
    expect(container.firstChild).toMatchSnapshot();
});
```

- Keep snapshots small (< 50 lines)
- Use `--update` flag (`-u`) deliberately
- Prefer inline snapshots for small outputs
- Always review snapshot diffs in PRs

## Type-safe Mocks

```typescript
// BAD — loose mock type
const mockFn = vi.fn();
mockFn.mockReturnValue("anything"); // no type checking

// GOOD — typed mock
const mockFn = vi.fn<(x: number) => string>();
mockFn.mockImplementation((x) => String(x));
mockFn(42);                      // OK, returns string
// mockFn("hello");              // TYPE ERROR — wrong param type
```

## Anti-Patterns

| Bad | Good | Reason |
|-----|------|--------|
| `vi.spyOn` on the function under test | Mock external dependencies only | Testing mocks, not real behavior |
| Testing private functions directly | Test through public API | Private = implementation detail |
| Giant snapshot files | Targeted assertions + small snapshots | Large snapshots hide real changes |
| `axios.get` directly in tests | MSW at network level | MSW works across all HTTP clients |
