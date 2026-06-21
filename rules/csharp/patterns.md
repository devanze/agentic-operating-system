# C# Patterns

## Core Patterns

### LINQ for Data Queries
```csharp
var activeUsers = _context.Users
    .Where(u => u.IsActive && u.LastLogin > cutoff)
    .OrderByDescending(u => u.LastLogin)
    .Select(u => new UserSummary(u.Id, u.Name, u.Email))
    .Take(20)
    .ToList();

// Method syntax preferred over query syntax
// Use .AsNoTracking() for read-only queries in EF Core
```

### Dependency Injection with Options Pattern
```csharp
// appsettings.json
public class JwtOptions
{
    public const string SectionName = "Jwt";
    public string Secret { get; init; } = "";
    public int ExpiryHours { get; init; } = 24;
}

// Program.cs — registration
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.AddScoped<ITokenService, TokenService>();

// Service — injection
public class TokenService(IOptions<JwtOptions> jwtOptions) : ITokenService
{
    private readonly JwtOptions _options = jwtOptions.Value;
    public string GenerateToken(User user) { /* uses _options.Secret */ }
}
```

### Minimal API Endpoints
```csharp
// Program.cs
var app = builder.Build();

var api = app.MapGroup("/api/users").WithTags("Users");

api.MapGet("/", async (IUserService service) =>
    Results.Ok(await service.GetAllAsync()));

api.MapGet("/{id:int}", async (int id, IUserService service) =>
{
    var user = await service.GetByIdAsync(id);
    return user is null ? Results.NotFound() : Results.Ok(user);
});

api.MapPost("/", async (CreateUserRequest req, IUserService service) =>
{
    var user = await service.CreateAsync(req);
    return Results.Created($"/api/users/{user.Id}", user);
});
```

## Architecture
- Clean Architecture: `Domain/` (entities), `Application/` (use cases), `Infrastructure/` (EF, APIs), `Web/` (controllers)
- Repository pattern over EF Core DbContext
- MediatR for CQRS in complex applications
- FluentValidation for request validation

## Common Idioms
- `??` (null-coalescing): `return value ?? "default"`
- `?.` (null-conditional): `user?.Name?.Length`
- Pattern matching: `if (result is { IsSuccess: true } success) { ... }`
- `StringBuilder` for heavy string concatenation
- `yield return` for lazy enumeration

## Anti-Patterns
- Putting business logic in controllers — use application services
- Static methods for database access — breaks testability
- Ignoring `CancellationToken` in async methods — always forward it
- Using `Task.Wait()` or `Task.Result` — always use `await`
