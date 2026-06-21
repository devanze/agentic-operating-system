# Kotlin Coding Style

## Naming
- Classes: `PascalCase` (e.g., `UserRepository`, `OrderService`)
- Functions: `camelCase` (e.g., `getUserById()`, `formatCurrency()`)
- Constants: `UPPER_SNAKE_CASE` in companion/object (e.g., `MAX_RETRY_COUNT`)
- Extension functions: `camelCase` reflecting the receiver (e.g., `String.isValidEmail()`)
- Files: `PascalCase.kt` matching top-level class (e.g., `UserService.kt`)

## Formatting
- 4-space indentation (Kotlin default)
- Opening brace on same line as declaration
- No trailing semicolons
- Max 120 characters per line
- One blank line between top-level declarations

## Language-Specific Rules
- Use `data class` for DTOs/value objects:
```kotlin
data class UserResponse(
    val id: Long,
    val email: String,
    val name: String?,
    val createdAt: Instant
)
```
- Prefer extension functions over utility classes:
```kotlin
// BAD — utility companion
object StringUtils {
    fun isEmail(s: String): Boolean = ...
}

// GOOD — extension function
fun String.isValidEmail(): Boolean = ...
```
- Use `sealed class` or `sealed interface` for closed hierarchies:
```kotlin
sealed class ApiResult<out T> {
    data class Success<T>(val data: T) : ApiResult<T>()
    data class Error(val message: String, val code: Int) : ApiResult<Nothing>()
}
```
- Prefer `withContext` for switching dispatchers:
```kotlin
suspend fun fetchData(): List<User> = withContext(Dispatchers.IO) {
    api.getUsers()
}
```

## Anti-Patterns
- Using `!!` (double-bang) — use safe calls `?.` or Elvis `?:`
- Public mutable collections (`val list = mutableListOf()`) — expose as read-only
- Using `object` for stateless utility functions — use top-level functions
- Long chained `let` calls — extract to named variables

## Tooling
- Linter: detekt (static analysis) or ktlint (formatting)
- Formatter: ktlint or IntelliJ Kotlin formatter
- Type checker: IntelliJ compiler or Kotlin compiler with `-Werror`
