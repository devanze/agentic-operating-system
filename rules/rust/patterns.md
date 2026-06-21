# Rust Patterns

## Newtype Pattern for Type Safety

```rust
// BAD — primitives are interchangeable
fn send_email(to: String, body: String) { ... }
send_email("hello world".into(), "user@example.com".into()); // swapped args — compiles!

// GOOD — newtypes prevent misuse
struct Email(String);
struct Body(String);

fn send_email(to: Email, body: Body) { ... }
send_email(Email("user@example.com".into()), Body("hello".into())); // can't swap
```

## Builder Pattern

```rust
#[derive(Debug)]
struct Request {
    url: String,
    method: String,
    headers: Vec<(String, String)>,
    body: Option<String>,
}

struct RequestBuilder {
    url: Option<String>,
    method: String,
    headers: Vec<(String, String)>,
    body: Option<String>,
}

impl RequestBuilder {
    fn new() -> Self { Self { url: None, method: "GET".into(), headers: vec![], body: None } }
    fn url(mut self, url: &str) -> Self { self.url = Some(url.into()); self }
    fn header(mut self, k: &str, v: &str) -> Self { self.headers.push((k.into(), v.into())); self }
    fn body(mut self, body: &str) -> Self { self.body = Some(body.into()); self }
    fn build(self) -> Result<Request, &'static str> {
        Ok(Request { url: self.url.ok_or("url required")?, method: self.method, headers: self.headers, body: self.body })
    }
}
```

## Typestate Pattern (Compile-time State Machine)

```rust
struct DoorClosed;
struct DoorOpen;

struct Door<State> { _state: std::marker::PhantomData<State> }

impl Door<DoorClosed> {
    fn open(self) -> Door<DoorOpen> { Door { _state: PhantomData } }
}
impl Door<DoorOpen> {
    fn close(self) -> Door<DoorClosed> { Door { _state: PhantomData } }
}
// Cannot call .close() on a closed door — compile error
```

## Async with Tokio

```rust
#[tokio::main]
async fn main() -> Result<()> {
    // Concurrent tasks
    let (user, orders) = tokio::join!(
        fetch_user(1),
        fetch_orders(1),
    );

    // Channels for communication
    let (tx, mut rx) = tokio::sync::mpsc::channel(100);

    tokio::spawn(async move {
        loop {
            let msg = rx.recv().await;
            process(msg).await;
        }
    });

    Ok(())
}
```

## Actor Pattern with Message Passing

```rust
enum DbMessage {
    GetUser(u32, tokio::sync::oneshot::Sender<User>),
}

async fn db_actor(mut rx: mpsc::Receiver<DbMessage>) {
    while let Some(msg) = rx.recv().await {
        match msg {
            DbMessage::GetUser(id, reply) => {
                let user = db::get_user(id).await;
                let _ = reply.send(user);
            }
        }
    }
}
```

## Extension Traits

```rust
trait StringExt {
    fn is_email(&self) -> bool;
}

impl StringExt for str {
    fn is_email(&self) -> bool {
        self.contains('@')
    }
}
// Now "user@example.com".is_email() works
```

## Anti-Patterns

| Bad | Good | Reason |
|-----|------|--------|
| `Arc<Mutex<T>>` as default shared state | Channels or `tokio::sync::RwLock` | Mutex contention kills async perf |
| Blocking `std::sync::Mutex` in async code | `tokio::sync::Mutex` | Blocking in async executor stalls tasks |
| Trait objects `Box<dyn Trait>` for hot path | `impl Trait` generics (static dispatch) | Dynamic dispatch has runtime cost |
