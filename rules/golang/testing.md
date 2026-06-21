# Go Testing

## Table-Driven Tests (Idiomatic Go)

```go
func TestParseConfig(t *testing.T) {
    tests := []struct {
        name    string
        input   string
        want    int
        wantErr bool
    }{
        {"valid port", ":8080", 8080, false},
        {"invalid port", ":99999", 0, true},
        {"empty", "", 0, true},
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := parseConfig(tt.input)
            if (err != nil) != tt.wantErr {
                t.Errorf("parseConfig() error = %v, wantErr %v", err, tt.wantErr)
            }
            if got != tt.want {
                t.Errorf("parseConfig() = %d, want %d", got, tt.want)
            }
        })
    }
}
```

## Sub-tests with t.Run()

- Enables parallel execution and better failure isolation:

```go
func TestUserService(t *testing.T) {
    t.Run("create", func(t *testing.T) { /* ... */ })
    t.Run("update", func(t *testing.T) { /* ... */ })
    t.Run("delete non-existent returns error", func(t *testing.T) { /* ... */ })
}
```

## Parallel Tests

- Use `t.Parallel()` for independent tests to reduce CI time:

```go
func TestParallel(t *testing.T) {
    t.Parallel()
    // all test cases run in parallel
}
```

## testify for Assertions

- Optional but reduces boilerplate:

```go
import "github.com/stretchr/testify/assert"

func TestWithTestify(t *testing.T) {
    result := calculate(2, 3)
    assert.Equal(t, 5, result)
    assert.NotNil(t, result)
    assert.Error(t, validate(""))
}
```

## Mocking with Interfaces

- Mock interfaces, not concrete types:

```go
type UserRepo interface {
    FindByID(ctx context.Context, id string) (*User, error)
}

type mockRepo struct {
    users map[string]*User
}

func (m *mockRepo) FindByID(_ context.Context, id string) (*User, error) {
    if u, ok := m.users[id]; ok { return u, nil }
    return nil, ErrNotFound
}
```

## Test Fixtures

- Place test data in `testdata/` directory:

```
testdata/
├── valid.json
├── invalid.csv
└── expected_output.txt
```

## Benchmarking

```go
func BenchmarkParseConfig(b *testing.B) {
    for i := 0; i < b.N; i++ {
        parseConfig(":8080")
    }
}
```

## Coverage

```bash
go test -coverprofile=coverage.out -covermode=atomic ./...
go tool cover -html=coverage.out
```

## Anti-Patterns

| Bad | Good | Reason |
|-----|------|--------|
| Hard-coded test values | Table-driven tests | Easier to add cases |
| `if got != want { t.Errorf(...) }` with no sub-test | `t.Run()` per case | Sub-tests isolate failures |
| `_ =` to ignore test helper errors | `t.Helper()` then check error | Test helpers must not silently fail |
