# Spring Boot Testing

## Framework
- Primary: JUnit 5 with `@Test` annotation
- Mocking: Mockito with `@Mock`, `@InjectMocks`, `@Captor`
- Integration: `@SpringBootTest` with `@AutoConfigureMockMvc` or `TestRestTemplate`

## Conventions
- Test classes: `XxxTest.java` suffix (e.g., `UserServiceTest.java`, `UserControllerTest.java`)
- Mirror source tree in `src/test/java/`
- Use `@DisplayName` for human-readable test descriptions

## Patterns

### Service Unit Testing with Mockito
```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @InjectMocks private UserService userService;

    @Test
    @DisplayName("create throws exception when email already exists")
    void create_duplicateEmail_throwsException() {
        var req = new CreateUserRequest("existing@test.com", "pass123", "Test");
        when(userRepository.existsByEmail(req.email())).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> userService.create(req));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("create saves user and returns response")
    void create_validRequest_savesUser() {
        var req = new CreateUserRequest("new@test.com", "Strong1!", "Alice");
        when(userRepository.existsByEmail(req.email())).thenReturn(false);
        when(passwordEncoder.encode(req.password())).thenReturn("encoded");
        var saved = new User(1L, "new@test.com", "encoded", "Alice");
        when(userRepository.save(any())).thenReturn(saved);

        var response = userService.create(req);

        assertThat(response.email()).isEqualTo("new@test.com");
        assertThat(response.id()).isEqualTo(1L);
        verify(userRepository).save(argThat(u -> u.getEmail().equals("new@test.com")));
    }
}
```

### Controller Integration Testing
```java
@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {
    @Autowired private MockMvc mockMvc;
    @MockitoBean private UserService userService;

    @Test
    @DisplayName("GET /users/{id} returns 404 when user not found")
    void findById_notFound_returns404() throws Exception {
        when(userService.findById(99L)).thenThrow(new ResourceNotFoundException("User", 99L));

        mockMvc.perform(get("/api/v1/users/99"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.message").value("User with id 99 not found"));
    }

    @Test
    @DisplayName("POST /users creates user and returns 201")
    void create_validRequest_returns201() throws Exception {
        var req = new CreateUserRequest("new@test.com", "Strong1!", "Bob");
        var resp = new UserResponse(1L, "new@test.com", "Bob");
        when(userService.create(any())).thenReturn(resp);

        mockMvc.perform(post("/api/v1/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"email":"new@test.com","password":"Strong1!","name":"Bob"}
                """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.email").value("new@test.com"));
    }
}
```

## Coverage
- Target: 90%+ for services, 80%+ for controllers
- Tool: JaCoCo with Maven/Gradle plugin
- CI: `mvn verify` or `gradle check` — fails build if coverage below threshold
- Focus: service business logic, validation flows, exception paths
