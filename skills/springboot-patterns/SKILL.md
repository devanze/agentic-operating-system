---
name: springboot-patterns
description: Spring Boot patterns covering layered architecture, JPA, REST controllers, security, testing, and configuration. Use when building Spring Boot applications.
---

# Spring Boot Patterns

## Layered Architecture
```
Controller → Service → Repository → Entity/DB
    ↓            ↓
   DTOs     Business Logic
```
- Controllers: HTTP concerns only
- Services: transaction boundaries, business logic
- Repositories: data access

## JPA Patterns
```java
@Entity
@Table(name = "orders")
public class Order {
    @Id @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "order", cascade = ALL)
    private List<OrderItem> items = new ArrayList<>();
}

// Repository
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);
}
```

## REST Controllers
```java
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {
    @GetMapping
    public Page<OrderDto> list(Pageable pageable) { ... }

    @GetMapping("/{id}")
    public OrderDto get(@PathVariable Long id) { ... }

    @PostMapping
    @ResponseStatus(CREATED)
    public OrderDto create(@Valid @RequestBody CreateOrderRequest req) { ... }
}
```

## Validation
```java
public record CreateOrderRequest(
    @NotNull Long userId,
    @NotEmpty List<OrderItemRequest> items
) {}
```
