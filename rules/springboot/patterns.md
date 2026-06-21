# Spring Boot Patterns

## Core Patterns

### Layered Architecture (Controller → Service → Repository)
```java
// Controller — HTTP concerns only
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest req) {
        return ResponseEntity.status(201).body(userService.create(req));
    }
}

// Service — business logic + transactions
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse findById(Long id) {
        return userRepository.findById(id)
            .map(UserResponse::from)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    @Transactional
    public UserResponse create(CreateUserRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new DuplicateResourceException("Email already taken");
        }
        var user = new User(req.email(), passwordEncoder.encode(req.password()), req.name());
        return UserResponse.from(userRepository.save(user));
    }
}

// Repository — data access
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

### JPA Entity Design
```java
@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();
}
```

## Architecture
- Standard Spring Boot project: `controller/`, `service/`, `repository/`, `entity/`, `dto/`, `config/`, `exception/`
- Global exception handler with `@RestControllerAdvice`
- Mapper layer with MapStruct for entity ↔ DTO conversion

## Common Idioms
- `@ExceptionHandler` in `@RestControllerAdvice` for consistent error responses
- `@ConfigurationProperties` for type-safe configuration binding
- `@Profile` for environment-specific beans
- `@Scheduled` with `@EnableScheduling` for periodic tasks

## Anti-Patterns
- Service layer calling other services that call repositories — keep chain shallow
- Anemic domain model with no business methods in entities
- Over-use of `@Transactional` on read operations
- Catching `Exception` instead of specific typed exceptions
