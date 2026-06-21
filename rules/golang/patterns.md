# Go Patterns

## Concurrency: Channels vs Mutexes

- **Channels** for coordination and passing ownership (communicate sequential processes)
- **Mutexes** for protecting state within a goroutine

```go
// CHANNEL — fan-out to workers
jobs := make(chan Job, 100)
for w := 0; w < numWorkers; w++ {
    go func() {
        for job := range jobs {
            process(job)
        }
    }()
}

// MUTEX — protect shared counters
type Counter struct {
    mu    sync.Mutex
    value int
}
func (c *Counter) Inc() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.value++
}
```

## Goroutine Coordination

### sync.WaitGroup — wait for all goroutines

```go
var wg sync.WaitGroup
for _, item := range items {
    wg.Add(1)
    go func(item Item) {
        defer wg.Done()
        process(item)
    }(item)
}
wg.Wait()
```

### errgroup — concurrent error handling

```go
g, ctx := errgroup.WithContext(ctx)
for _, url := range urls {
    url := url  // capture
    g.Go(func() error {
        return fetch(ctx, url)
    })
}
if err := g.Wait(); err != nil {
    return fmt.Errorf("fetch failed: %w", err)
}
```

### select — multiplex channels

```go
select {
case msg := <-msgChan:
    handle(msg)
case <-ctx.Done():
    return ctx.Err()
case <-time.After(5 * time.Second):
    return fmt.Errorf("timeout")
}
```

## Interface Composition

- Compose small interfaces into larger ones:

```go
type Reader interface { Read(p []byte) (n int, err error) }
type Writer interface { Write(p []byte) (n int, err error) }
type ReadWriter interface { Reader; Writer }
```

## Functional Options

- Clean configuration pattern without breaking API compatibility:

```go
type Option func(*Server)
func WithTimeout(d time.Duration) Option {
    return func(s *Server) { s.timeout = d }
}
func NewServer(addr string, opts ...Option) *Server {
    s := &Server{addr: addr, timeout: 30 * time.Second}
    for _, opt := range opts { opt(s) }
    return s
}
```

## Middleware Pattern

```go
func LoggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        log.Printf("%s %s", r.Method, r.URL.Path)
        next.ServeHTTP(w, r)
    })
}
```

## sync.Pool for Hot Paths

```go
var bufPool = sync.Pool{New: func() any { return new(bytes.Buffer) }}
func process(data []byte) string {
    buf := bufPool.Get().(*bytes.Buffer)
    defer bufPool.Put(buf)
    buf.Reset()
    // use buf...
    return buf.String()
}
```

## Anti-Patterns

| Bad | Good | Reason |
|-----|------|--------|
| `time.Sleep` for goroutine sync | `sync.WaitGroup` | Sleep is fragile, slow |
| Unbuffered channel as mutex | `sync.Mutex` | Channel mutex is confusing |
| `sync.Mutex` in hot path | `sync.Pool` or lock-free | Mutex contention kills throughput |
