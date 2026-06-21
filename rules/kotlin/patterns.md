# Kotlin Patterns

## Core Patterns

### Sealed Classes for State Management
```kotlin
sealed class UiState<out T> {
    data object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val message: String, val throwable: Throwable? = null) : UiState<Nothing>()
}

// Usage
when (state) {
    is UiState.Loading -> showLoading()
    is UiState.Success -> showData(state.data)
    is UiState.Error -> showError(state.message)
}
```

### Flow for Reactive Data
```kotlin
class UserRepository(private val api: UserApi) {
    fun getUsers(): Flow<List<User>> = flow {
        emit(api.getUsers()) // suspend call
    }.flowOn(Dispatchers.IO)

    fun searchUsers(query: String): Flow<List<User>> = flow {
        val results = api.search(query)
        emit(results)
    }.debounce(300) // wait for typing pause
}
```

### Scope Functions for Clean Code
```kotlin
// apply — configure object
val intent = Intent().apply {
    putExtra("user_id", userId)
    putExtra("action", "edit")
}

// let — transform non-null
user?.let {
    cache.put(it.id, it)
    logger.info("Cached user ${it.name}")
}

// run — compute result
val timing = measureTimeMillis {
    run { expensiveOperation() }
}
```

## Architecture
- MVVM in Android: `View` (Fragment/Compose) → `ViewModel` (StateFlow) → `Repository` → `DataSource`
- Clean Architecture: `domain/` (use cases, entities), `data/` (repositories, DTOs), `presentation/` (view models)
- Dependency injection via Hilt or Koin

## Common Idioms
- `require()` and `check()` for preconditions: `requireNotNull(value) { "Value required" }`
- `use()` for Closeable resources: `BufferedReader(File("data.txt").reader()).use { it.readText() }`
- Destructuring: `val (id, name) = user`
- Typealias for complex types: `typealias UserMap = Map<Long, User>`

## Anti-Patterns
- Overusing `also` — prefer named intermediate variables
- Mutable state exposed globally — use StateFlow/MutableStateFlow privately
- Using `runBlocking` in production code — only for tests
- Deeply nested `let` chains (let-ception)
