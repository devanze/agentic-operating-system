# Java Testing

## JUnit 5 Basics

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {
    @Test
    void add_returnsSum_whenPositiveNumbers() {
        assertEquals(5, calculator.add(2, 3));
    }
}
```

## Parameterized Tests

```java
@ParameterizedTest
@CsvSource({
    "2, 3, 5",
    "0, 0, 0",
    "-1, 1, 0",
    "100, -50, 50"
})
void add_returnsExpected_whenVariousInputs(int a, int b, int expected) {
    assertEquals(expected, calculator.add(a, b));
}

@ParameterizedTest
@ValueSource(strings = { "", "invalid-email", "@no-local" })
void validate_rejects_whenInvalidEmail(String email) {
    assertFalse(validator.isValidEmail(email));
}
```

## Mockito: Mocks and Argument Captors

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void create_savesUser_whenValid() {
        var input = new CreateUserRequest("test@test.com", "John");
        when(userRepository.save(any())).thenReturn(new User(1L, "test@test.com", "John"));

        var result = userService.create(input);

        assertNotNull(result);
        assertEquals("test@test.com", result.email());
    }

    @Test
    void create_encryptsPassword() {
        var captor = ArgumentCaptor.forClass(User.class);
        userService.create(new CreateUserRequest("a@b.com", "pwd123"));

        verify(userRepository).save(captor.capture());
        assertNotEquals("pwd123", captor.getValue().password()); // encrypted
    }
}
```

## Test Fixtures with @BeforeEach

```java
class OrderServiceTest {
    private OrderService orderService;
    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User(1L, "test@test.com");
        orderService = new OrderService(new InMemoryOrderRepository());
    }
}
```

## Integration Tests with Testcontainers

```java
@Testcontainers
class UserRepositoryTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Test
    void findByEmail_returnsUser_whenExists() {
        // test against real Postgres
    }
}
```

## Spring Boot Test Slices

```java
@WebMvcTest(UserController.class)
class UserControllerTest { /* web layer only */ }

@DataJpaTest
class UserRepositoryTest { /* JPA layer only */ }
```

## Test Naming Convention

```java
// Pattern: methodName_stateUnderTest_expectedBehavior
void findById_whenUserExists_returnsUser()
void findById_whenUserNotFound_throwsException()
void create_whenEmailTaken_throwsConflictException()
```

## Anti-Patterns

| Bad | Good | Reason |
|-----|------|--------|
| `@SpringBootTest` for everything | `@WebMvcTest` / `@DataJpaTest` | Slow context loading |
| `verifyNoMoreInteractions()` | Explicit `verify()` on relevant mocks | Fragile to legitimate additions |
| Tests depending on test order | `@TestMethodOrder(MethodName)` | Parallel execution breaks order |
