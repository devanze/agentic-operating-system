---
name: quarkus-patterns
description: Quarkus patterns covering reactive programming, Panache, CDI, RESTEasy, native compilation, and testing. Use when building Quarkus Java applications.
---

# Quarkus Patterns

## JAX-RS Endpoints
```java
@Path("/api/v1/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {
    @Inject UserService service;

    @GET
    public List<UserDto> list() { ... }

    @POST
    @Transactional
    public Response create(@Valid CreateUserRequest req) { ... }
}
```

## Panache (Active Record)
```java
@Entity
public class User extends PanacheEntity {
    public String name;
    public String email;

    public static User findByEmail(String email) {
        return find("email", email).firstResult();
    }
}
```

## CDI (Dependency Injection)
```java
@ApplicationScoped
public class UserService {
    @Inject ManagedExecutor executor;

    @Transactional
    public User create(CreateUserRequest req) { ... }
}
```

## Reactive
```java
@GET
public Uni<List<User>> list() {
    return User.findAll().list();
}

// Combine async operations
Uni<User> user = service.findById(id);
Uni<List<Order>> orders = orderService.findByUser(id);
return Uni.combine().all().unis(user, orders).asTuple()
    .map(t -> new UserWithOrders(t.getItem1(), t.getItem2()));
```

## Testing
```java
@QuarkusTest
class UserResourceTest {
    @Test
    void testList() {
        given()
            .when().get("/api/v1/users")
            .then().statusCode(200);
    }
}
```
