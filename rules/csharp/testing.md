# C# Testing

## Framework
- Primary: xUnit (`[Fact]`, `[Theory]`, `[InlineData]`)
- Mocking: Moq or NSubstitute
- Assertions: FluentAssertions for expressive matchers
- Integration: `Microsoft.AspNetCore.Mvc.Testing` with `WebApplicationFactory`

## Conventions
- Test files: `XxxTests.cs` suffix (e.g., `UserServiceTests.cs`, `UserControllerTests.cs`)
- Test projects: `ProjectName.Tests` naming convention
- Mirror solution structure in test project

## Patterns

### Service Unit Testing with Moq
```csharp
using FluentAssertions;
using Moq;

public class UserServiceTests
{
    private readonly Mock<IUserRepository> _repoMock = new();
    private readonly UserService _sut;

    public UserServiceTests()
    {
        _sut = new UserService(_repoMock.Object);
    }

    [Fact]
    public async Task GetByIdAsync_WhenUserExists_ReturnsUserResponse()
    {
        // Arrange
        var user = new User { Id = 1, Email = "test@test.com", Name = "Alice" };
        _repoMock.Setup(r => r.FindByIdAsync(1))
                 .ReturnsAsync(user);

        // Act
        var result = await _sut.GetByIdAsync(1);

        // Assert
        result.Should().NotBeNull();
        result.Email.Should().Be("test@test.com");
        result.Name.Should().Be("Alice");
    }

    [Fact]
    public async Task GetByIdAsync_WhenUserNotFound_ThrowsNotFoundException()
    {
        _repoMock.Setup(r => r.FindByIdAsync(99))
                 .ReturnsAsync((User?)null);

        await _sut.Invoking(s => s.GetByIdAsync(99))
            .Should().ThrowAsync<NotFoundException>();
    }
}
```

### Integration Testing with WebApplicationFactory
```csharp
public class UserApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public UserApiTests(WebApplicationFactory<Program> factory)
    {
        _client = factory
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    services.RemoveAll<DbContextOptions<AppDbContext>>();
                    services.AddDbContext<AppDbContext>(opts =>
                        opts.UseInMemoryDatabase("TestDb"));
                });
            })
            .CreateClient();
    }

    [Fact]
    public async Task Post_CreateUser_ReturnsCreated()
    {
        var payload = new { Email = "new@test.com", Password = "Strong1!", Name = "Bob" };
        var json = JsonContent.Create(payload);

        var response = await _client.PostAsync("/api/users", json);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var user = await response.Content.ReadFromJsonAsync<UserResponse>();
        user.Should().NotBeNull();
        user!.Email.Should().Be("new@test.com");
    }
}
```

## Coverage
- Target: 90%+ for business logic, 80%+ for controllers
- Tool: Coverlet (NuGet) with `dotnet test --collect:"XPlat Code Coverage"`
- Reports: `reportgenerator` for HTML reports
- CI: `dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=opencover`
