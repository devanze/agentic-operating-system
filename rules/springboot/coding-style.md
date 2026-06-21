# Spring Boot Coding Style

## Naming
- Classes: `PascalCase` (e.g., `UserService`, `OrderController`, `JwtTokenProvider`)
- Methods: `camelCase` (e.g., `findById()`, `createUser()`, `validateToken()`)
- Fields: `camelCase` (e.g., `firstName`, `createdAt`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_LOGIN_ATTEMPTS`)
- Configuration properties: `kebab-case` in YAML, `camelCase` in Java

## Formatting
- 4-space indentation
- Opening braces on same line (K&R style)
- Max 120 characters per line
- One blank line between methods
- Imports: static → Java → Spring → third-party → local

## Language-Specific Rules
- Prefer `record` classes for DTOs (Java 16+):
```java
public record CreateUserRequest(
    @NotBlank String email,
    @Size(min = 8) String password,
    @NotBlank String name
) {}
```
- Use constructor injection over field injection:
```java
// BAD — field injection
@Autowired private UserRepository userRepository;

// GOOD — constructor injection
@RequiredArgsConstructor
@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
}
```
- Use `@Validated` with groups for conditional validation:
```java
@PostMapping
public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest req) { ... }
```

## Anti-Patterns
- `@Autowired` on private fields — always use constructor injection
- Business logic in `@RestController` — extract to `@Service`
- Using `@Data` on JPA `@Entity` — `@Getter` + `@Setter` + `@EqualsAndHashCode` explicitly
- Ignoring transaction boundaries — use `@Transactional` on service layer

## Tooling
- Linter: Checkstyle with Google/Spring style rules
- Formatter: Spotless with `google-java-format`
- Analysis: IntelliJ inspections or SonarQube
