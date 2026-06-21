# C# Coding Style

## Naming
- Classes: `PascalCase` (e.g., `UserService`, `OrderController`)
- Methods: `PascalCase` (e.g., `GetUserById()`, `CalculateTotal()`)
- Local variables: `camelCase` (e.g., `userList`, `totalAmount`)
- Private fields: `_camelCase` prefix (e.g., `_userRepository`, `_logger`)
- Interfaces: `IPascalCase` prefix (e.g., `IUserRepository`, `IService`)
- Constants: `PascalCase` (e.g., `MaxRetryCount`, `DefaultTimeout`)

## Formatting
- 4-space indentation (no tabs)
- Opening braces on new line (Allman style)
- One statement per line
- Max 120 characters per line
- `var` when type is obvious from right side

## Language-Specific Rules
- Use `record` for immutable data objects:
```csharp
public record CreateUserRequest(
    string Email,
    string Password,
    [property: Required, StringLength(100)] string Name
);
```
- Use primary constructors for simple services:
```csharp
// Primary constructor (.NET 8+)
public class UserService(IUserRepository repo, ILogger<UserService> logger)
    : IUserService
{
    public async Task<UserResponse> GetByIdAsync(int id)
    {
        var user = await repo.FindByIdAsync(id);
        return user is null
            ? throw new NotFoundException($"User {id} not found")
            : UserResponse.From(user);
    }
}
```
- Prefer `async Task` over `async void` (only event handlers use `async void`):
```csharp
public async Task<UserResponse> CreateAsync(CreateUserRequest request)
{
    var user = new User(request.Email, request.Password, request.Name);
    return UserResponse.From(await _repo.CreateAsync(user));
}
```

## Anti-Patterns
- Using `Exception` as control flow — use `Result<T>` pattern
- Public fields — always use properties with `{ get; init; }`
- Deep inheritance hierarchies — prefer interfaces and composition
- Catching `Exception` broadly — catch specific exception types

## Tooling
- Linter: `dotnet format` with analyzers or Roslyn analyzers
- Formatter: `dotnet format whitespace` or `.editorconfig` rules
- Analyzer: `Microsoft.CodeAnalysis.NetAnalyzers` with `<EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>`
