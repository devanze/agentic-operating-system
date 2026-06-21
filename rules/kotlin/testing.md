# Kotlin Testing

## Framework
- Primary: `kotlin.test` (JUnit 5 under the hood) with `kotest` or vanilla JUnit 5
- Mocking: `mockk` (Kotlin-first mocking library)
- Assertions: `kotest-assertions` for expressive matchers

## Conventions
- Test files: `XxxTest.kt` alongside source or in `src/test/kotlin/`
- Mirror source package structure
- Test method names: backtick-wrapped strings for readability

## Patterns

### Repository Testing with mockk
```kotlin
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Test
import kotlin.test.assertContains
import kotlin.test.assertEquals

class UserRepositoryTest {
    private val api = mockk<UserApi>()
    private val repository = UserRepository(api)

    @Test
    fun `getUsers returns mapped domain models`() = runTest {
        coEvery { api.getUsers() } returns listOf(
            UserApiDto(1, "alice@test.com", "Alice"),
            UserApiDto(2, "bob@test.com", "Bob"),
        )

        val users = repository.getUsers()

        assertEquals(2, users.size)
        assertEquals("Alice", users.first().name)
        coVerify(exactly = 1) { api.getUsers() }
    }
}
```

### ViewModel Testing with Turbine
```kotlin
import app.cash.turbine.test
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Test

class UserViewModelTest {
    @Test
    fun `state shows loading then success`() = runTest {
        val viewModel = UserViewModel(FakeUserRepository())

        viewModel.state.test {
            // Initial state
            assert(awaitItem() is UiState.Loading)
            // Users loaded
            val success = awaitItem()
            assert(success is UiState.Success)
            assertEquals(3, (success as UiState.Success).data.size)
            // Expect no more emissions
            awaitComplete()
        }
    }
}
```

### Flow Testing
```kotlin
@Test
fun `searchUsers emits debounced results`() = runTest {
    val repo = mockk<UserRepository>()
    coEvery { repo.searchUsers(any()) } returns listOf(User(1, "test"))

    val results = mutableListOf<List<User>>()
    repo.searchUsers("te").toList(results)

    assertContains(results.flatten().map { it.id }, 1)
}
```

## Coverage
- Target: 90%+ for ViewModels and services, 80%+ for repositories
- Tool: IntelliJ coverage runner or Jacoco with Gradle
- Commands: `./gradlew test jacocoTestReport` for coverage reports
- Focus: business logic, state transitions, error handling in ViewModels
