# Java Patterns

## Layered Architecture

```
Controller (HTTP) → Service (Business Logic) → Repository (Data Access)
```

- Controllers: parse requests, format responses, no business logic
- Services: `@Transactional` boundary, orchestration
- Repositories: data access (Spring Data JPA, JDBC, etc.)

## Builder Pattern

```java
// Builder for complex construction
User user = User.builder()
    .email("john@example.com")
    .name("John")
    .roles(List.of("ADMIN"))
    .build();
```

- Use Lombok `@Builder` or write custom builders
- Essential for classes with 4+ optional fields

## Factory Pattern

```java
public interface NotificationFactory {
    Notification create(String type);
}

@Component
public class NotificationFactoryImpl implements NotificationFactory {
    @Override
    public Notification create(String type) {
        return switch (type) {
            case "email" -> new EmailNotification();
            case "sms" -> new SMSNotification();
            case "push" -> new PushNotification();
            default -> throw new IllegalArgumentException("Unknown: " + type);
        };
    }
}
```

## Strategy Pattern

```java
public interface PricingStrategy {
    BigDecimal calculate(BigDecimal basePrice);
}

@Component
public class PremiumPricing implements PricingStrategy {
    public BigDecimal calculate(BigDecimal base) {
        return base.multiply(BigDecimal.valueOf(0.8)); // 20% off
    }
}
```

## Constructor Injection (Preferred over @Autowired)

```java
// BAD — field injection (hard to test)
@Service
public class UserService {
    @Autowired private UserRepository repo;
}

// GOOD — constructor injection (testable, immutable)
@Service
public class UserService {
    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }
}
```

## Global Error Handling

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(NOT_FOUND)
            .body(new ErrorResponse("NOT_FOUND", ex.getMessage()));
    }
}
```

## Async with CompletableFuture

```java
CompletableFuture<User> userFuture = userService.findById(id);
CompletableFuture<Order> orderFuture = orderService.findByUserId(id);

CompletableFuture<UserWithOrders> combined = userFuture
    .thenCombine(orderFuture, UserWithOrders::new);
```

## Anti-Patterns

| Bad | Good | Reason |
|-----|------|--------|
| `@Autowired` on fields | Constructor injection | Field injection hides deps, breaks testing |
| `FetchType.EAGER` on `@OneToMany` | `FetchType.LAZY` | Eager loads everything, kills performance |
| `@Transactional` on controller methods | `@Transactional` on service layer | Controller should not own tx boundaries |
