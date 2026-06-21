# Rust Coding Style

## Formatting & Linting

- `rustfmt` + `clippy` always — run before every commit
- `cargo fmt --check` and `cargo clippy -- -D warnings` in CI
- Clippy catches: unnecessary clones, needless references, style violations

## Ownership Rules (Core to Rust)

```rust
// Each value has exactly one owner at a time
let s1 = String::from("hello");
let s2 = s1;           // s1 is MOVED to s2 — s1 is now invalid
// println!("{s1}");   // COMPILE ERROR: borrow of moved value

// Clone for explicit deep copy
let s1 = String::from("hello");
let s2 = s1.clone();   // s1 is still valid
println!("{s1}, {s2}");
```

## Borrowing Patterns

```rust
// &T — immutable borrow (many readers)
fn length(s: &String) -> usize { s.len() }

// &mut T — mutable borrow (one writer)
fn append_world(s: &mut String) { s.push_str(" world"); }

// BAD — mixing mutable and immutable references
let mut s = String::from("hello");
let r1 = &s;           // immutable borrow
let r2 = &mut s;       // COMPILE ERROR: cannot borrow as mutable while immutable
println!("{r1}");

// GOOD — scoped borrows
let r1 = &s;
println!("{r1}");      // immutable borrow DROPS here
let r2 = &mut s;       // OK — no active immutable borrows
r2.push_str(" world");
```

## match Exhaustiveness (Compile-time Safety)

```rust
enum Status { Active, Inactive, Pending }

// BAD — non-exhaustive match
fn status_str(s: Status) -> &'static str {
    match s {
        Status::Active => "active",
        // COMPILE WARNING: missing Inactive, Pending
    }
}

// GOOD — exhaustive, with catch-all
fn status_str(s: Status) -> &'static str {
    match s {
        Status::Active => "active",
        Status::Inactive => "inactive",
        Status::Pending => "pending",
    }
}
```

## if let / while let for Single-arm Matches

```rust
// BAD — match for a single variant
match optional_value {
    Some(val) => process(val),
    None => {}
}

// GOOD — if let is concise
if let Some(val) = optional_value {
    process(val);
}

// while let for iterator patterns
let mut iter = numbers.iter();
while let Some(n) = iter.next() {
    println!("{n}");
}
```

## Error Handling: Result and ?

```rust
// BAD — unwrap in production code
let data = file.read_to_string().unwrap();  // panics on error

// GOOD — propagate error with ?
fn read_config(path: &str) -> Result<Config, io::Error> {
    let content = std::fs::read_to_string(path)?;
    Ok(serde_json::from_str(&content)?)
}

// Use thiserror for lib errors, anyhow for apps
#[derive(thiserror::Error, Debug)]
pub enum AppError {
    #[error("not found: {0}")]
    NotFound(String),
}
```

## Prefer &str over &String, &[T] over &Vec<T>

```rust
// GOOD — more flexible
fn greet(name: &str) -> String { format!("Hello, {name}!") }
// Works with: greet("world"), greet(&String::from("world"))

// BAD — too restrictive
fn greet(name: &String) -> String { format!("Hello, {name}!") }
```

## Anti-Patterns

| Bad | Good | Reason |
|-----|------|--------|
| `unwrap()` in library code | `?` operator or `.context()` | Panics are unrecoverable for callers |
| `&Vec<T>` as parameter | `&[T]` | &[T] accepts slices, arrays, Vec |
| `clone()` to satisfy borrow checker | Restructure lifetimes or use `Cow` | Clone is expensive, avoid if possible |
| `return Err(e.into())` | `e.context("msg")?` via anyhow | Richer error context for debugging |
