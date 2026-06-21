# Rust Testing

## Unit Tests — #[cfg(test)]

```rust
// Unit tests live in the same file as the code
fn add(a: i32, b: i32) -> i32 { a + b }

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn add_returns_sum() {
        assert_eq!(add(2, 3), 5);
    }

    #[test]
    fn add_with_negative() {
        assert_eq!(add(-1, 1), 0);
    }
}
```

- `#[cfg(test)]` ensures tests are compiled only during `cargo test`
- `use super::*;` imports private functions for testing

## Integration Tests — tests/ Directory

```rust
// tests/api_test.rs  (outside src/, compiled as separate crate)
use my_app::create_app;

#[tokio::test]
async fn test_health_endpoint() {
    let app = create_app().await;
    let response = app.get("/health").await;
    assert!(response.status().is_success());
}
```

## Property-based Testing with proptest

```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn sort_never_loses_elements(mut xs: Vec<i32>) {
        xs.sort();
        // property: sorted vec has same length
        prop_assert_eq!(xs.len(), xs.iter().dedup().count() + xs.len() - xs.iter().dedup().count());
    }

    #[test]
    fn utf8_roundtrip(s: String) {
        let bytes = s.as_bytes();
        let decoded = String::from_utf8(bytes.to_vec()).unwrap();
        prop_assert_eq!(s, decoded);
    }
}
```

## Mocking with mockall

```rust
#[automock]
trait UserRepository {
    fn find_by_id(&self, id: u32) -> Option<User>;
}

#[test]
fn test_user_service() {
    let mut mock = MockUserRepository::new();
    mock.expect_find_by_id()
        .with(predicate::eq(42))
        .times(1)
        .returning(|_| Some(User { id: 42, name: "Alice".into() }));

    let service = UserService::new(mock);
    let user = service.get_user(42);
    assert_eq!(user.name, "Alice");
}
```

## Doc Tests (Examples in Docs)

```rust
/// Adds two numbers together.
///
/// ```
/// use my_crate::add;
/// assert_eq!(add(2, 3), 5);
/// ```
pub fn add(a: i32, b: i32) -> i32 { a + b }
```

- `cargo test` runs doc tests — they must compile and pass

## should_panic for Expected Failures

```rust
#[test]
#[should_panic(expected = "divide by zero")]
fn divide_by_zero() {
    divide(1, 0);
}
```

## Benchmarking with Criterion

```rust
use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn bench_parse(c: &mut Criterion) {
    c.bench_function("parse config", |b| {
        b.iter(|| parse_config(black_box(":8080")))
    });
}

criterion_group!(benches, bench_parse);
criterion_main!(benches);
```

## Anti-Patterns

| Bad | Good | Reason |
|-----|------|--------|
| Integration tests that duplicate unit tests | Unit tests for logic, integration for flows | Different granularity, different purpose |
| `#[ignore]` for flaky tests | Fix the flakiness (timeout, cleanup) | Ignored tests rot and are forgotten |
| Hard-coded test data in code | `serde_json::from_str` for test fixtures | Fixture files are reusable and readable |
