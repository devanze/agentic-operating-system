# React Hooks Rules

## CRITICAL — Hook Rules

### Rules of Hooks
- Hooks must be called at the top level of a component or custom hook
- Never call hooks inside conditions (`if`, `for`, `&&`), loops, or after early return
- Never call hooks in regular functions — only React components or custom hooks

### Custom Hooks
- Must be prefixed with `use` (`useAuth`, `useDebounce`)
- Return stable references with `useMemo`/`useCallback` when used in dependency arrays
- Document the hook's contract: parameters, return value, side effects

## HIGH — Hook Correctness

### useEffect Dependencies
```tsx
// BAD — missing dependency
useEffect(() => {
  fetchUser(userId)
}, []) // userId used but not in deps

// GOOD — complete deps
useEffect(() => {
  fetchUser(userId)
}, [userId])
```

### Cleanup
```tsx
// BAD — no cleanup
useEffect(() => {
  const timer = setInterval(tick, 1000)
}, [])

// GOOD — cleanup
useEffect(() => {
  const timer = setInterval(tick, 1000)
  return () => clearInterval(timer)
}, [])
```

### Derived State
```tsx
// BAD — effect for derived state
useEffect(() => {
  setFullName(`${firstName} ${lastName}`)
}, [firstName, lastName])

// GOOD — compute during render
const fullName = `${firstName} ${lastName}`
```

### Stale Closures
```tsx
// BAD — stale closure in async handler
useEffect(() => {
  setTimeout(() => console.log(count), 1000)
}, []) // empty deps — count is stale

// GOOD — functional updater
useEffect(() => {
  const id = setTimeout(() => setCount(c => c + 1), 1000)
  return () => clearTimeout(id)
}, [])
```

## Anti-Patterns

| Anti-Pattern | Why Wrong | Fix |
|-------------|-----------|-----|
| `useEffect` chain (A sets state → B fires → C fires) | Unnecessary re-renders, hard to debug | Derive state during render, useReducer |
| Initializing state from prop without `key` | State doesn't reset when prop changes | Add `key={propValue}` on parent |
| `useCallback`/`useMemo` without measurement | Premature optimization, adds complexity | Profile first, memoize only hot paths |
| `useContext` for high-frequency values | All consumers re-render on every change | Split context, use external state manager |
