# TypeScript Coding Style

## Strict Mode (Non-negotiable)

```json
// tsconfig.json — STRICT mode enabled
{
    "compilerOptions": {
        "strict": true,
        "noUncheckedIndexedAccess": true,
        "noImplicitReturns": true,
        "exactOptionalPropertyTypes": true
    }
}
```

- No `strict: false` — you're losing the safety TypeScript provides
- `noUncheckedIndexedAccess` prevents `object[key]` from returning `undefined` silently

## Discriminated Unions for Variant Types

```typescript
// BAD — optional fields to represent variants
type Result = {
    success?: boolean;
    data?: unknown;
    error?: string;
};
// Can be { success: true, error: "msg" } — invalid state!

// GOOD — discriminated union (exhaustive type narrowing)
type Result<T> =
    | { status: "success"; data: T }
    | { status: "error"; error: string }
    | { status: "loading" };

function handleResult<T>(result: Result<T>) {
    switch (result.status) {
        case "success": return result.data;      // TS knows data exists
        case "error":   return `Error: ${result.error}`;
        case "loading": return "Loading...";
    }
}
```

## Branded Types for Type Safety

```typescript
// BAD — strings are interchangeable
function getUser(id: string) { ... }
function getOrder(id: string) { ... }
getUser(orderId); // compiles, but wrong!

// GOOD — branded types prevent misuse
type UserId = string & { readonly __brand: "UserId" };
type OrderId = string & { readonly __brand: "OrderId" };

function createUserId(id: string): UserId { return id as UserId; }
function createOrderId(id: string): OrderId { return id as OrderId; }
function getUser(id: UserId) { ... }
function getOrder(id: OrderId) { ... }
// getUser(createOrderId("123")) — TYPE ERROR
```

## `as` vs `satisfies`

```typescript
// BAD — `as` overrides type checking entirely
const config = { port: 3000 } as Record<string, unknown>; // lies to TS

// GOOD — `satisfies` checks without widening
const config = { port: 3000 } satisfies Record<string, unknown>;
// typeof config.port is still `number`, but satisfies the constraint

// GOOD — proper typing, no assertion
const config: Record<string, unknown> = { port: 3000 };
```

## Optional Chaining and Nullish Coalescing

```typescript
// BAD — verbose null checks
const city = user && user.address && user.address.city ? user.address.city : "Unknown";

// GOOD — optional chaining + nullish coalescing
const city = user?.address?.city ?? "Unknown";

// BAD — || can mask false/0 values
const value = count || 0;  // count=0 → 0 is falsy, so result is 0? Actually 0 is falsy, so 0 || 0 = 0. OK, but count=NaN → 0.
const value = count ?? 0;  // only replaces null/undefined
```

## Const Over Let, Never Var

```typescript
// BAD
var x = 1;  // function-scoped, hoisted — confusing
let y = 2;  // OK, but prefer const

// GOOD
const x = 1;  // block-scoped, immutable binding
// Use `let` only when reassignment is necessary
```

## No `any` — Use `unknown` When Truly Unknown

```typescript
// BAD — any disables all type checking
function parse(data: any) { return data.name; }

// GOOD — unknown forces type narrowing
function parse(data: unknown) {
    if (typeof data === "object" && data && "name" in data) {
        return (data as Record<string, unknown>).name;
    }
    throw new Error("Invalid data");
}
```

## Anti-Patterns

| Bad | Good | Reason |
|-----|------|--------|
| `as MyType` everywhere | Proper type narrowing / discriminated unions | `as` bypasses type checking |
| `!` non-null assertion (`x!.name`) | Proper checking or `?` optional chaining | Assertion lies to compiler |
| `any` for generic functions | Proper generic constraints (`T extends ...`) | `any` infects everything it touches |
| Overly broad types (`{}`) | Precise types (`Record<string, unknown>`) | `{}` accepts almost everything |
