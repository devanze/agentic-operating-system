---
name: rust-patterns
description: Rust patterns covering ownership, borrowing, lifetimes, error handling with Result/Option, traits, iterators, concurrency with async/tokio, and testing. Use when writing or reviewing Rust code.
---

# Rust Patterns

## Ownership & Borrowing
- Borrow (`&T`, `&mut T`) over clone when possible
- Use `Cow<'_, str>` for optional ownership
- `Rc<T>` for shared ownership (single-thread), `Arc<T>` for multi-thread
- Avoid `Arc<Mutex<T>>` unless truly needed

## Error Handling
- `Result<T, E>` for recoverable errors, `panic!` only for unrecoverable
- `?` operator to propagate errors
- `thiserror` for library error types, `anyhow` for application code
- `.context()` to add error context

## Traits & Generics
- Trait bounds: `fn foo<T: Display>(t: T)` or `fn foo(t: impl Display)`
- Associated types for one-to-one trait-type relationships
- Blanket implementations: `impl<T: Display> ToString for T {}`

## Iterators
- Lazy: `iter().map().filter().collect()`
- Consuming adapters: `sum()`, `count()`, `fold()`, `collect()`
- `Iterator` trait for custom iteration

## Concurrency
- `tokio::spawn` for async tasks
- Channels: `mpsc`, `oneshot`, `broadcast`, `watch`
- `tokio::select!` for racing operations
- `Mutex<T>` from `tokio::sync` for async, `std::sync` for sync
