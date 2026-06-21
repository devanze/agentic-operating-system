# React Testing

## Testing Library + Vitest

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
```

## Query Priority — Test Like a User

```tsx
// BAD — testing implementation details
expect(container.querySelector(".btn-primary")).toBeInTheDocument();

// GOOD — testing accessible role (how users find it)
expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();

// Accesibility-first query order:
// 1. getByRole (preferred)
// 2. getByLabelText (form inputs)
// 3. getByPlaceholderText
// 4. getByText
// 5. getByDisplayValue
// 6. getByTestId (last resort)
```

## userEvent Over fireEvent

```tsx
// BAD — fireEvent doesn't simulate real browser behavior
fireEvent.change(input, { target: { value: "hello" } });

// GOOD — userEvent simulates keystrokes, focus, blur
const user = userEvent.setup();
await user.type(input, "hello");
await user.click(button);
```

## async Assertions with waitFor and findBy

```tsx
// BAD — setTimeout guess
setTimeout(() => expect(screen.getByText("Loaded")).toBeInTheDocument(), 1000);

// GOOD — waitFor polls until found or timeout
await waitFor(() => {
    expect(screen.getByText("Loaded")).toBeInTheDocument();
});

// Even better — findBy* returns a promise
expect(await screen.findByText("Loaded")).toBeInTheDocument();
```

## MSW for API Mocking

```tsx
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
    http.get("/api/users", () =>
        HttpResponse.json([{ id: 1, name: "John" }])
    ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it("displays users from API", async () => {
    render(<UserList />);
    expect(await screen.findByText("John")).toBeInTheDocument();
});
```

## Testing Error and Loading States

```tsx
it("shows error when API fails", async () => {
    server.use(
        http.get("/api/users", () => HttpResponse.error())
    );
    render(<UserList />);
    expect(await screen.findByText(/error/i)).toBeInTheDocument();
});

it("shows loading spinner", () => {
    render(<UserList />);
    expect(screen.getByRole("status")).toBeInTheDocument(); // role="status" on Spinner
});
```

## Snapshot Strategy

```tsx
it("renders consistently", () => {
    const { container } = render(<Button label="Click" />);
    expect(container).toMatchSnapshot();
});
```

- Use sparingly — prefer explicit assertions
- Keep snapshots small (under 50 lines)
- Regenerate with `--update` flag when changes are intentional

## Anti-Patterns

| Bad | Good | Reason |
|-----|------|--------|
| `getByTestId("user-form")` | `getByRole("form", { name: /user/i })` | Tests accessibility, not markup |
| `act()` wrapper everywhere | `waitFor` / `findBy` | RTL wraps in act() internally |
| Testing internal state | Testing rendered output | State is implementation detail |
