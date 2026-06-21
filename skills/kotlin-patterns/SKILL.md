---
name: kotlin-patterns
description: Kotlin patterns covering scope functions, coroutines, flows, sealed classes, extension functions, and null safety. Use when writing or reviewing Kotlin code.
---

# Kotlin Patterns

## Scope Functions
- `let` — transform non-null: `value?.let { process(it) }`
- `apply` — configure object: `Intent().apply { putExtra("key", value) }`
- `run` — compute and return: `val result = run { ... }`
- `also` — side effect: `val x = create().also { log(it) }`
- `with` — operate on non-null receiver

## Null Safety
- Safe calls: `user?.address?.city`
- Elvis operator: `val name = user.name ?: "Unknown"`
- `require` and `check` for preconditions
- Platform types: treat Java returns as nullable explicitly

## Coroutines
```kotlin
// Structured concurrency
viewModelScope.launch {
    val result = withContext(Dispatchers.IO) { fetchData() }
    updateUI(result)
}

// Parallel decomposition
val (users, posts) = coroutineScope {
    val users = async { repo.getUsers() }
    val posts = async { repo.getPosts() }
    users.await() to posts.await()
}
```

## Flows
- `flow {}` builder for cold streams
- `StateFlow` for state, `SharedFlow` for events
- Operators: `map`, `filter`, `flatMapLatest`, `catch`, `retry`
