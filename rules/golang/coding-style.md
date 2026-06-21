# Go Coding Style

## Formatting (Non-negotiable)

- Run `gofmt` (or `goimports`) on every file — Go has no style debates
- `gofmt -s` for simplifications
- `go vet` in CI to catch subtle bugs
- Group imports: stdlib → third-party → local (separated by blank lines)

```go
import (
    "context"
    "fmt"
    "os"

    "github.com/google/uuid"
    "go.uber.org/zap"

    "myapp/internal/config"
    "myapp/internal/repo"
)
```

## Naming Conventions

- Short variable names in limited scopes: `i`, `r`, `w` for loop/reader/writer
- Descriptive names for exported symbols: `ParseConfig`, `UserRepository`
- Package names: short, lowercase, single word (`user`, not `user_utils`)
- Acronyms uppercase: `HTTPHandler`, `ParseURL`, not `HttpHandler`, `ParseUrl`

## Error Handling

- Handle errors explicitly — never ignore with `_` (compiler won't catch all, reviewers will)
- Wrap errors with context using `%w`:

```go
// BAD — no context
if err != nil { return err }

// GOOD — adds context
if err != nil {
    return fmt.Errorf("fetch user %d: %w", userID, err)
}
```

- Early returns over deep nesting:

```go
// BAD — nested pyramid
if err == nil {
    result, err := process(data)
    if err == nil {
        return result, nil
    }
}
return nil, err

// GOOD — early returns
if err != nil {
    return nil, fmt.Errorf("validate: %w", err)
}
result, err := process(data)
if err != nil {
    return nil, fmt.Errorf("process: %w", err)
}
return result, nil
```

## Zero-Value Initialization

- Prefer zero-value initialization for structs when possible:

```go
// GOOD — zero value is valid
var buf bytes.Buffer  // ready to use
var config Config     // zero-valued fields are fine defaults

// BAD — unnecessary explicit initialization
var config = Config{Timeout: 0, EnableLogging: false}
```

## Context Propagation

- `context.Context` as first parameter in functions that may block or call external services:

```go
func FetchUser(ctx context.Context, id uuid.UUID) (*User, error) {
    // ...
}
```

## Interface & Return Types

- Accept interfaces, return structs (concrete types):

```go
// GOOD
func NewService(repo UserRepository) *UserService {  // returns struct
    return &UserService{repo: repo}
}

// BAD — returning interface
func NewService(repo UserRepository) UserServiceInterface {
    return &userService{repo: repo}
}
```

## Defer Ordering

- Defer cleanup in reverse acquisition order (LIFO):

```go
func Process() error {
    mu.Lock()
    defer mu.Unlock()  // unlocks last

    f, err := os.Open("file")
    if err != nil { return err }
    defer f.Close()  // closes first (reverse order)
    // ...
}
```

## Anti-Patterns

| Bad | Good | Reason |
|-----|------|--------|
| `if err != nil { panic(err) }` | `if err != nil { return err }` | Panic in lib code is unrecoverable |
| `_ = doSomething()` | `err := doSomething()` | Ignoring errors hides bugs |
| `var x int32 = 0` | `var x int32` | Zero-value is the default |
