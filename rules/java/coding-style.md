# Java Coding Style

## Modern Java Features

### Records for Immutable Data (Java 16+)

```java
// BAD — boilerplate value class
public class Point {
    private final int x;
    private final int y;
    public Point(int x, int y) { this.x = x; this.y = y; }
    public int getX() { return x; }
    public int getY() { return y; }
    // equals, hashCode, toString...
}

// GOOD — concise, immutable, all methods generated
public record Point(int x, int y) {}
```

### Pattern Matching with instanceof (Java 17+)

```java
// BAD — explicit cast
if (obj instanceof User) {
    User user = (User) obj;
    return user.email();
}

// GOOD — pattern variable
if (obj instanceof User user) {
    return user.email();
}
```

### Switch Expressions (Java 17+)

```java
// BAD — switch statement with fall-through
String result;
switch (status) {
    case ACTIVE: result = "active"; break;
    case PENDING: result = "pending"; break;
    default: result = "unknown";
}

// GOOD — switch expression, no fall-through
String result = switch (status) {
    case ACTIVE -> "active";
    case PENDING -> "pending";
    default -> "unknown";
};
```

## Sealed Classes for Restricted Hierarchies

```java
public sealed interface Shape permits Circle, Rectangle, Triangle {}
public record Circle(double radius) implements Shape {}
public record Rectangle(double width, double height) implements Shape {}
```

## Optional Usage

- Use `Optional` for **return types** that may be empty, never for fields or parameters:

```java
// GOOD
public Optional<User> findById(long id) { ... }

// BAD — Optional field
public class Order {
    private Optional<String> note; // NO — serialization issues
}

// BAD — Optional parameter
public void process(Optional<Discount> discount) { ... } // NO — caller may pass null
```

## Stream Chains

```java
// GOOD — declarative pipeline
List<String> names = users.stream()
    .filter(u -> u.isActive())
    .map(User::getName)
    .sorted()
    .collect(Collectors.toList());

// BAD — imperative with mutating list
List<String> names = new ArrayList<>();
for (User u : users) {
    if (u.isActive()) names.add(u.getName());
}
Collections.sort(names);
```

## Lombok — Use with Caution

- Prefer records over `@Data` for simple data carriers
- `@Builder` is acceptable for classes with many fields
- `@Slf4j` is fine for logging
- Avoid `@Setter` on entities (mutability leaks)

## var for Local Variables

```java
// GOOD — type is obvious from right side
var users = userService.findAll();
var names = new ArrayList<String>();

// BAD — type is unclear
var result = process();  // What type is result?
```

## Anti-Patterns

| Bad | Good | Reason |
|-----|------|--------|
| `List.of()` unmodifiable fed to mutable consumer | `new ArrayList<>(List.of(...))` | UnsupportedOperationException at runtime |
| `Optional.ofNullable(x).orElse(null)` | `x != null ? x : defaultValue` | Optional wrapping null defeats the point |
| Raw `List` without generic | `List<String>` | Type safety enforced at compile time |
