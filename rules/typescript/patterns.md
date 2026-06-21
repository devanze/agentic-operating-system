# TypeScript Patterns

## Module Augmentation

```typescript
// Augment third-party types without forking
import "express-session";

declare module "express-session" {
    interface SessionData {
        userId?: string;
        role?: "admin" | "user";
    }
}
// Now req.session.userId is valid
```

## Template Literal Types

```typescript
// BAD — string enum values disconnected from patterns
type EventName = "user:created" | "user:updated" | "order:created";

// GOOD — template literal derives types from parts
type Resource = "user" | "order" | "product";
type Action = "created" | "updated" | "deleted";
type EventName = `${Resource}:${Action}`;
// Produces: "user:created" | "user:updated" | ... | "product:deleted"

// Even better — type-safe event system
type EventHandler<T extends EventName> = (payload: EventPayload[T]) => void;
```

## Conditional Types

```typescript
// Extract types based on conditions
type IsString<T> = T extends string ? true : false;
type A = IsString<"hello">;  // true
type B = IsString<42>;       // false

// Real-world: extract return type from function
type ApiResponse<T> = {
    data: T;
    error: null;
} | {
    data: null;
    error: string;
};

type ExtractData<T> = T extends ApiResponse<infer D> ? D : never;
type UserResponse = ApiResponse<{ id: number; name: string }>;
type UserData = ExtractData<UserResponse>; // { id: number; name: string }
```

## Zod Schema Validation

```typescript
import { z } from "zod";

// Define schema once — derive both runtime validation and TypeScript type
const UserSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    age: z.number().int().positive().optional(),
    role: z.enum(["admin", "user"]),
});

// Inferred type is always in sync with schema
type User = z.infer<typeof UserSchema>;

// Parse with full error messages
const result = UserSchema.safeParse(unknownData);
if (!result.success) {
    console.error(result.error.flatten());
} else {
    // result.data is typed as User
}
```

## Result Type for Error Handling

```typescript
type Result<T, E = Error> =
    | { ok: true; value: T }
    | { ok: false; error: E };

function divide(a: number, b: number): Result<number> {
    if (b === 0) return { ok: false, error: new Error("Division by zero") };
    return { ok: true, value: a / b };
}

// Caller MUST handle both cases
const result = divide(10, 2);
if (result.ok) {
    console.log(result.value);
} else {
    console.error(result.error.message);
}
```

## Anti-Patterns

| Bad | Good | Reason |
|-----|------|--------|
| `namespace` for grouping | `import` / `export` modules | Namespaces are a pre-ESM artifact |
| `interface` for union types | `type` for unions, interface for objects | Interface cannot extend unions |
| Unconstrained generic `<T>` | Constrained `<T extends HasId>` | Unconstrained generics accept anything |
